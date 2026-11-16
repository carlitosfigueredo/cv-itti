import { GoogleAuthProvider, reauthenticateWithPopup, signOut } from 'firebase/auth'
import { httpsCallable } from 'firebase/functions'
import { getFirebase } from '@/firebase/config'

export type DeleteAccountResult =
  | { ok: true }
  | { ok: false; reason: 'cancelled' | 'error'; error?: unknown }

// Elimina la cuenta propia. La funcion deleteAccount exige un inicio de sesion
// reciente, por eso primero se vuelve a confirmar la identidad con Google.
export async function deleteOwnAccount(): Promise<DeleteAccountResult> {
  const { auth, functions } = getFirebase()
  const user = auth.currentUser
  if (!user) return { ok: false, reason: 'error' }

  try {
    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({ prompt: 'select_account' })
    await reauthenticateWithPopup(user, provider)
    // Token nuevo con auth_time actualizado para que el servidor acepte el borrado.
    await user.getIdToken(true)
  } catch (error) {
    const code = (error as { code?: string }).code
    if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
      return { ok: false, reason: 'cancelled' }
    }
    return { ok: false, reason: 'error', error }
  }

  try {
    await httpsCallable(functions, 'deleteAccount')({})
  } catch (error) {
    return { ok: false, reason: 'error', error }
  }

  // La cuenta ya no existe en el servidor: se limpia la sesion local.
  await signOut(auth).catch(() => undefined)
  return { ok: true }
}
