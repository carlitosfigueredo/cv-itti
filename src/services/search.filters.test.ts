import { buildFilterSpecs, filtersToParams, parseFilters, searchUsesOnlyFirstWord } from './search.filters'

const parse = (query: string) => parseFilters(new URLSearchParams(query))

describe('parseFilters', () => {
  it('lee filtros validos', () => {
    expect(parse('q=Contadora&area=finanzas&pais=PY&ciudad=Asunci%C3%B3n&experiencia=5-9&modalidad=remote&disponibilidad=available')).toEqual({
      q: 'Contadora',
      area: 'finanzas',
      country: 'PY',
      city: 'Asunción',
      experienceBand: '5-9',
      workMode: 'remote',
      availability: 'available',
    })
  })

  it('ignora valores invalidos o maliciosos', () => {
    expect(parse('area=hacker&pais=ZZ&experiencia=100&modalidad=any&disponibilidad=x')).toEqual({})
    expect(parse('ciudad=a&q=')).toEqual({})
    expect(parse('q=%20%20a%20')).toEqual({})
  })

  it('ignora parametros que ya no existen (enlaces viejos)', () => {
    expect(parse('grupo-vazquez=1&habilidad=Excel')).toEqual({})
  })

  it('limita el largo de los textos y normaliza espacios', () => {
    expect(parse(`ciudad=${'a'.repeat(200)}`).city).toHaveLength(60)
    expect(parse('q=%20%20Gestion%20%20%20de%20proyectos%20').q).toBe('Gestion de proyectos')
  })

  it('ida y vuelta: filtros -> URL -> filtros', () => {
    const filters = { q: 'react', area: 'tecnologia', country: 'AR', availability: 'available' } as const
    expect(parseFilters(filtersToParams(filters))).toEqual(filters)
    expect(filtersToParams({}).toString()).toBe('')
  })
})

describe('buildFilterSpecs', () => {
  it('siempre exige isPublic == true', () => {
    expect(buildFilterSpecs({})).toEqual([{ field: 'isPublic', op: '==', value: true }])
  })

  it('la caja de busqueda usa la primera palabra normalizada', () => {
    expect(buildFilterSpecs({ q: 'Contadóra senior' })).toContainEqual({ field: 'searchTokens', op: 'array-contains', value: 'contadora' })
  })

  it('usa el campo normalizado para la ciudad', () => {
    expect(buildFilterSpecs({ city: 'Asunción' })).toContainEqual({ field: 'cityNormalized', op: '==', value: 'asuncion' })
  })

  it('incluye a los perfiles con modalidad "cualquiera" en cada modalidad', () => {
    expect(buildFilterSpecs({ workMode: 'remote' })).toContainEqual({ field: 'workMode', op: 'in', value: ['remote', 'any'] })
  })

  it('combina todos los filtros', () => {
    const specs = buildFilterSpecs({
      q: 'ventas', area: 'ventas', country: 'PY', city: 'Luque', experienceBand: '2-4', workMode: 'hybrid', availability: 'available',
    })
    expect(specs.map((s) => s.field)).toEqual([
      'isPublic', 'searchTokens', 'area', 'country', 'cityNormalized', 'experienceBand', 'workMode', 'availability',
    ])
  })
})

describe('searchUsesOnlyFirstWord', () => {
  it('avisa solo cuando hay mas de una palabra', () => {
    expect(searchUsesOnlyFirstWord('contadora')).toBe(false)
    expect(searchUsesOnlyFirstWord('contadora senior')).toBe(true)
    expect(searchUsesOnlyFirstWord(undefined)).toBe(false)
  })
})
