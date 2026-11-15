import type { Area, Availability, CountryCode, ExperienceBand, WorkMode } from './profile'

export interface DirectoryFilters {
  /** Texto de la caja de busqueda (puesto, habilidad, ciudad o nombre). Se busca la primera palabra. */
  q?: string
  area?: Area
  country?: CountryCode
  city?: string
  experienceBand?: ExperienceBand
  /** Un perfil con modalidad "cualquiera" coincide con todas las modalidades. */
  workMode?: Exclude<WorkMode, 'any'>
  availability?: Availability
}

export const PAGE_SIZE = 20
