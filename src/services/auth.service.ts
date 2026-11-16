import {
  GoogleAuthProvider,
  getIdTokenResult,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { getFirebase } from '@/firebase/config'
import type { AuthUser } from '@/types/auth'
import { mapAuthError, type AuthFailure } from './auth.errors'

export function toAuthUser(user: User): AuthUser {
  return { uid: user.uid, email: user.email, displayName: user.displayName, photoURL: user.photoURL }
}

// El rol admin solo se lee del token (custom claim). Nunca se escribe desde el cliente.
export async function readIsAdmin(user: User): Promise<boolean> {
  const token = await getIdTokenResult(user)
  return token.claims['admin'] === true
}

export function subscribeToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(getFirebase().auth, callback)
}

export type SignInResult = { ok: true } | { ok: false; failure: AuthFailure }

export async function signInWithGoogle(): Promise<SignInResult> {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  try {
    await signInWithPopup(getFirebase().auth, provider)
    return { ok: true }
  } catch (error) {
    return { ok: false, failure: mapAuthError(error) }
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(getFirebase().auth)
}
