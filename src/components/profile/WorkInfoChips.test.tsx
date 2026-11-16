import { render, screen } from '@testing-library/react'
import { WorkInfoChips } from './WorkInfoChips'

describe('WorkInfoChips', () => {
  it('muestra disponibilidad y modalidad con texto explicito', () => {
    render(<WorkInfoChips availability="available" workMode="any" />)
    expect(screen.getByText('Disponible ahora')).toBeInTheDocument()
    expect(screen.getByText('Cualquier modalidad')).toBeInTheDocument()
  })

  it('distingue a quien no esta disponible', () => {
    render(<WorkInfoChips availability="not_available" workMode="remote" />)
    expect(screen.getByText('No disponible por ahora')).toBeInTheDocument()
    expect(screen.getByText('Remoto')).toBeInTheDocument()
  })
})
