import type { Auth } from 'firebase-admin/auth'
import { FieldValue, type Firestore } from 'firebase-admin/firestore'
import type { getStorage } from 'firebase-admin/storage'
import type { Resolution } from './validate'

type Bucket = ReturnType<ReturnType<typeof getStorage>['bucket']>

export interface Deps {
  db: Firestore
  auth: Auth
  bucket: Bucket
}

export type ModerationCode = 'not-found' | 'failed-precondition' | 'permission-denied'

// El detalle es un identificador estable; el cliente lo traduce para la persona.
export class ModerationError extends Error {
  constructor(
    public readonly code: ModerationCode,
    public readonly detail: string,
  ) {
    super(detail)
  }
}

export type AuditAction =
  | 'unpublish'
  | 'remove_cv'
  | 'suspend'
  | 'unsuspend'
  | 'resolve_report'
  | 'dismiss_report'
  | 'delete_account'
  | 'grant_admin'
  | 'revoke_admin'

interface AuditEvent {
  actorUid: string
  action: AuditAction
  targetUid: string
  reason?: string | undefined
  selfService?: boolean
}

const cvPath = (uid: string) => `cvs/${uid}/cv.pdf`

// Registro de auditoria: solo identificadores, nunca contenido de perfiles ni de CV.
async function audit(deps: Deps, event: AuditEvent): Promise<void> {
  const { reason, ...rest } = event
  await deps.db.collection('adminAudit').add({
    ...rest,
    ...(reason ? { reason } : {}),
    createdAt: FieldValue.serverTimestamp(),
  })
}

async function getAuthUser(deps: Deps, uid: string) {
  try {
    return await deps.auth.getUser(uid)
  } catch (error) {
    if ((error as { code?: string }).code === 'auth/user-not-found') {
      throw new ModerationError('not-found', 'user-not-found')
    }
    throw error
  }
}

// Evita que un admin se bloquee a si mismo o modere a otro admin.
async function assertModeratable(deps: Deps, actorUid: string, targetUid: string): Promise<void> {
  if (targetUid === actorUid) throw new ModerationError('failed-precondition', 'self-moderation')
  const user = await getAuthUser(deps, targetUid)
  if (user.customClaims?.['admin'] === true) throw new ModerationError('failed-precondition', 'target-is-admin')
}

async function unpublishIfExists(deps: Deps, uid: string): Promise<boolean> {
  const ref = deps.db.doc(`publicProfiles/${uid}`)
  const snap = await ref.get()
  if (!snap.exists) return false
  await ref.update({ isPublic: false, updatedAt: FieldValue.serverTimestamp() })
  return true
}

export async function unpublishProfile(deps: Deps, p: { actorUid: string; targetUid: string; reason?: string }) {
  await assertModeratable(deps, p.actorUid, p.targetUid)
  if (!(await unpublishIfExists(deps, p.targetUid))) throw new ModerationError('not-found', 'profile-not-found')
  await audit(deps, { actorUid: p.actorUid, action: 'unpublish', targetUid: p.targetUid, reason: p.reason })
}

export async function removeCv(deps: Deps, p: { actorUid: string; targetUid: string; reason?: string }) {
  await assertModeratable(deps, p.actorUid, p.targetUid)
  await deps.bucket.file(cvPath(p.targetUid)).delete({ ignoreNotFound: true })
  const ref = deps.db.doc(`publicProfiles/${p.targetUid}`)
  if ((await ref.get()).exists) {
    await ref.update({
      cvPath: FieldValue.delete(),
      cvUpdatedAt: FieldValue.delete(),
      cvSize: FieldValue.delete(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  }
  await audit(deps, { actorUid: p.actorUid, action: 'remove_cv', targetUid: p.targetUid, reason: p.reason })
}

// Suspender = cuenta suspendida + perfil despublicado + inicio de sesion bloqueado.
// Un perfil despublicado deja de ser legible y su CV deja de ser publico.
export async function suspendAccount(deps: Deps, p: { actorUid: string; targetUid: string; reason?: string }) {
  await assertModeratable(deps, p.actorUid, p.targetUid)
  const userRef = deps.db.doc(`users/${p.targetUid}`)
  if ((await userRef.get()).exists) {
    await userRef.update({ accountStatus: 'suspended', updatedAt: FieldValue.serverTimestamp() })
  }
  await unpublishIfExists(deps, p.targetUid)
  await deps.auth.updateUser(p.targetUid, { disabled: true })
  await deps.auth.revokeRefreshTokens(p.targetUid)
  await audit(deps, { actorUid: p.actorUid, action: 'suspend', targetUid: p.targetUid, reason: p.reason })
}

// Reactivar no vuelve a publicar el perfil: la persona decide si lo publica de nuevo.
export async function unsuspendAccount(deps: Deps, p: { actorUid: string; targetUid: string; reason?: string }) {
  await assertModeratable(deps, p.actorUid, p.targetUid)
  const userRef = deps.db.doc(`users/${p.targetUid}`)
  if ((await userRef.get()).exists) {
    await userRef.update({ accountStatus: 'active', updatedAt: FieldValue.serverTimestamp() })
  }
  await deps.auth.updateUser(p.targetUid, { disabled: false })
  await audit(deps, { actorUid: p.actorUid, action: 'unsuspend', targetUid: p.targetUid, reason: p.reason })
}

export async function resolveReport(
  deps: Deps,
  p: { actorUid: string; reportId: string; resolution: Resolution },
) {
  const ref = deps.db.doc(`reports/${p.reportId}`)
  const snap = await ref.get()
  if (!snap.exists) throw new ModerationError('not-found', 'report-not-found')
  const report = snap.data() as { status: string; profileUid: string }
  if (report.status !== 'open') throw new ModerationError('failed-precondition', 'report-already-closed')

  await ref.update({
    status: p.resolution,
    resolvedBy: p.actorUid,
    resolvedAt: FieldValue.serverTimestamp(),
  })
  await audit(deps, {
    actorUid: p.actorUid,
    action: p.resolution === 'resolved' ? 'resolve_report' : 'dismiss_report',
    targetUid: report.profileUid,
  })
}

// Borra todo lo asociado a la cuenta. Es idempotente: se puede reintentar si fallo a medias.
// El orden deja el usuario de Auth para el final, asi un reintento sigue siendo posible.
export async function deleteAccountData(
  deps: Deps,
  p: { actorUid: string; targetUid: string; reason?: string },
) {
  const selfService = p.actorUid === p.targetUid
  if (!selfService && p.targetUid === p.actorUid) throw new ModerationError('failed-precondition', 'self-moderation')

  // Si el usuario de Auth ya no existe (reintento tras un fallo parcial) se continua
  // con la limpieza: sin cuenta no puede ser admin, asi que no hay nada que proteger.
  const target = await deps.auth.getUser(p.targetUid).catch((error: { code?: string }) => {
    if (error.code === 'auth/user-not-found') return null
    throw error
  })
  if (target?.customClaims?.['admin'] === true) {
    throw new ModerationError('failed-precondition', selfService ? 'admin-cannot-self-delete' : 'target-is-admin')
  }

  await deps.bucket.file(cvPath(p.targetUid)).delete({ ignoreNotFound: true })
  await deps.db.doc(`publicProfiles/${p.targetUid}`).delete()
  await deps.db.doc(`users/${p.targetUid}`).delete()
  try {
    await deps.auth.deleteUser(p.targetUid)
  } catch (error) {
    if ((error as { code?: string }).code !== 'auth/user-not-found') throw error
  }
  await audit(deps, {
    actorUid: p.actorUid,
    action: 'delete_account',
    targetUid: p.targetUid,
    reason: p.reason,
    selfService,
  })
}

export async function recordAdminClaimChange(
  deps: Deps,
  p: { actorUid: string; targetUid: string; granted: boolean },
) {
  await audit(deps, {
    actorUid: p.actorUid,
    action: p.granted ? 'grant_admin' : 'revoke_admin',
    targetUid: p.targetUid,
  })
}
