import { randomUUID } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import {
  ModerationError,
  deleteAccountData,
  removeCv,
  resolveReport,
  suspendAccount,
  unpublishProfile,
  unsuspendAccount,
  type Deps,
} from '../src/moderation'

// Pruebas de integracion contra los emuladores de Auth, Firestore y Storage.
// Ejecutar con: npm run test:functions
initializeApp({ projectId: 'demo-cv-itti', storageBucket: 'demo-cv-itti.firebasestorage.app' })
const deps: Deps = { db: getFirestore(), auth: getAuth(), bucket: getStorage().bucket() }

const newUid = () => randomUUID().replace(/-/g, '').slice(0, 20)
const PDF = Buffer.from('%PDF-1.4 contenido de prueba')

async function makeUser(opts: { admin?: boolean; withProfile?: boolean; withCv?: boolean } = {}) {
  const { admin = false, withProfile = true, withCv = true } = opts
  const uid = newUid()
  await deps.auth.createUser({ uid, email: `${uid}@x.com` })
  if (admin) await deps.auth.setCustomUserClaims(uid, { admin: true })
  await deps.db.doc(`users/${uid}`).set({ uid, email: `${uid}@x.com`, accountStatus: 'active', affectedGrupoVazquez: true })
  if (withProfile) {
    await deps.db.doc(`publicProfiles/${uid}`).set({
      uid,
      displayName: 'Persona',
      isPublic: true,
      ...(withCv ? { cvPath: `cvs/${uid}/cv.pdf`, cvSize: 10, cvUpdatedAt: new Date() } : {}),
    })
  }
  if (withCv) await deps.bucket.file(`cvs/${uid}/cv.pdf`).save(PDF, { contentType: 'application/pdf' })
  return uid
}

const profile = async (uid: string) => (await deps.db.doc(`publicProfiles/${uid}`).get()).data()
const userDoc = async (uid: string) => (await deps.db.doc(`users/${uid}`).get()).data()
const cvExists = async (uid: string) => (await deps.bucket.file(`cvs/${uid}/cv.pdf`).exists())[0]
const auditFor = async (targetUid: string) =>
  (await deps.db.collection('adminAudit').where('targetUid', '==', targetUid).get()).docs.map((d) => d.data())

const rejection = async (promise: Promise<unknown>) => {
  try {
    await promise
  } catch (error) {
    return error as ModerationError
  }
  throw new Error('Se esperaba un error y no hubo ninguno')
}

describe('unpublishProfile', () => {
  it('despublica el perfil y deja auditoria', async () => {
    const admin = await makeUser({ admin: true, withProfile: false, withCv: false })
    const target = await makeUser()
    await unpublishProfile(deps, { actorUid: admin, targetUid: target, reason: 'contenido inapropiado' })
    expect((await profile(target))?.['isPublic']).toBe(false)
    const events = await auditFor(target)
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ actorUid: admin, action: 'unpublish', reason: 'contenido inapropiado' })
  })

  it('falla si el perfil no existe', async () => {
    const admin = await makeUser({ admin: true, withProfile: false, withCv: false })
    const target = await makeUser({ withProfile: false, withCv: false })
    expect((await rejection(unpublishProfile(deps, { actorUid: admin, targetUid: target }))).detail).toBe('profile-not-found')
  })
})

describe('proteccion de administradores', () => {
  it('un admin no puede moderarse a si mismo', async () => {
    const admin = await makeUser({ admin: true })
    const error = await rejection(suspendAccount(deps, { actorUid: admin, targetUid: admin }))
    expect(error.detail).toBe('self-moderation')
    expect((await deps.auth.getUser(admin)).disabled).toBe(false)
  })

  it('un admin no puede moderar a otro admin', async () => {
    const a = await makeUser({ admin: true })
    const b = await makeUser({ admin: true })
    expect((await rejection(suspendAccount(deps, { actorUid: a, targetUid: b }))).detail).toBe('target-is-admin')
    expect((await rejection(removeCv(deps, { actorUid: a, targetUid: b }))).detail).toBe('target-is-admin')
    expect((await rejection(deleteAccountData(deps, { actorUid: a, targetUid: b }))).detail).toBe('target-is-admin')
    expect(await cvExists(b)).toBe(true)
  })

  it('un admin no puede borrar su propia cuenta por esta via', async () => {
    const admin = await makeUser({ admin: true })
    expect((await rejection(deleteAccountData(deps, { actorUid: admin, targetUid: admin }))).detail).toBe('admin-cannot-self-delete')
  })

  it('falla si el usuario objetivo no existe', async () => {
    const admin = await makeUser({ admin: true, withProfile: false, withCv: false })
    expect((await rejection(suspendAccount(deps, { actorUid: admin, targetUid: newUid() }))).detail).toBe('user-not-found')
  })
})

describe('removeCv', () => {
  it('borra el archivo y los metadatos, y es repetible', async () => {
    const admin = await makeUser({ admin: true, withProfile: false, withCv: false })
    const target = await makeUser()
    await removeCv(deps, { actorUid: admin, targetUid: target })
    expect(await cvExists(target)).toBe(false)
    const data = await profile(target)
    expect(data).not.toHaveProperty('cvPath')
    expect(data).not.toHaveProperty('cvSize')
    expect(data?.['isPublic']).toBe(true)
    await removeCv(deps, { actorUid: admin, targetUid: target })
    expect(await auditFor(target)).toHaveLength(2)
  })
})

describe('suspendAccount / unsuspendAccount', () => {
  it('suspende: estado, perfil despublicado, login bloqueado y auditoria', async () => {
    const admin = await makeUser({ admin: true, withProfile: false, withCv: false })
    const target = await makeUser()
    await suspendAccount(deps, { actorUid: admin, targetUid: target, reason: 'spam' })
    expect((await userDoc(target))?.['accountStatus']).toBe('suspended')
    expect((await profile(target))?.['isPublic']).toBe(false)
    expect((await deps.auth.getUser(target)).disabled).toBe(true)
    expect((await auditFor(target))[0]).toMatchObject({ action: 'suspend', actorUid: admin, reason: 'spam' })
  })

  it('reactivar habilita el login pero no vuelve a publicar el perfil', async () => {
    const admin = await makeUser({ admin: true, withProfile: false, withCv: false })
    const target = await makeUser()
    await suspendAccount(deps, { actorUid: admin, targetUid: target })
    await unsuspendAccount(deps, { actorUid: admin, targetUid: target })
    expect((await userDoc(target))?.['accountStatus']).toBe('active')
    expect((await deps.auth.getUser(target)).disabled).toBe(false)
    expect((await profile(target))?.['isPublic']).toBe(false)
  })

  it('suspende aunque la persona nunca haya creado su documento en Firestore', async () => {
    const admin = await makeUser({ admin: true, withProfile: false, withCv: false })
    const target = newUid()
    await deps.auth.createUser({ uid: target, email: `${target}@x.com` })
    await suspendAccount(deps, { actorUid: admin, targetUid: target })
    expect((await deps.auth.getUser(target)).disabled).toBe(true)
    expect((await deps.db.doc(`users/${target}`).get()).exists).toBe(false)
  })
})

describe('resolveReport', () => {
  async function makeReport(profileUid: string) {
    const reporter = newUid()
    const reportId = `${profileUid}_${reporter}`
    await deps.db.doc(`reports/${reportId}`).set({ profileUid, reporterUid: reporter, reason: 'spam', status: 'open' })
    return reportId
  }

  it('cierra un reporte abierto y registra quien lo hizo', async () => {
    const admin = await makeUser({ admin: true, withProfile: false, withCv: false })
    const target = await makeUser()
    const reportId = await makeReport(target)
    await resolveReport(deps, { actorUid: admin, reportId, resolution: 'dismissed' })
    const report = (await deps.db.doc(`reports/${reportId}`).get()).data()
    expect(report).toMatchObject({ status: 'dismissed', resolvedBy: admin })
    expect((await auditFor(target))[0]).toMatchObject({ action: 'dismiss_report' })
  })

  it('no permite cerrar dos veces ni cerrar uno inexistente', async () => {
    const admin = await makeUser({ admin: true, withProfile: false, withCv: false })
    const reportId = await makeReport(newUid())
    await resolveReport(deps, { actorUid: admin, reportId, resolution: 'resolved' })
    expect((await rejection(resolveReport(deps, { actorUid: admin, reportId, resolution: 'resolved' }))).detail).toBe('report-already-closed')
    expect((await rejection(resolveReport(deps, { actorUid: admin, reportId: `${newUid()}_${newUid()}`, resolution: 'resolved' }))).detail).toBe('report-not-found')
  })
})

describe('deleteAccountData', () => {
  it('la persona borra su cuenta: archivo, perfil, usuario y Auth; auditoria sin datos personales', async () => {
    const uid = await makeUser()
    await deleteAccountData(deps, { actorUid: uid, targetUid: uid })
    expect(await cvExists(uid)).toBe(false)
    expect((await deps.db.doc(`publicProfiles/${uid}`).get()).exists).toBe(false)
    expect((await deps.db.doc(`users/${uid}`).get()).exists).toBe(false)
    await expect(deps.auth.getUser(uid)).rejects.toMatchObject({ code: 'auth/user-not-found' })

    const [event] = await auditFor(uid)
    expect(event).toMatchObject({ action: 'delete_account', actorUid: uid, selfService: true })
    expect(Object.keys(event ?? {}).sort()).toEqual(['action', 'actorUid', 'createdAt', 'selfService', 'targetUid'])
  })

  it('un admin borra la cuenta de otra persona y deja el motivo', async () => {
    const admin = await makeUser({ admin: true, withProfile: false, withCv: false })
    const target = await makeUser()
    await deleteAccountData(deps, { actorUid: admin, targetUid: target, reason: 'pedido por soporte' })
    await expect(deps.auth.getUser(target)).rejects.toMatchObject({ code: 'auth/user-not-found' })
    expect((await auditFor(target))[0]).toMatchObject({ actorUid: admin, selfService: false, reason: 'pedido por soporte' })
  })

  it('se puede reintentar si el usuario de Auth ya no existe pero quedaron datos', async () => {
    const admin = await makeUser({ admin: true, withProfile: false, withCv: false })
    const target = await makeUser()
    await deps.auth.deleteUser(target)
    await deleteAccountData(deps, { actorUid: admin, targetUid: target })
    expect(await cvExists(target)).toBe(false)
    expect((await deps.db.doc(`publicProfiles/${target}`).get()).exists).toBe(false)
    expect((await deps.db.doc(`users/${target}`).get()).exists).toBe(false)
  })

  it('funciona aunque la persona no tenga perfil ni CV', async () => {
    const uid = await makeUser({ withProfile: false, withCv: false })
    await deleteAccountData(deps, { actorUid: uid, targetUid: uid })
    await expect(deps.auth.getUser(uid)).rejects.toMatchObject({ code: 'auth/user-not-found' })
  })
})
