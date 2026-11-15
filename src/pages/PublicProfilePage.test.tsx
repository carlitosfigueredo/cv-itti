import { render, screen } from '@testing-library/react'
import { Route, Routes } from 'react-router-dom'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '@/context/AuthContext'
import { anonymous, loggedUser } from '@/test/renderWithAuth'
import { makeProfile } from '@/test/fixtures'
import PublicProfilePage from './PublicProfilePage'

const service = vi.hoisted(() => ({ getPublicProfile: vi.fn() }))
vi.mock('@/services/profile.service', () => service)
vi.mock('@/services/cv.service', () => ({ downloadCv: vi.fn() }))

const setup = (auth = anonymous) =>
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={['/talentos/u1']}>
        <Routes>
          <Route path="/talentos/:uid" element={<PublicProfilePage />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  )

beforeEach(() => vi.clearAllMocks())

describe('PublicProfilePage', () => {
  it('muestra el perfil publicado y el boton de reportar a un visitante', async () => {
    service.getPublicProfile.mockResolvedValue(makeProfile())
    setup()
    expect(await screen.findByRole('heading', { name: 'Ana Lopez' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reportar/i })).toBeInTheDocument()
  })

  it('indica "no disponible" cuando el perfil es privado o no existe', async () => {
    service.getPublicProfile.mockResolvedValue(null)
    setup()
    expect(await screen.findByText('Este perfil no está disponible')).toBeInTheDocument()
  })

  it('no ofrece reportar el propio perfil y avisa que es vista previa si es privado', async () => {
    service.getPublicProfile.mockResolvedValue(makeProfile({ isPublic: false }))
    setup({ ...loggedUser, user: { ...loggedUser.user!, uid: 'u1' } })
    expect(await screen.findByText(/vista previa/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /reportar/i })).not.toBeInTheDocument()
  })

  it('muestra un error recuperable si falla la carga', async () => {
    service.getPublicProfile.mockRejectedValue(new Error('red'))
    setup()
    expect(await screen.findByText(/no se pudo cargar el perfil/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })
})
