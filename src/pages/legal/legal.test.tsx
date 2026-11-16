import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DisclaimerPage from './DisclaimerPage'
import PrivacyPage from './PrivacyPage'
import TermsPage from './TermsPage'

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
