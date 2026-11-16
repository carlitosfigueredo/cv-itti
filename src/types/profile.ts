import type { Timestamp } from 'firebase/firestore/lite'

// Catalogos cerrados. Los codigos se guardan en Firestore; las etiquetas
// para mostrar viven en utils/catalogs.ts.
export const AREAS = [
  'tecnologia',
  'finanzas',
  'ventas',
  'administracion',
  'operaciones',
  'rrhh',
  'marketing',
  'legal',
  'atencion_cliente',
  'otro',
] as const
export type Area = (typeof AREAS)[number]

export const COUNTRY_CODES = [
  'PY', 'AR', 'BR', 'UY', 'CL', 'BO', 'PE', 'CO', 'EC', 'VE', 'MX', 'US', 'ES', 'OTHER',
] as const
export type CountryCode = (typeof COUNTRY_CODES)[number]

export const WORK_MODES = ['remote', 'hybrid', 'onsite', 'any'] as const
export type WorkMode = (typeof WORK_MODES)[number]

export const AVAILABILITIES = ['available', 'not_available'] as const
export type Availability = (typeof AVAILABILITIES)[number]

export const EXPERIENCE_BANDS = ['0-1', '2-4', '5-9', '10+'] as const
export type ExperienceBand = (typeof EXPERIENCE_BANDS)[number]

export const MAX_SKILLS = 15

// users/{uid}: documento privado.
export interface UserDocument {
  uid: string
  email: string
  displayName: string
  affectedGrupoVazquez: boolean | null
  accountStatus: 'active' | 'suspended'
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Contenido del perfil tal como se guarda (ya normalizado).
// Los campos opcionales se omiten cuando no tienen valor.
export interface ProfileContent {
  displayName: string
  headline: string
  area: Area
  areaOther?: string
  country: CountryCode
  city: string
  cityNormalized: string
  summary?: string
  experienceYears: number
  experienceBand: ExperienceBand
  skills: string[]
  skillsNormalized: string[]
  /** Palabras clave y sus comienzos para la caja de busqueda (ver utils/searchTokens.ts). */
  searchTokens?: string[]
  workMode: WorkMode
  availability: Availability
  linkedin?: string
  github?: string
  portfolio?: string
  contactEmailPublic: boolean
  publicEmail?: string
  contactPhonePublic: boolean
  publicPhone?: string
  affectedGrupoVazquezPublic: boolean
  affectedGrupoVazquez?: boolean
}

// publicProfiles/{uid}
export interface PublicProfile extends ProfileContent {
  uid: string
  isPublic: boolean
  // Metadatos del CV (el PDF vive en Storage: cvs/{uid}/cv.pdf).
  cvPath?: string
  cvUpdatedAt?: Timestamp
  cvSize?: number
  createdAt: Timestamp
  updatedAt: Timestamp
}
