import { render as rtlRender, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { makeProfile } from '@/test/fixtures'
import { PublicProfileView } from './PublicProfileView'

const wrap = (ui: ReactElement) => <MemoryRouter>{ui}</MemoryRouter>
const render = (ui: ReactElement) => {
  const result = rtlRender(wrap(ui))
  return { ...result, rerender: (next: ReactElement) => result.rerender(wrap(next)) }
}

describe('PublicProfileView', () => {
  it('muestra los datos basicos y las habilidades', () => {
    render(<PublicProfileView profile={makeProfile()} />)
    expect(screen.getByRole('heading', { level: 1, name: 'Ana Lopez' })).toBeInTheDocument()
    expect(screen.getByText('Contadora senior')).toBeInTheDocument()
    expect(screen.getByText('Asunción, Paraguay')).toBeInTheDocument()
    expect(screen.getByText('7 años de experiencia')).toBeInTheDocument()
    expect(screen.getByText('Excel')).toBeInTheDocument()
  })

  it('no muestra contacto ni enlaces cuando no hay datos publicos', () => {
    render(<PublicProfileView profile={makeProfile()} />)
    expect(screen.queryByText(/enlaces y contacto/i)).not.toBeInTheDocument()
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })

  it('muestra email y telefono solo si estan en el perfil', () => {
    render(
      <PublicProfileView
        profile={makeProfile({ contactEmailPublic: true, publicEmail: 'ana@x.com', contactPhonePublic: true, publicPhone: '+595 981 123456' })}
      />,
    )
    expect(screen.getByRole('link', { name: 'ana@x.com' })).toHaveAttribute('href', 'mailto:ana@x.com')
    expect(screen.getByRole('link', { name: '+595 981 123456' })).toHaveAttribute('href', 'tel:+595981123456')
  })

  it('abre enlaces externos de forma segura y descarta los que no son https', () => {
    render(
      <PublicProfileView
        profile={makeProfile({
          linkedin: 'https://linkedin.com/in/ana',
          github: 'javascript:alert(1)',
          portfolio: 'http://inseguro.com',
        })}
      />,
    )
    const link = screen.getByRole('link', { name: /linkedin/i })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
    expect(screen.queryByRole('link', { name: /github/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /portfolio/i })).not.toBeInTheDocument()
  })

  it('muestra la etiqueta de Grupo Vázquez solo con consentimiento y respuesta afirmativa', () => {
    const { rerender } = render(<PublicProfileView profile={makeProfile()} />)
    expect(screen.queryByText(/grupo vázquez/i)).not.toBeInTheDocument()
    rerender(<PublicProfileView profile={makeProfile({ affectedGrupoVazquezPublic: true, affectedGrupoVazquez: true })} />)
    expect(screen.getByText('Afectado por Grupo Vázquez')).toBeInTheDocument()
    rerender(<PublicProfileView profile={makeProfile({ affectedGrupoVazquezPublic: true, affectedGrupoVazquez: false })} />)
    expect(screen.queryByText(/grupo vázquez/i)).not.toBeInTheDocument()
  })

  it('ofrece descargar el CV solo si el perfil tiene CV', () => {
    const onDownload = vi.fn()
    const { rerender } = render(<PublicProfileView profile={makeProfile()} onDownloadCv={onDownload} />)
    expect(screen.queryByRole('button', { name: /descargar cv/i })).not.toBeInTheDocument()
    rerender(<PublicProfileView profile={makeProfile({ cvPath: 'cvs/u1/cv.pdf' })} onDownloadCv={onDownload} />)
    expect(screen.getByRole('button', { name: /descargar cv/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver términos' })).toHaveAttribute('href', '/legal/terminos')
  })

  it('muestra el area propia cuando es "otro" y la vista previa de un perfil privado', () => {
    render(<PublicProfileView profile={makeProfile({ area: 'otro', areaOther: 'Seguros', isPublic: false })} preview />)
    expect(screen.getByText('Seguros')).toBeInTheDocument()
    expect(screen.getByText(/vista previa/i)).toBeInTheDocument()
  })

  it('escapa el HTML del resumen (no lo interpreta)', () => {
    render(<PublicProfileView profile={makeProfile({ summary: '<img src=x onerror=alert(1)> hola' })} />)
    expect(screen.getByText(/<img src=x onerror=alert\(1\)> hola/)).toBeInTheDocument()
    expect(document.querySelector('img[src="x"]')).toBeNull()
  })
})
