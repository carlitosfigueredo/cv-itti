import { doc, getDoc, runTransaction, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore/lite'
import { getFirebase } from '@/firebase/config'
import type { AuthUser } from '@/types/auth'
import type { ProfileContent, PublicProfile, UserDocument } from '@/types/profile'

const USERS = 'users'
const PROFILES = 'publicProfiles'

// Crea users/{uid} en el primer ingreso. Usa transaccion para no pisar un
// documento existente si se abren dos pestanas a la vez.
export async function ensureUserDocument(user: AuthUser): Promise<UserDocument> {
  const { db } = getFirebase()
  if (!user.email) throw new Error('La cuenta de Google no tiene email')
  const ref = doc(db, USERS, user.uid)

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref)
    if (snap.exists()) return
    tx.set(ref, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName ?? '',
      affectedGrupoVazquez: null,
      accountStatus: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })

  const created = await getDoc(ref)
  return created.data() as UserDocument
}

export async function getOwnProfile(uid: string): Promise<PublicProfile | null> {
  const snap = await getDoc(doc(getFirebase().db, PROFILES, uid))
  return snap.exists() ? (snap.data() as PublicProfile) : null
}

interface SaveProfileParams {
  uid: string
  content: ProfileContent
  affected: boolean
  existing: PublicProfile | null
}

// Guarda en un solo batch: el flag privado en users/{uid} y el perfil publico.
// Las reglas validan ambos documentos juntos (getAfter).
export async function saveOwnProfile({ uid, content, affected, existing }: SaveProfileParams): Promise<void> {
  const { db } = getFirebase()
  const batch = writeBatch(db)

  batch.update(doc(db, USERS, uid), {
    affectedGrupoVazquez: affected,
    updatedAt: serverTimestamp(),
  })

  // Un perfil nuevo siempre nace privado. Uno existente conserva su estado de publicacion.
  batch.set(doc(db, PROFILES, uid), {
    ...content,
    uid,
    isPublic: existing?.isPublic ?? false,
    // Editar el perfil no debe borrar los metadatos del CV (set reemplaza el documento).
    ...(existing?.cvPath
      ? { cvPath: existing.cvPath, cvUpdatedAt: existing.cvUpdatedAt, cvSize: existing.cvSize }
      : {}),
    createdAt: existing?.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await batch.commit()
}

// Lee un perfil por uid. Devuelve null si no existe o no esta disponible: las reglas
// responden "permission-denied" tanto para perfiles privados como inexistentes, y
// para el visitante es lo mismo ("no disponible").
export async function getPublicProfile(uid: string): Promise<PublicProfile | null> {
  try {
    const snap = await getDoc(doc(getFirebase().db, PROFILES, uid))
    return snap.exists() ? (snap.data() as PublicProfile) : null
  } catch (error) {
    if ((error as { code?: string }).code === 'permission-denied') return null
    throw error
  }
}

// Publica o despublica el perfil propio. Las reglas exigen cuenta activa y haber
// respondido la pregunta de Grupo Vazquez para publicar.
export async function setProfilePublished(uid: string, isPublic: boolean): Promise<void> {
  await updateDoc(doc(getFirebase().db, PROFILES, uid), { isPublic, updatedAt: serverTimestamp() })
}
