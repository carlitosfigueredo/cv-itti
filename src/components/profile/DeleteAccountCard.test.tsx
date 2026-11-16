import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { DeleteAccountCard } from './DeleteAccountCard'

const service = vi.hoisted(() => ({ deleteOwnAccount: vi.fn() }))
vi.mock('@/services/account.service', () => service)

const setup = () =>
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<DeleteAccountCard />} />
        <Route path="/" element={<p>inicio</p>} />
      </Routes>
    </MemoryRouter>,
  )

const openDialog = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Eliminar mi cuenta' }))
  return screen.findByRole('dialog')
}

beforeEach(() => vi.clearAllMocks())

describe('DeleteAccountCard', () => {
  it('no permite eliminar sin escribir la palabra de confirmacion', async () => {
    setup()
    const dialog = await openDialog()
    const confirm = within(dialog).getByRole('button', { name: 'Eliminar mi cuenta' })
    expect(confirm).toBeDisabled()
    await userEvent.type(within(dialog).getByLabelText(/para confirmar/i), 'eliminar')
    expect(confirm).toBeDisabled()
    expect(service.deleteOwnAccount).not.toHaveBeenCalled()
  })

  it('elimina y vuelve al inicio', async () => {
    service.deleteOwnAccount.mockResolvedValue({ ok: true })
    setup()
    const dialog = await openDialog()
    await userEvent.type(within(dialog).getByLabelText(/para confirmar/i), 'ELIMINAR')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar mi cuenta' }))
    expect(await screen.findByText('inicio')).toBeInTheDocument()
    expect(service.deleteOwnAccount).toHaveBeenCalledTimes(1)
  })

  it('avisa si se cancela la confirmacion con Google', async () => {
    service.deleteOwnAccount.mockResolvedValue({ ok: false, reason: 'cancelled' })
    setup()
    const dialog = await openDialog()
    await userEvent.type(within(dialog).getByLabelText(/para confirmar/i), 'ELIMINAR')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar mi cuenta' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(/tu cuenta no se eliminó/i)
  })

  it('explica el error del servidor (por ejemplo, una cuenta administradora)', async () => {
    service.deleteOwnAccount.mockResolvedValue({
      ok: false,
      reason: 'error',
      error: { code: 'functions/failed-precondition', message: 'admin-cannot-self-delete' },
    })
    setup()
    const dialog = await openDialog()
    await userEvent.type(within(dialog).getByLabelText(/para confirmar/i), 'ELIMINAR')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar mi cuenta' }))
    await waitFor(() => expect(within(dialog).getByRole('alert')).toHaveTextContent(/administrador no puede borrar su propia cuenta/i))
  })
})
