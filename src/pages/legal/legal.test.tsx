import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DisclaimerPage from './DisclaimerPage'
import PrivacyPage from './PrivacyPage'
import TermsPage from './TermsPage'

// Los datos del responsable vienen de variables de entorno: se fijan aca para que el
// resultado no dependa de donde se ejecuten las pruebas.
const legal = vi.hoisted(() => ({ owner: null as string | null, contactEmail: null as string | null }))
vi.mock('@/config/legal', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/config/legal')>()
  return {
    ...original,
    legalConfig: { ...original.legalConfig, get owner() { return legal.owner }, get contactEmail() { return legal.contactEmail } },
    get legalComplete() { return Boolean(legal.owner && legal.contactEmail) },
  }
})

beforeEach(() => {
  legal.owner = null
  legal.contactEmail = null
})

const renderPage = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>)

describe('paginas legales', () => {
  it.each([
    ['Términos y condiciones', TermsPage],
    ['Privacidad y tratamiento de datos', PrivacyPage],
    ['Descargo de responsabilidad', DisclaimerPage],
  ])('%s: titulo, fecha y enlaces a los otros textos', (title, Page) => {
    renderPage(<Page />)
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    expect(screen.getByText(/^última actualización:/i)).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Otros textos legales' })
    expect(nav).toHaveTextContent('Términos y condiciones')
    expect(nav).toHaveTextContent('Privacidad y datos')
    expect(nav).toHaveTextContent('Descargo de responsabilidad')
  })

  it('sin responsable ni email configurados avisa que es un borrador', () => {
    renderPage(<PrivacyPage />)
    expect(screen.getByText(/borrador: falta completar/i)).toBeInTheDocument()
    expect(screen.getAllByText(/\[email de contacto a definir\]/).length).toBeGreaterThan(0)
  })

  it('con responsable y email configurados no muestra el aviso de borrador', () => {
    legal.owner = 'Persona Responsable'
    legal.contactEmail = 'contacto@example.com'
    renderPage(<PrivacyPage />)
    expect(screen.queryByText(/borrador: falta completar/i)).not.toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'contacto@example.com' })[0]).toHaveAttribute('href', 'mailto:contacto@example.com')
    expect(screen.getAllByText(/persona responsable/i).length).toBeGreaterThan(0)
  })

  it('el descargo aclara que es una iniciativa independiente y no oficial', () => {
    renderPage(<DisclaimerPage />)
    expect(screen.getByRole('heading', { name: /iniciativa independiente y no oficial/i })).toBeInTheDocument()
    expect(screen.getByText(/no es un sitio oficial/i)).toBeInTheDocument()
  })

  it('la politica de privacidad informa donde se guardan los datos y la ley de referencia', () => {
    renderPage(<PrivacyPage />)
    expect(screen.getByText(/estados unidos \(región us-central1\)/i)).toBeInTheDocument()
    expect(screen.getByText(/ley n\.º 7593\/2025/i)).toBeInTheDocument()
  })
})
