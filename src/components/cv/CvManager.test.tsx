import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Timestamp } from 'firebase/firestore'
import type { PublicProfile } from '@/types/profile'
import { CvManager } from './CvManager'

const service = vi.hoisted(() => ({
  uploadCv: vi.fn(),
  deleteCv: vi.fn(),
  downloadCv: vi.fn(),
}))
vi.mock('@/services/cv.service', () => service)

const baseProfile = { uid: 'u1', displayName: 'Ana', isPublic: false } as PublicProfile
const withCv = {
  ...baseProfile,
  cvPath: 'cvs/u1/cv.pdf',
  cvSize: 2048,
  cvUpdatedAt: Timestamp.fromDate(new Date('2026-01-15T10:30:00')),
} as PublicProfile

const pdf = () => new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 1, 2])], 'cv.pdf', { type: 'application/pdf' })

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CvManager', () => {
  it('pide crear el perfil primero cuando no existe', () => {
    render(<CvManager profile={null} onChanged={async () => {}} />)
    expect(screen.getByText(/primero creá tu perfil/i)).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('sin CV ofrece subir y avisa que sera publico', () => {
    render(<CvManager profile={baseProfile} onChanged={async () => {}} />)
    expect(screen.getByRole('button', { name: 'Subir CV' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Descargar' })).not.toBeInTheDocument()
    expect(screen.getByText(/mientras tu perfil esté publicado, cualquiera puede descargar tu cv/i)).toBeInTheDocument()
  })

  it('con CV muestra fecha, tamano y las tres acciones', () => {
    render(<CvManager profile={withCv} onChanged={async () => {}} />)
    expect(screen.getByText(/15\/01\/2026 10:30/)).toBeInTheDocument()
    expect(screen.getByText(/2 KB/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reemplazar CV' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Descargar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument()
  })

  it('rechaza un archivo que no es PDF sin llamar al servicio', async () => {
    render(<CvManager profile={baseProfile} onChanged={async () => {}} />)
    const png = new File([new Uint8Array([1, 2, 3])], 'foto.png', { type: 'image/png' })
    await userEvent.upload(screen.getByTestId('cv-input'), png, { applyAccept: false })
    expect(await screen.findByRole('alert')).toHaveTextContent('Solo se aceptan archivos PDF.')
    expect(service.uploadCv).not.toHaveBeenCalled()
  })

  it('sube un PDF valido y avisa al contenedor para refrescar', async () => {
    service.uploadCv.mockResolvedValue(undefined)
    const onChanged = vi.fn().mockResolvedValue(undefined)
    render(<CvManager profile={baseProfile} onChanged={onChanged} />)
    await userEvent.upload(screen.getByTestId('cv-input'), pdf())
    await waitFor(() => expect(onChanged).toHaveBeenCalledTimes(1))
    expect(service.uploadCv).toHaveBeenCalledWith('u1', expect.any(File), expect.any(Function))
    expect(await screen.findByText(/se subió correctamente/i)).toBeInTheDocument()
  })

  it('muestra error si falla la subida', async () => {
    service.uploadCv.mockRejectedValue(new Error('x'))
    render(<CvManager profile={baseProfile} onChanged={async () => {}} />)
    await userEvent.upload(screen.getByTestId('cv-input'), pdf())
    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo subir/i)
  })

  it('pide confirmacion antes de eliminar', async () => {
    service.deleteCv.mockResolvedValue(undefined)
    const onChanged = vi.fn().mockResolvedValue(undefined)
    render(<CvManager profile={withCv} onChanged={onChanged} />)
    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(service.deleteCv).not.toHaveBeenCalled()
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Eliminar' }))
    await waitFor(() => expect(service.deleteCv).toHaveBeenCalledWith('u1'))
    await waitFor(() => expect(onChanged).toHaveBeenCalled())
  })

  it('descarga con un nombre de archivo basado en el perfil', async () => {
    service.downloadCv.mockResolvedValue(undefined)
    render(<CvManager profile={withCv} onChanged={async () => {}} />)
    await userEvent.click(screen.getByRole('button', { name: 'Descargar' }))
    await waitFor(() => expect(service.downloadCv).toHaveBeenCalledWith('u1', 'CV - Ana.pdf'))
  })
})
