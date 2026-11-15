import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ReportProfileDialog } from './ReportProfileDialog'

const service = vi.hoisted(() => ({ reportProfile: vi.fn() }))
vi.mock('@/services/report.service', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/report.service')>()),
  reportProfile: service.reportProfile,
}))

const setup = (reporterUid: string | null) =>
  render(
    <MemoryRouter>
      <ReportProfileDialog open onClose={() => {}} profileUid="u1" reporterUid={reporterUid} returnTo="/talentos/u1" />
    </MemoryRouter>,
  )

beforeEach(() => vi.clearAllMocks())

describe('ReportProfileDialog', () => {
  it('pide iniciar sesion a un visitante anonimo', () => {
    setup(null)
    expect(screen.getByText(/necesitás iniciar sesión/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ingresar' })).toHaveAttribute('href', '/login')
    expect(screen.queryByRole('button', { name: /enviar reporte/i })).not.toBeInTheDocument()
  })

  it('envia el reporte con el motivo y el comentario', async () => {
    service.reportProfile.mockResolvedValue('sent')
    setup('rep')
    await userEvent.click(screen.getByLabelText('Spam o publicidad'))
    await userEvent.type(screen.getByLabelText(/comentario/i), 'Publicidad repetida')
    await userEvent.click(screen.getByRole('button', { name: /enviar reporte/i }))
    await waitFor(() => expect(service.reportProfile).toHaveBeenCalledWith('u1', 'rep', 'spam', 'Publicidad repetida'))
    expect(await screen.findByText(/recibimos tu reporte/i)).toBeInTheDocument()
  })

  it('avisa si ya habia reportado ese perfil', async () => {
    service.reportProfile.mockResolvedValue('already-reported')
    setup('rep')
    await userEvent.click(screen.getByRole('button', { name: /enviar reporte/i }))
    expect(await screen.findByText(/ya reportaste este perfil/i)).toBeInTheDocument()
  })

  it('muestra un error si falla el envio', async () => {
    service.reportProfile.mockResolvedValue('error')
    setup('rep')
    await userEvent.click(screen.getByRole('button', { name: /enviar reporte/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo enviar/i)
  })
})
