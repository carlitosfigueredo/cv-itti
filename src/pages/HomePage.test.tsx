import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { anonymous, loggedUser, renderWithAuth } from '@/test/renderWithAuth'
import HomePage from './HomePage'
import TalentSearchPage from './TalentSearchPage'

const service = vi.hoisted(() => ({ searchProfiles: vi.fn() }))
vi.mock('@/services/search.service', () => service)

function ShowLocation() {
  const location = useLocation()
  return <p data-testid="location">{location.pathname + location.search}</p>
}

const setup = (url = '/', auth = anonymous) =>
  renderWithAuth(
    <Routes>
      <Route path="/" element={<><HomePage /><ShowLocation /></>} />
      <Route path="/talentos" element={<TalentSearchPage />} />
    </Routes>,
    auth,
    url,
  )

beforeEach(() => {
  vi.clearAllMocks()
  service.searchProfiles.mockResolvedValue({ profiles: [], cursor: null, hasMore: false })
})

describe('HomePage', () => {
  it('muestra el bloque para cargar el CV y el directorio en la misma pantalla', async () => {
    setup()
    expect(screen.getByRole('heading', { name: /cargá tu cv/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cargar mi cv/i })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('heading', { name: 'Talentos' })).toBeInTheDocument()
    await waitFor(() => expect(service.searchProfiles).toHaveBeenCalledWith({}))
  })

  it('con sesion iniciada el bloque lleva al panel', () => {
    setup('/', loggedUser)
    expect(screen.getByRole('link', { name: /ir a mi panel/i })).toHaveAttribute('href', '/dashboard')
  })

  it('sin perfiles publicados invita a sumarse; con filtros ofrece limpiarlos', async () => {
    setup()
    expect(await screen.findByText('Todavía no hay perfiles publicados')).toBeInTheDocument()
  })

  it('lee los filtros iniciales desde la URL e ignora los invalidos', async () => {
    setup('/?area=finanzas&pais=ZZ&experiencia=5-9')
    await waitFor(() => expect(service.searchProfiles).toHaveBeenCalledTimes(1))
    expect(service.searchProfiles).toHaveBeenCalledWith({ area: 'finanzas', experienceBand: '5-9' })
    expect(await screen.findByText('Nadie coincide con estos filtros')).toBeInTheDocument()
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
    setup('/?area=legal')
    await waitFor(() => expect(service.searchProfiles).toHaveBeenCalledWith({ area: 'legal' }))
    const filtersForm = screen.getByRole('region', { name: /filtros de búsqueda/i })
    await userEvent.click(within(filtersForm).getByRole('button', { name: 'Limpiar filtros' }))
    await waitFor(() => expect(service.searchProfiles).toHaveBeenLastCalledWith({}))
  })

  it('los enlaces viejos a /talentos redirigen al inicio conservando los filtros', async () => {
    setup('/talentos?area=legal')
    expect(await screen.findByTestId('location')).toHaveTextContent('/?area=legal')
  })
})
