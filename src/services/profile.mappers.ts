import type { Timestamp } from 'firebase/firestore'
import type { ProfileFormInput, ProfileFormOutput } from '@/schemas/profile'
import type { ProfileContent, PublicProfile } from '@/types/profile'
import { AREA_LABELS } from '@/utils/catalogs'
import { collapseSpaces, experienceBandFor, normalizeText } from '@/utils/normalize'
import { buildSearchTokens } from '@/utils/searchTokens'

function dedupeSkills(skills: string[]): { skills: string[]; skillsNormalized: string[] } {
  const seen = new Set<string>()
  const result: string[] = []
  const normalized: string[] = []
  for (const raw of skills) {
    const display = collapseSpaces(raw)
    const key = normalizeText(display)
    if (!key || seen.has(key)) continue
    seen.add(key)
    result.push(display)
    normalized.push(key)
  }
  return { skills: result, skillsNormalized: normalized }
}

// Convierte los valores validados del formulario al documento de Firestore.
// Los campos opcionales vacios se omiten (Firestore no acepta undefined).
export function formToProfileContent(v: ProfileFormOutput): ProfileContent {
  const years = Number(v.experienceYears)
  const { skills, skillsNormalized } = dedupeSkills(v.skills)
  const city = collapseSpaces(v.city)
  const affected = v.affectedGrupoVazquez === 'yes'

  const content: ProfileContent = {
    displayName: collapseSpaces(v.displayName),
    headline: collapseSpaces(v.headline),
    area: v.area,
    country: v.country,
    city,
    cityNormalized: normalizeText(city),
    experienceYears: years,
    experienceBand: experienceBandFor(years),
    skills,
    skillsNormalized,
    workMode: v.workMode,
    availability: v.availability,
    contactEmailPublic: v.contactEmailPublic,
    contactPhonePublic: v.contactPhonePublic,
    affectedGrupoVazquezPublic: v.affectedGrupoVazquezPublic,
  }
  if (v.area === 'otro') content.areaOther = collapseSpaces(v.areaOther)
  content.searchTokens = buildSearchTokens({
    displayName: content.displayName,
    headline: content.headline,
    areaLabel: content.areaOther ?? AREA_LABELS[v.area],
    city,
    skills,
  })
  if (v.summary) content.summary = v.summary
  if (v.linkedin) content.linkedin = v.linkedin
  if (v.github) content.github = v.github
  if (v.portfolio) content.portfolio = v.portfolio
  if (v.contactEmailPublic) content.publicEmail = v.publicEmail
  if (v.contactPhonePublic) content.publicPhone = v.publicPhone
  if (v.affectedGrupoVazquezPublic) content.affectedGrupoVazquez = affected
  return content
}

export function emptyFormValues(displayName: string, email: string): Partial<ProfileFormInput> {
  return {
    displayName,
    headline: '',
    areaOther: '',
    city: '',
    summary: '',
    experienceYears: '',
    skills: [],
    linkedin: '',
    github: '',
    portfolio: '',
    contactEmailPublic: false,
    publicEmail: email,
    contactPhonePublic: false,
    publicPhone: '',
    affectedGrupoVazquezPublic: false,
    country: 'PY',
    workMode: 'any',
    availability: 'available',
  }
}

export function profileToFormValues(
  profile: PublicProfile,
  affected: boolean | null,
  email: string,
): Partial<ProfileFormInput> {
  return {
    displayName: profile.displayName,
    headline: profile.headline,
    area: profile.area,
    areaOther: profile.areaOther ?? '',
    country: profile.country,
    city: profile.city,
    summary: profile.summary ?? '',
    experienceYears: String(profile.experienceYears),
    skills: profile.skills,
    workMode: profile.workMode,
    availability: profile.availability,
    linkedin: profile.linkedin ?? '',
    github: profile.github ?? '',
    portfolio: profile.portfolio ?? '',
    contactEmailPublic: profile.contactEmailPublic,
    publicEmail: profile.publicEmail ?? email,
    contactPhonePublic: profile.contactPhonePublic,
    publicPhone: profile.publicPhone ?? '',
    affectedGrupoVazquez: affected === null ? undefined : affected ? 'yes' : 'no',
    affectedGrupoVazquezPublic: profile.affectedGrupoVazquezPublic,
  }
}

// Campos que el servicio agrega al escribir: no se calculan aqui para poder
// probar el mapeo sin Firebase.
export type ProfileWriteMeta = { uid: string; isPublic: boolean; createdAt: Timestamp | null }
