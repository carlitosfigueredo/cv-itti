import { buildFilterSpecs, filtersToParams, parseFilters } from './search.filters'

const parse = (query: string) => parseFilters(new URLSearchParams(query))

describe('parseFilters', () => {
  it('lee filtros validos', () => {
    expect(parse('area=finanzas&pais=PY&ciudad=Asunci%C3%B3n&experiencia=5-9&modalidad=remote&disponibilidad=available&habilidad=Excel&grupo-vazquez=1')).toEqual({
      area: 'finanzas',
      country: 'PY',
      city: 'Asunción',
      experienceBand: '5-9',
      workMode: 'remote',
      availability: 'available',
      skill: 'Excel',
      affectedGrupoVazquez: true,
    })
  })

  it('ignora valores invalidos o maliciosos', () => {
    expect(parse('area=hacker&pais=ZZ&experiencia=100&modalidad=any&disponibilidad=x&grupo-vazquez=0')).toEqual({})
    expect(parse('ciudad=a&habilidad=')).toEqual({})
  })

  it('limita el largo de los textos y normaliza espacios', () => {
    expect(parse(`ciudad=${'a'.repeat(200)}`).city).toHaveLength(60)
    expect(parse('habilidad=%20%20Gestion%20%20%20de%20proyectos%20').skill).toBe('Gestion de proyectos')
  })

  it('ida y vuelta: filtros -> URL -> filtros', () => {
    const filters = { area: 'tecnologia', country: 'AR', skill: 'React', affectedGrupoVazquez: true } as const
    expect(parseFilters(filtersToParams(filters))).toEqual(filters)
    expect(filtersToParams({}).toString()).toBe('')
  })
})

describe('buildFilterSpecs', () => {
  it('siempre exige isPublic == true', () => {
    expect(buildFilterSpecs({})).toEqual([{ field: 'isPublic', op: '==', value: true }])
  })

  it('usa los campos normalizados para ciudad y habilidad', () => {
    const specs = buildFilterSpecs({ city: 'Asunción', skill: 'Atención  al Cliente' })
    expect(specs).toContainEqual({ field: 'cityNormalized', op: '==', value: 'asuncion' })
    expect(specs).toContainEqual({ field: 'skillsNormalized', op: 'array-contains', value: 'atencion al cliente' })
  })

  it('incluye a los perfiles con modalidad "cualquiera" en cada modalidad', () => {
    expect(buildFilterSpecs({ workMode: 'remote' })).toContainEqual({ field: 'workMode', op: 'in', value: ['remote', 'any'] })
  })

  it('filtra Grupo Vazquez solo sobre la copia publica', () => {
    expect(buildFilterSpecs({ affectedGrupoVazquez: true })).toContainEqual({ field: 'affectedGrupoVazquez', op: '==', value: true })
  })

  it('combina todos los filtros', () => {
    const specs = buildFilterSpecs({
      area: 'ventas', country: 'PY', city: 'Luque', experienceBand: '2-4',
      workMode: 'hybrid', availability: 'available', skill: 'Ventas', affectedGrupoVazquez: true,
    })
    expect(specs.map((s) => s.field)).toEqual([
      'isPublic', 'area', 'country', 'cityNormalized', 'experienceBand', 'workMode', 'availability', 'skillsNormalized', 'affectedGrupoVazquez',
    ])
  })
})
