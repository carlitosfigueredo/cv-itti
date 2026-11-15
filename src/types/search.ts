import type { Area, Availability, CountryCode, ExperienceBand, WorkMode } from './profile'

export interface DirectoryFilters {
  area?: Area
  country?: CountryCode
  city?: string
  experienceBand?: ExperienceBand
  /** Un perfil con modalidad "cualquiera" coincide con todas las modalidades. */
  workMode?: Exclude<WorkMode, 'any'>
  availability?: Availability
  skill?: string
  /** Solo perfiles que consintieron publicar que fueron afectados por Grupo Vazquez. */
  affectedGrupoVazquez?: boolean
}

export const PAGE_SIZE = 20
