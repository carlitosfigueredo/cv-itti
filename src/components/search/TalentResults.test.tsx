import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { makeProfile } from '@/test/fixtures'
import { TalentResults } from './TalentResults'

const service = vi.hoisted(() => ({ searchProfiles: vi.fn() }))
vi.mock('@/services/search.service', () => service)

const profile = (uid: string, name: string, extra = {}) => makeProfile({ uid, displayName: name, ...extra })
const setup = (filters = {}, onClear = vi.fn()) =>
  render(
    <MemoryRouter>
      <TalentResults filters={filters} onClear={onClear} />
    </MemoryRouter>,
  )

beforeEach(() => vi.clearAllMocks())

describe('TalentResults', () => {
  it('muestra la carga y luego las tarjetas con enlace al perfil', async () => {
    service.searchProfiles.mockResolvedValue({ profiles: [profile('a', 'Ana Perez'), profile('b', 'Beto Gomez')], cursor: null, hasMore: false })
    setup()
    expect(screen.getByRole('status', { name: /cargando/i })).toBeInTheDocument()
    expect(await screen.findByText('Ana Perez')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver perfil completo de Beto Gomez' })).toHaveAttribute('href', '/talentos/b')
    // Un solo enlace por tarjeta: el boton explicito.
    expect(screen.getAllByRole('link')).toHaveLength(2)
    expect(screen.getAllByText('Ver perfil completo')).toHaveLength(2)
    expect(screen.getByText('2 perfiles')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /ver más/i })).not.toBeInTheDocument()
  })

  it('pasa los filtros a la busqueda', async () => {
    service.searchProfiles.mockResolvedValue({ profiles: [], cursor: null, hasMore: false })
    setup({ area: 'finanzas', country: 'PY' })
    await screen.findByText('Nadie coincide con estos filtros')
    expect(service.searchProfiles).toHaveBeenCalledWith({ area: 'finanzas', country: 'PY' })
  })

  it('pagina: "Ver más" agrega resultados usando el cursor', async () => {
    const cursor = { id: 'cursor-1' }
    service.searchProfiles
      .mockResolvedValueOnce({ profiles: [profile('a', 'Ana Perez')], cursor, hasMore: true })
      .mockResolvedValueOnce({ profiles: [profile('b', 'Beto Gomez')], cursor: null, hasMore: false })
    setup()
    await userEvent.click(await screen.findByRole('button', { name: /ver más/i }))
    expect(await screen.findByText('Beto Gomez')).toBeInTheDocument()
    expect(screen.getByText('Ana Perez')).toBeInTheDocument()
    expect(service.searchProfiles).toHaveBeenLastCalledWith({}, cursor)
    expect(screen.queryByRole('button', { name: /ver más/i })).not.toBeInTheDocument()
  })

  it('conserva lo cargado y permite reintentar si falla "Ver más"', async () => {
    service.searchProfiles
      .mockResolvedValueOnce({ profiles: [profile('a', 'Ana Perez')], cursor: {}, hasMore: true })
      .mockRejectedValueOnce(new Error('red'))
    setup()
    await userEvent.click(await screen.findByRole('button', { name: /ver más/i }))
    expect(await screen.findByText(/no se pudieron cargar más perfiles/i)).toBeInTheDocument()
    expect(screen.getByText('Ana Perez')).toBeInTheDocument()
  })

  it('estado vacio con boton para limpiar filtros', async () => {
    service.searchProfiles.mockResolvedValue({ profiles: [], cursor: null, hasMore: false })
    const onClear = vi.fn()
    setup({}, onClear)
    await userEvent.click(await screen.findByRole('button', { name: /limpiar filtros/i }))
    expect(onClear).toHaveBeenCalled()
  })

  it('error con reintento', async () => {
    service.searchProfiles.mockRejectedValueOnce(new Error('red')).mockResolvedValueOnce({ profiles: [profile('a', 'Ana Perez')], cursor: null, hasMore: false })
    setup()
    await userEvent.click(await screen.findByRole('button', { name: /reintentar/i }))
    expect(await screen.findByText('Ana Perez')).toBeInTheDocument()
  })

  it('la tarjeta muestra la etiqueta de Grupo Vázquez solo con consentimiento', async () => {
    service.searchProfiles.mockResolvedValue({
      profiles: [
        profile('a', 'Con Consentimiento', { affectedGrupoVazquezPublic: true, affectedGrupoVazquez: true }),
        profile('b', 'Sin Consentimiento'),
      ],
      cursor: null,
      hasMore: false,
    })
    setup()
    await screen.findByText('Con Consentimiento')
    expect(screen.getAllByText('Afectado por Grupo Vázquez')).toHaveLength(1)
  })

  it('muestra "+N" cuando hay mas habilidades que las visibles', async () => {
    const skills = ['A1', 'B2', 'C3', 'D4', 'E5', 'F6']
    service.searchProfiles.mockResolvedValue({ profiles: [profile('a', 'Ana', { skills, skillsNormalized: skills.map((s) => s.toLowerCase()) })], cursor: null, hasMore: false })
    setup()
    expect(await screen.findByText('+2')).toBeInTheDocument()
    expect(screen.queryByText('F6')).not.toBeInTheDocument()
  })
})
