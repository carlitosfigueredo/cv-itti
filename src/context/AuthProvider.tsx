import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  readIsAdmin,
  signInWithGoogle,
  signOutUser,
  subscribeToAuth,
  toAuthUser,
} from '@/services/auth.service'
import type { AuthStatus, AuthUser } from '@/types/auth'
import { AuthContext, type AuthContextValue } from './AuthContext'

interface AuthState {
  status: AuthStatus
  user: AuthUser | null
  isAdmin: boolean
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null, isAdmin: false })

  useEffect(() => {
    let active = true
    const unsubscribe = subscribeToAuth((firebaseUser) => {
      if (!firebaseUser) {
        setState({ status: 'unauthenticated', user: null, isAdmin: false })
        return
      }
      // Se resuelve el claim admin antes de marcar la sesion como lista,
      // para que las rutas de admin no parpadeen ni redirijan por error.
      readIsAdmin(firebaseUser)
        .catch(() => false)
        .then((isAdmin) => {
          if (active) setState({ status: 'authenticated', user: toAuthUser(firebaseUser), isAdmin })
        })
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const signIn = useCallback(() => signInWithGoogle(), [])
  const signOut = useCallback(() => signOutUser(), [])

  const value = useMemo<AuthContextValue>(() => ({ ...state, signIn, signOut }), [state, signIn, signOut])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
