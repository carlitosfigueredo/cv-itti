import { profileFormSchema, type ProfileFormInput } from './profile'

const valid: ProfileFormInput = {
  displayName: 'Ana Lopez',
  headline: 'Contadora senior',
  area: 'finanzas',
  areaOther: '',
  country: 'PY',
  city: 'Asuncion',
  summary: '',
  experienceYears: '7',
  skills: ['Excel'],
  workMode: 'hybrid',
  availability: 'available',
  linkedin: '',
  github: '',
  portfolio: '',
  contactEmailPublic: false,
  publicEmail: '',
  contactPhonePublic: false,
  publicPhone: '',
  affectedGrupoVazquez: 'no',
  affectedGrupoVazquezPublic: false,
}

const messages = (input: unknown) => {
  const r = profileFormSchema.safeParse(input)
  return r.success ? [] : r.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`)
}

describe('profileFormSchema', () => {
  it('acepta un perfil minimo valido', () => {
    expect(profileFormSchema.safeParse(valid).success).toBe(true)
  })

  it('exige la respuesta sobre Grupo Vazquez', () => {
    const { affectedGrupoVazquez: _omitted, ...rest } = valid
    void _omitted
    expect(messages(rest).join()).toContain('affectedGrupoVazquez')
  })

  it('exige texto cuando el area es "otro"', () => {
    expect(messages({ ...valid, area: 'otro', areaOther: '' }).join()).toContain('areaOther')
    expect(profileFormSchema.safeParse({ ...valid, area: 'otro', areaOther: 'Seguros' }).success).toBe(true)
  })

  it('rechaza enlaces que no sean https', () => {
    expect(messages({ ...valid, linkedin: 'http://x.com' }).join()).toContain('linkedin')
    expect(messages({ ...valid, github: 'javascript:alert(1)' }).join()).toContain('github')
    expect(profileFormSchema.safeParse({ ...valid, github: 'https://github.com/ana' }).success).toBe(true)
  })

  it('valida el email solo cuando se decide publicarlo', () => {
    expect(profileFormSchema.safeParse({ ...valid, publicEmail: 'no-es-email' }).success).toBe(true)
    expect(messages({ ...valid, contactEmailPublic: true, publicEmail: 'no-es-email' }).join()).toContain('publicEmail')
  })

  it('valida el telefono solo cuando se decide publicarlo', () => {
    expect(messages({ ...valid, contactPhonePublic: true, publicPhone: 'abc' }).join()).toContain('publicPhone')
    expect(profileFormSchema.safeParse({ ...valid, contactPhonePublic: true, publicPhone: '+595 981 123456' }).success).toBe(true)
  })

  it('limita anios de experiencia y cantidad de habilidades', () => {
    expect(messages({ ...valid, experienceYears: '51' }).join()).toContain('experienceYears')
    expect(messages({ ...valid, experienceYears: '-1' }).join()).toContain('experienceYears')
    expect(messages({ ...valid, skills: Array.from({ length: 16 }, (_, i) => `s${i}`) }).join()).toContain('skills')
  })
})
