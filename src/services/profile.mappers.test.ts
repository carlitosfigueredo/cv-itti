import { profileFormSchema, type ProfileFormInput } from '@/schemas/profile'
import { formToProfileContent } from './profile.mappers'

const base: ProfileFormInput = {
  displayName: '  Ana   Lopez ',
  headline: 'Contadora',
  area: 'finanzas',
  areaOther: 'ignorado',
  country: 'PY',
  city: ' Asunción ',
  summary: '',
  experienceYears: '7',
  skills: ['Excel', 'excel ', 'Atención al cliente'],
  workMode: 'remote',
  availability: 'available',
  linkedin: '',
  github: '',
  portfolio: '',
  contactEmailPublic: false,
  publicEmail: 'ana@x.com',
  contactPhonePublic: false,
  publicPhone: '+595 981 1',
  affectedGrupoVazquez: 'yes',
  affectedGrupoVazquezPublic: false,
}

const build = (input: ProfileFormInput) => formToProfileContent(profileFormSchema.parse(input))

describe('formToProfileContent', () => {
  it('normaliza ciudad, habilidades y tramo de experiencia', () => {
    const c = build(base)
    expect(c.displayName).toBe('Ana Lopez')
    expect(c.city).toBe('Asunción')
    expect(c.cityNormalized).toBe('asuncion')
    expect(c.skills).toEqual(['Excel', 'Atención al cliente'])
    expect(c.skillsNormalized).toEqual(['excel', 'atencion al cliente'])
    expect(c.experienceBand).toBe('5-9')
  })

  it('no publica contacto ni el flag sin consentimiento', () => {
    const c = build(base)
    expect(c).not.toHaveProperty('publicEmail')
    expect(c).not.toHaveProperty('publicPhone')
    expect(c).not.toHaveProperty('affectedGrupoVazquez')
    expect(c).not.toHaveProperty('areaOther')
    expect(c).not.toHaveProperty('summary')
  })

  it('incluye contacto y flag solo con consentimiento', () => {
    const c = build({
      ...base,
      contactEmailPublic: true,
      contactPhonePublic: true,
      affectedGrupoVazquezPublic: true,
    })
    expect(c.publicEmail).toBe('ana@x.com')
    expect(c.publicPhone).toBe('+595 981 1')
    expect(c.affectedGrupoVazquez).toBe(true)
  })

  it('genera palabras clave de busqueda a partir del perfil', () => {
    const c = build({ ...base, area: 'otro', areaOther: 'Seguros' })
    expect(c.searchTokens).toEqual(expect.arrayContaining(['contadora', 'conta', 'seguros', 'asuncion', 'excel', 'ana']))
  })

  it('guarda el area propia solo cuando el area es otro', () => {
    expect(build({ ...base, area: 'otro', areaOther: ' Seguros ' }).areaOther).toBe('Seguros')
  })

  it('no deja valores undefined', () => {
    expect(Object.values(build(base)).includes(undefined)).toBe(false)
  })
})
