import { deleteField, doc, serverTimestamp, updateDoc } from 'firebase/firestore/lite'
import { deleteObject, getBlob, ref, uploadBytesResumable } from 'firebase/storage'
import { getFirebase } from '@/firebase/config'
import { CV_CONTENT_TYPE } from '@/utils/cvFile'

export const cvStoragePath = (uid: string) => `cvs/${uid}/cv.pdf`

// Sube el PDF y despues registra los metadatos en el perfil. Si el perfil no
// existe o la escritura falla, el error sube al llamador para mostrarlo.
export async function uploadCv(uid: string, file: File, onProgress: (percent: number) => void): Promise<void> {
  const { storage, db } = getFirebase()
  const task = uploadBytesResumable(ref(storage, cvStoragePath(uid)), file, {
    contentType: CV_CONTENT_TYPE,
    cacheControl: 'private, max-age=0, no-transform',
  })

  await new Promise<void>((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
      reject,
      () => resolve(),
    )
  })

  await updateDoc(doc(db, 'publicProfiles', uid), {
    cvPath: cvStoragePath(uid),
    cvUpdatedAt: serverTimestamp(),
    cvSize: file.size,
    updatedAt: serverTimestamp(),
  })
}

// Primero se quitan los metadatos (el CV deja de figurar) y despues el archivo.
export async function deleteCv(uid: string): Promise<void> {
  const { storage, db } = getFirebase()
  await updateDoc(doc(db, 'publicProfiles', uid), {
    cvPath: deleteField(),
    cvUpdatedAt: deleteField(),
    cvSize: deleteField(),
    updatedAt: serverTimestamp(),
  })
  try {
    await deleteObject(ref(storage, cvStoragePath(uid)))
  } catch (error) {
    // Si el archivo ya no existe, el resultado deseado ya se cumple.
    if ((error as { code?: string }).code !== 'storage/object-not-found') throw error
  }
}

// Descarga mediada por el SDK (respeta las reglas). No se usan URLs permanentes con token.
// Requiere CORS configurado en el bucket (ver docs/firebase-setup.md).
export async function downloadCv(uid: string, fileName: string): Promise<void> {
  const blob = await getBlob(ref(getFirebase().storage, cvStoragePath(uid)))
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
