import { experienceBandFor, initialsOf, normalizeText } from './normalize'

describe('normalize', () => {
  it('normaliza tildes, mayusculas y espacios', () => {
    expect(normalizeText('  Asunción   Central ')).toBe('asuncion central')
  })

  it.each([
    [0, '0-1'], [1, '0-1'], [2, '2-4'], [4, '2-4'], [5, '5-9'], [9, '5-9'], [10, '10+'], [50, '10+'],
  ])('tramo de experiencia para %i anios es %s', (years, band) => {
    expect(experienceBandFor(years)).toBe(band)
  })

  it('calcula iniciales', () => {
    expect(initialsOf('ana maria lopez')).toBe('AL')
    expect(initialsOf('Ana')).toBe('A')
    expect(initialsOf('   ')).toBe('?')
  })
})
