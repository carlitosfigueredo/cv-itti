import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
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
      <Route
        path="/"
        element={
          <>
            <Header />
            <HomePage />
            <ShowLocation />
          </>
        }
      />
      <Route path="/talentos" element={<TalentSearchPage />} />
    </Routes>,
    auth,
    url,
  )

const lastFilters = () => service.searchProfiles.mock.calls.at(-1)?.[0]

beforeEach(() => {
  vi.clearAllMocks()
  service.searchProfiles.mockResolvedValue({ profiles: [], cursor: null, hasMore: false })
})

describe('HomePage', () => {
  it('muestra directamente el directorio; el header invita a cargar el CV', async () => {
    setup()
    expect(screen.getByRole('heading', { level: 1, name: 'Talentos' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Cargar mi CV' })).toHaveAttribute('href', '/login')
    expect(screen.queryByText(/comunidad itti y grupo vázquez/i)).not.toBeInTheDocument()
    await waitFor(() => expect(service.searchProfiles).toHaveBeenCalledWith({}))
  })

  it('con sesion iniciada no muestra "Cargar mi CV" en el header', () => {
    setup('/', loggedUser)
    expect(screen.queryByRole('link', { name: 'Cargar mi CV' })).not.toBeInTheDocument()
  })

  it('sin perfiles publicados invita a sumarse', async () => {
    setup()
    expect(await screen.findByText('Todavía no hay perfiles publicados')).toBeInTheDocument()
  })

  it('lee los filtros iniciales desde la URL e ignora los invalidos o viejos', async () => {
    setup('/?q=conta&area=finanzas&pais=ZZ&grupo-vazquez=1')
    await waitFor(() => expect(service.searchProfiles).toHaveBeenCalledTimes(1))
    expect(lastFilters()).toEqual({ q: 'conta', area: 'finanzas' })
    expect(screen.getByRole('searchbox', { name: 'Buscar talentos' })).toHaveValue('conta')
    expect(await screen.findByText('Nadie coincide con estos filtros')).toBeInTheDocument()
  })

  it('la caja de busqueda espera a que se deje de escribir y hace una sola consulta', async () => {
    setup()
    await waitFor(() => expect(service.searchProfiles).toHaveBeenCalledTimes(1))
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar talentos' }), 'contadora')
    await waitFor(() => expect(lastFilters()).toEqual({ q: 'contadora' }), { timeout: 2000 })
    expect(service.searchProfiles).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('searchbox', { name: 'Buscar talentos' })).toHaveValue('contadora')
  })

  it('avisa cuando se escribe mas de una palabra', async () => {
    setup()
    await userEvent.type(screen.getByRole('searchbox', { name: 'Buscar talentos' }), 'contadora senior')
    expect(screen.getByText(/buscamos por “contadora”/i)).toBeInTheDocument()
  })

  it('los filtros rapidos se aplican al instante y se pueden desactivar', async () => {
    setup()
    await waitFor(() => expect(service.searchProfiles).toHaveBeenCalledTimes(1))
    const remote = screen.getByRole('button', { name: 'Remoto' })
    await userEvent.click(remote)
    await waitFor(() => expect(lastFilters()).toEqual({ workMode: 'remote' }))
    expect(screen.getByRole('button', { name: 'Remoto' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Más filtros' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Remoto' }))
    await waitFor(() => expect(lastFilters()).toEqual({}))
  })

  it('cada filtro activo se ve como chip y se puede quitar; "Limpiar todo" quita todos', async () => {
    setup('/?area=legal&experiencia=10%2B&disponibilidad=available')
    await waitFor(() => expect(lastFilters()).toEqual({ area: 'legal', experienceBand: '10+', availability: 'available' }))
    const filtersRegion = screen.getByRole('region', { name: /filtros de búsqueda/i })
    await userEvent.click(within(filtersRegion).getByTitle('Quitar filtro Legal'))
    await waitFor(() => expect(lastFilters()).toEqual({ experienceBand: '10+', availability: 'available' }))
    // "Disponibles" se muestra activo como filtro rapido, no se repite como chip.
    expect(within(filtersRegion).queryByTitle('Quitar filtro Disponible')).not.toBeInTheDocument()
    expect(within(filtersRegion).getByRole('button', { name: 'Disponibles' })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(within(filtersRegion).getByRole('button', { name: 'Limpiar todo' }))
    await waitFor(() => expect(lastFilters()).toEqual({}))
  })

  it('"Más filtros" abre un panel y aplica los cambios al confirmar', async () => {
    setup()
    await waitFor(() => expect(service.searchProfiles).toHaveBeenCalledTimes(1))
    await userEvent.click(screen.getByRole('button', { name: /más filtros/i }))
    const panel = await screen.findByRole('presentation')
    await userEvent.click(within(panel).getByRole('combobox', { name: 'Experiencia' }))
    await userEvent.click(await screen.findByRole('option', { name: '10 años o más' }))
    expect(service.searchProfiles).toHaveBeenCalledTimes(1)
    await userEvent.click(within(panel).getByRole('button', { name: 'Ver resultados' }))
    await waitFor(() => expect(lastFilters()).toEqual({ experienceBand: '10+' }))
  })

  it('los enlaces viejos a /talentos redirigen al inicio conservando los filtros', async () => {
    setup('/talentos?area=legal')
    expect(await screen.findByTestId('location')).toHaveTextContent('/?area=legal')
  })
})
