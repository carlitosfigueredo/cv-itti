import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { logger } from 'firebase-functions'
import { onObjectFinalized } from 'firebase-functions/v2/storage'
import { checkCvObject, parseCvPath } from './cv'

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
