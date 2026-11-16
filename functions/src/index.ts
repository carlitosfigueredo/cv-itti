import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { logger } from 'firebase-functions'
import { HttpsError, onCall, type CallableRequest } from 'firebase-functions/v2/https'
import { onObjectFinalized } from 'firebase-functions/v2/storage'
import { checkCvObject, parseCvPath } from './cv'
import {
  ModerationError,
  deleteAccountData,
  removeCv,
  resolveReport,
  suspendAccount,
  unpublishProfile,
  unsuspendAccount,
  type Deps,
} from './moderation'
import {
  InputError,
  isRecentLogin,
  parseDeleteAccountInput,
  parseModerateInput,
  parseResolveReportInput,
} from './validate'

initializeApp()

// Valida el contenido real de cada CV subido (las reglas de Storage solo ven
// tamano y tipo declarado). Si no es un PDF valido, borra el archivo y quita sus
// metadatos del perfil. Debe estar en la misma region que el bucket (us-central1).
export const validateCvUpload = onObjectFinalized(
  { region: 'us-central1', memory: '256MiB', timeoutSeconds: 60 },
  async (event) => {
    const object = event.data
    const parsed = parseCvPath(object.name)
    if (!parsed) return

    const file = getStorage().bucket(object.bucket).file(object.name)
    const [head] = await file.download({ start: 0, end: 4 })

    const rejection = checkCvObject({
      contentType: object.contentType,
      size: Number(object.size),
      head,
    })
    if (!rejection) return

    // Se registra el motivo, nunca el contenido ni datos personales.
    logger.warn('CV rechazado', { reason: rejection })
    await file.delete({ ignoreNotFound: true })

    const profile = getFirestore().doc(`publicProfiles/${parsed.uid}`)
    const snapshot = await profile.get()
    if (snapshot.exists) {
      await profile.update({
        cvPath: FieldValue.delete(),
        cvUpdatedAt: FieldValue.delete(),
        cvSize: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    }
  },
)

// ---------------------------------------------------------------------------
// Funciones callable. La autorizacion se verifica SIEMPRE aqui, en el servidor:
// el cliente solo oculta botones, no es una barrera de seguridad.
// maxInstances limita el costo ante un uso abusivo.
// ---------------------------------------------------------------------------
// App Check: se exige solo si ENFORCE_APP_CHECK=true en functions/.env.<proyecto>.
// Se activa despues de verificar en la consola que el trafico real trae tokens validos.
const CALLABLE_OPTIONS = {
  region: 'us-central1',
  maxInstances: 5,
  timeoutSeconds: 60,
  enforceAppCheck: process.env['ENFORCE_APP_CHECK'] === 'true',
}

function deps(): Deps {
  return { db: getFirestore(), auth: getAuth(), bucket: getStorage().bucket() }
}

function requireAdmin(request: CallableRequest<unknown>): string {
  if (!request.auth) throw new HttpsError('unauthenticated', 'unauthenticated')
  if (request.auth.token['admin'] !== true) throw new HttpsError('permission-denied', 'admin-required')
  return request.auth.uid
}

function toHttpsError(error: unknown): HttpsError {
  if (error instanceof HttpsError) return error
  if (error instanceof InputError) return new HttpsError('invalid-argument', error.message)
  if (error instanceof ModerationError) return new HttpsError(error.code, error.detail)
  // No se devuelve el detalle interno al cliente ni se registran datos personales.
  logger.error('Error inesperado en funcion callable', {
    name: error instanceof Error ? error.name : 'unknown',
  })
  return new HttpsError('internal', 'internal')
}

async function run<T>(task: () => Promise<T>): Promise<T> {
  try {
    return await task()
  } catch (error) {
    throw toHttpsError(error)
  }
}

export const moderateAccount = onCall(CALLABLE_OPTIONS, (request) =>
  run(async () => {
    const actorUid = requireAdmin(request)
    const { targetUid, action, reason } = parseModerateInput(request.data)
    const params = { actorUid, targetUid, ...(reason ? { reason } : {}) }
    const handlers = {
      unpublish: unpublishProfile,
      removeCv,
      suspend: suspendAccount,
      unsuspend: unsuspendAccount,
    }
    await handlers[action](deps(), params)
    return { ok: true }
  }),
)

export const resolveReportCall = onCall(CALLABLE_OPTIONS, (request) =>
  run(async () => {
    const actorUid = requireAdmin(request)
    const { reportId, resolution } = parseResolveReportInput(request.data)
    await resolveReport(deps(), { actorUid, reportId, resolution })
    return { ok: true }
  }),
)

// Una persona borra su propia cuenta; un admin puede borrar la de otra persona.
// En ambos casos se exige un inicio de sesion reciente (reautenticacion).
export const deleteAccount = onCall(CALLABLE_OPTIONS, (request) =>
  run(async () => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'unauthenticated')
    const actorUid = request.auth.uid
    const { targetUid = actorUid, reason } = parseDeleteAccountInput(request.data)

    if (targetUid !== actorUid && request.auth.token['admin'] !== true) {
      throw new HttpsError('permission-denied', 'admin-required')
    }
    if (!isRecentLogin(request.auth.token['auth_time'], Date.now())) {
      throw new HttpsError('failed-precondition', 'recent-login-required')
    }
    await deleteAccountData(deps(), { actorUid, targetUid, ...(reason ? { reason } : {}) })
    return { ok: true }
  }),
)
