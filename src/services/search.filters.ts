import type { DirectoryFilters } from '@/types/search'
import {
  AREAS,
  AVAILABILITIES,
  COUNTRY_CODES,
  EXPERIENCE_BANDS,
  WORK_MODES,
} from '@/types/profile'
import { collapseSpaces, normalizeText } from '@/utils/normalize'

// Nombres de parametros de la URL (el estado de la busqueda vive en la URL para
// poder compartir enlaces y usar el boton "atras").
const PARAMS = {
  area: 'area',
  country: 'pais',
  city: 'ciudad',
  experienceBand: 'experiencia',
  workMode: 'modalidad',
  availability: 'disponibilidad',
  skill: 'habilidad',
  affectedGrupoVazquez: 'grupo-vazquez',
} as const

function oneOf<T extends string>(value: string | null, allowed: readonly T[]): T | undefined {
  return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : undefined
}

function text(value: string | null, max: number): string | undefined {
  if (value === null) return undefined
  const cleaned = collapseSpaces(value).slice(0, max)
  return cleaned.length >= 2 ? cleaned : undefined
}

// Los valores invalidos de la URL se ignoran: nunca llegan a la consulta.
export function parseFilters(params: URLSearchParams): DirectoryFilters {
  const filters: DirectoryFilters = {}
  const area = oneOf(params.get(PARAMS.area), AREAS)
  const country = oneOf(params.get(PARAMS.country), COUNTRY_CODES)
  const city = text(params.get(PARAMS.city), 60)
  const experienceBand = oneOf(params.get(PARAMS.experienceBand), EXPERIENCE_BANDS)
  const workMode = oneOf(params.get(PARAMS.workMode), WORK_MODES.filter((m) => m !== 'any'))
  const availability = oneOf(params.get(PARAMS.availability), AVAILABILITIES)
  const skill = text(params.get(PARAMS.skill), 40)

  if (area) filters.area = area
  if (country) filters.country = country
  if (city) filters.city = city
  if (experienceBand) filters.experienceBand = experienceBand
  if (workMode) filters.workMode = workMode
  if (availability) filters.availability = availability
  if (skill) filters.skill = skill
  if (params.get(PARAMS.affectedGrupoVazquez) === '1') filters.affectedGrupoVazquez = true
  return filters
}

export function filtersToParams(filters: DirectoryFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.area) params.set(PARAMS.area, filters.area)
  if (filters.country) params.set(PARAMS.country, filters.country)
  if (filters.city) params.set(PARAMS.city, filters.city)
  if (filters.experienceBand) params.set(PARAMS.experienceBand, filters.experienceBand)
  if (filters.workMode) params.set(PARAMS.workMode, filters.workMode)
  if (filters.availability) params.set(PARAMS.availability, filters.availability)
  if (filters.skill) params.set(PARAMS.skill, filters.skill)
  if (filters.affectedGrupoVazquez) params.set(PARAMS.affectedGrupoVazquez, '1')
  return params
}

export interface FilterSpec {
  field: string
  op: '==' | 'in' | 'array-contains'
  value: unknown
}

// Traduce los filtros a condiciones de Firestore. Siempre incluye isPublic == true:
// las reglas rechazan cualquier listado que no lo haga.
export function buildFilterSpecs(filters: DirectoryFilters): FilterSpec[] {
  const specs: FilterSpec[] = [{ field: 'isPublic', op: '==', value: true }]
  if (filters.area) specs.push({ field: 'area', op: '==', value: filters.area })
  if (filters.country) specs.push({ field: 'country', op: '==', value: filters.country })
  if (filters.city) specs.push({ field: 'cityNormalized', op: '==', value: normalizeText(filters.city) })
  if (filters.experienceBand) specs.push({ field: 'experienceBand', op: '==', value: filters.experienceBand })
  if (filters.workMode) specs.push({ field: 'workMode', op: 'in', value: [filters.workMode, 'any'] })
  if (filters.availability) specs.push({ field: 'availability', op: '==', value: filters.availability })
  if (filters.skill) specs.push({ field: 'skillsNormalized', op: 'array-contains', value: normalizeText(filters.skill) })
  if (filters.affectedGrupoVazquez) specs.push({ field: 'affectedGrupoVazquez', op: '==', value: true })
  return specs
}
