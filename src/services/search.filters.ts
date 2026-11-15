import type { DirectoryFilters } from '@/types/search'
import { AREAS, AVAILABILITIES, COUNTRY_CODES, EXPERIENCE_BANDS, WORK_MODES } from '@/types/profile'
import { collapseSpaces, normalizeText } from '@/utils/normalize'
import { searchTermFrom } from '@/utils/searchTokens'

// Nombres de parametros de la URL (el estado de la busqueda vive en la URL para
// poder compartir enlaces y usar el boton "atras").
const PARAMS = {
  q: 'q',
  area: 'area',
  country: 'pais',
  city: 'ciudad',
  experienceBand: 'experiencia',
  workMode: 'modalidad',
  availability: 'disponibilidad',
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
  const q = text(params.get(PARAMS.q), 60)
  const area = oneOf(params.get(PARAMS.area), AREAS)
  const country = oneOf(params.get(PARAMS.country), COUNTRY_CODES)
  const city = text(params.get(PARAMS.city), 60)
  const experienceBand = oneOf(params.get(PARAMS.experienceBand), EXPERIENCE_BANDS)
  const workMode = oneOf(params.get(PARAMS.workMode), WORK_MODES.filter((m) => m !== 'any'))
  const availability = oneOf(params.get(PARAMS.availability), AVAILABILITIES)

  if (q && searchTermFrom(q)) filters.q = q
  if (area) filters.area = area
  if (country) filters.country = country
  if (city) filters.city = city
  if (experienceBand) filters.experienceBand = experienceBand
  if (workMode) filters.workMode = workMode
  if (availability) filters.availability = availability
  return filters
}

export function filtersToParams(filters: DirectoryFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.q) params.set(PARAMS.q, filters.q)
  if (filters.area) params.set(PARAMS.area, filters.area)
  if (filters.country) params.set(PARAMS.country, filters.country)
  if (filters.city) params.set(PARAMS.city, filters.city)
  if (filters.experienceBand) params.set(PARAMS.experienceBand, filters.experienceBand)
  if (filters.workMode) params.set(PARAMS.workMode, filters.workMode)
  if (filters.availability) params.set(PARAMS.availability, filters.availability)
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
  const term = filters.q ? searchTermFrom(filters.q) : null
  if (term) specs.push({ field: 'searchTokens', op: 'array-contains', value: term })
  if (filters.area) specs.push({ field: 'area', op: '==', value: filters.area })
  if (filters.country) specs.push({ field: 'country', op: '==', value: filters.country })
  if (filters.city) specs.push({ field: 'cityNormalized', op: '==', value: normalizeText(filters.city) })
  if (filters.experienceBand) specs.push({ field: 'experienceBand', op: '==', value: filters.experienceBand })
  if (filters.workMode) specs.push({ field: 'workMode', op: 'in', value: [filters.workMode, 'any'] })
  if (filters.availability) specs.push({ field: 'availability', op: '==', value: filters.availability })
  return specs
}

// true si lo escrito tiene mas de una palabra: hoy se busca solo la primera.
export function searchUsesOnlyFirstWord(q: string | undefined): boolean {
  return Boolean(q && q.trim().split(/\s+/).filter((w) => w.length >= 2).length > 1)
}
