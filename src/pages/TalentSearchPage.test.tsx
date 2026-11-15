import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TalentSearchPage from './TalentSearchPage'

const service = vi.hoisted(() => ({ searchProfiles: vi.fn() }))
vi.mock('@/services/search.service', () => service)

const setup = (url = '/talentos') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <TalentSearchPage />
    </MemoryRouter>,
  )

beforeEach(() => {
  vi.clearAllMocks()
  service.searchProfiles.mockResolvedValue({ profiles: [], cursor: null, hasMore: false })
})

describe('TalentSearchPage', () => {
  it('lee los filtros iniciales desde la URL e ignora los invalidos', async () => {
    setup('/talentos?area=finanzas&pais=ZZ&experiencia=5-9')
    await waitFor(() => expect(service.searchProfiles).toHaveBeenCalledTimes(1))
    expect(service.searchProfiles).toHaveBeenCalledWith({ area: 'finanzas', experienceBand: '5-9' })
  })

  it('al buscar con un filtro nuevo se consulta de nuevo con ese filtro', async () => {
    setup()
    await waitFor(() => expect(service.searchProfiles).toHaveBeenCalledTimes(1))
    await userEvent.click(screen.getByLabelText('Solo personas afectadas por Grupo Vázquez (que eligieron mostrarlo)'))
    await userEvent.click(screen.getByRole('button', { name: 'Buscar' }))
    await waitFor(() => expect(service.searchProfiles).toHaveBeenCalledTimes(2))
    expect(service.searchProfiles).toHaveBeenLastCalledWith({ affectedGrupoVazquez: true })
  })

  it('"Limpiar filtros" vuelve a la busqueda sin filtros', async () => {
    setup('/talentos?area=legal')
    await waitFor(() => expect(service.searchProfiles).toHaveBeenCalledWith({ area: 'legal' }))
    const filtersForm = screen.getByRole('region', { name: /filtros de búsqueda/i })
    await userEvent.click(within(filtersForm).getByRole('button', { name: 'Limpiar filtros' }))
    await waitFor(() => expect(service.searchProfiles).toHaveBeenLastCalledWith({}))
  })
})
