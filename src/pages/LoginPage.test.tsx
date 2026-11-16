import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { anonymous, renderWithAuth } from '@/test/renderWithAuth'
import LoginPage from './LoginPage'

describe('LoginPage', () => {
  it('informa que al continuar se aceptan los terminos y la politica de privacidad', () => {
    renderWithAuth(<LoginPage />, anonymous)
    expect(screen.getByRole('link', { name: 'Términos y condiciones' })).toHaveAttribute('href', '/legal/terminos')
    expect(screen.getByRole('link', { name: /política de privacidad/i })).toHaveAttribute('href', '/legal/privacidad')
  })

  it('muestra el mensaje cuando el usuario cancela', async () => {
    const signIn = vi.fn().mockResolvedValue({
      ok: false,
      failure: { kind: 'cancelled', message: 'Cancelaste el inicio de sesión.' },
    })
    renderWithAuth(<LoginPage />, { ...anonymous, signIn })
    await userEvent.click(screen.getByRole('button', { name: /continuar con google/i }))
    await waitFor(() => expect(screen.getByText(/cancelaste/i)).toBeInTheDocument())
    expect(signIn).toHaveBeenCalledTimes(1)
  })

  it('muestra error cuando falla el proveedor', async () => {
    const signIn = vi.fn().mockResolvedValue({
      ok: false,
      failure: { kind: 'unknown', message: 'No se pudo iniciar sesión.' },
    })
    renderWithAuth(<LoginPage />, { ...anonymous, signIn })
    await userEvent.click(screen.getByRole('button', { name: /continuar con google/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo iniciar sesión.')
  })
})
