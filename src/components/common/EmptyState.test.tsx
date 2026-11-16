import { render, screen } from '@testing-library/react'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('muestra titulo y descripcion', () => {
    render(<EmptyState title="Sin resultados" description="Prueba otros filtros" />)
    expect(screen.getByRole('heading', { name: 'Sin resultados' })).toBeInTheDocument()
    expect(screen.getByText('Prueba otros filtros')).toBeInTheDocument()
  })
})
