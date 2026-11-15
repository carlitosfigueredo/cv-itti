import { createContext } from 'react'
import type { SignInResult } from '@/services/auth.service'
import type { AuthStatus, AuthUser } from '@/types/auth'

export interface AuthContextValue {
  status: AuthStatus
  user: AuthUser | null
  isAdmin: boolean
  signIn: () => Promise<SignInResult>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
