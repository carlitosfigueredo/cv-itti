import { screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { anonymous, loggedUser, renderWithAuth } from '@/test/renderWithAuth'
import { RequireAdmin } from './RequireAdmin'
import { RequireAuth } from './RequireAuth'

function tree() {
  return (
    <Routes>
      <Route path="/login" element={<p>login</p>} />
      <Route path="/dashboard" element={<p>dashboard</p>} />
      <Route element={<RequireAuth />}>
        <Route path="/privada" element={<p>privada</p>} />
      </Route>
      <Route element={<RequireAdmin />}>
        <Route path="/admin" element={<p>admin</p>} />
      </Route>
    </Routes>
  )
}

describe('guardas de ruta', () => {
  it('RequireAuth redirige a login sin sesion', () => {
    renderWithAuth(tree(), anonymous, '/privada')
    expect(screen.getByText('login')).toBeInTheDocument()
  })

  it('RequireAuth muestra carga mientras se resuelve la sesion', () => {
    renderWithAuth(tree(), { ...anonymous, status: 'loading' }, '/privada')
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('login')).not.toBeInTheDocument()
  })

  it('RequireAuth deja pasar a un usuario autenticado', () => {
    renderWithAuth(tree(), loggedUser, '/privada')
    expect(screen.getByText('privada')).toBeInTheDocument()
  })

  it('RequireAdmin envia al panel a un usuario sin claim admin', () => {
    renderWithAuth(tree(), loggedUser, '/admin')
    expect(screen.getByText('dashboard')).toBeInTheDocument()
  })

  it('RequireAdmin deja pasar a un admin', () => {
    renderWithAuth(tree(), { ...loggedUser, isAdmin: true }, '/admin')
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('RequireAdmin redirige a login sin sesion', () => {
    renderWithAuth(tree(), anonymous, '/admin')
    expect(screen.getByText('login')).toBeInTheDocument()
  })
})
