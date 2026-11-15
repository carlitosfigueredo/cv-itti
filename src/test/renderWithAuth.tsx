import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext, type AuthContextValue } from '@/context/AuthContext'

export const anonymous: AuthContextValue = {
  status: 'unauthenticated',
  user: null,
  isAdmin: false,
  signIn: async () => ({ ok: true }),
  signOut: async () => {},
}

export const loggedUser: AuthContextValue = {
  ...anonymous,
  status: 'authenticated',
  user: { uid: 'u1', email: 'a@b.com', displayName: 'Ana', photoURL: null },
}

export function renderWithAuth(ui: ReactElement, auth: AuthContextValue, route = '/') {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AuthContext.Provider>,
  )
}
