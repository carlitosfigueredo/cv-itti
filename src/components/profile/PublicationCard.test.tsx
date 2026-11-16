import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { makeProfile } from '@/test/fixtures'
import { PublicationCard } from './PublicationCard'

const service = vi.hoisted(() => ({ setProfilePublished: vi.fn() }))
vi.mock('@/services/profile.service', () => service)

const setup = (isPublic: boolean, onChanged = vi.fn().mockResolvedValue(undefined)) => {
  render(
    <MemoryRouter>
      <PublicationCard profile={makeProfile({ isPublic })} onChanged={onChanged} />
    </MemoryRouter>,
  )
  return onChanged
}

beforeEach(() => vi.clearAllMocks())

describe('PublicationCard', () => {
  it('un perfil privado ofrece vista previa y no se publica sin confirmar', async () => {
    setup(false)
    expect(screen.getByRole('status')).toHaveTextContent('Tu perfil es privado.')
    expect(screen.queryByRole('button', { name: 'Dejar de publicar' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /vista previa/i })).toHaveAttribute('href', '/talentos/u1')
    await userEvent.click(screen.getByRole('button', { name: 'Publicar mi perfil' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(service.setProfilePublished).not.toHaveBeenCalled()
  })

  it('publica solo despues de confirmar y refresca', async () => {
    service.setProfilePublished.mockResolvedValue(undefined)
    const onChanged = setup(false)
    await userEvent.click(screen.getByRole('button', { name: 'Publicar mi perfil' }))
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Publicar' }))
    await waitFor(() => expect(service.setProfilePublished).toHaveBeenCalledWith('u1', true))
    await waitFor(() => expect(onChanged).toHaveBeenCalled())
  })

  it('el dialogo aclara que contacto y Grupo Vázquez dependen del consentimiento', async () => {
    setup(false)
    await userEvent.click(screen.getByRole('button', { name: 'Publicar mi perfil' }))
    const dialog = await screen.findByRole('dialog')
    expect(dialog).toHaveTextContent(/hoy no marcaste ninguno/i)
    expect(dialog).toHaveTextContent(/hoy no lo diste/i)
  })

  it('al dejar de publicar lo hace de inmediato, sin confirmacion', async () => {
    service.setProfilePublished.mockResolvedValue(undefined)
    setup(true)
    expect(screen.getByRole('status')).toHaveTextContent('Tu perfil está publicado.')
    expect(screen.getByRole('link', { name: 'Ver mi perfil público' })).toHaveAttribute('href', '/talentos/u1')
    await userEvent.click(screen.getByRole('button', { name: 'Dejar de publicar' }))
    await waitFor(() => expect(service.setProfilePublished).toHaveBeenCalledWith('u1', false))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('muestra un error si las reglas rechazan el cambio', async () => {
    service.setProfilePublished.mockRejectedValue(new Error('permission-denied'))
    setup(false)
    await userEvent.click(screen.getByRole('button', { name: 'Publicar mi perfil' }))
    await userEvent.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Publicar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo publicar/i)
  })
})
