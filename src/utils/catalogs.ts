import type { Area, Availability, CountryCode, ExperienceBand, WorkMode } from '@/types/profile'

export const AREA_LABELS: Record<Area, string> = {
  tecnologia: 'Tecnología',
  finanzas: 'Finanzas y contabilidad',
  ventas: 'Ventas y comercial',
  administracion: 'Administración',
  operaciones: 'Operaciones y logística',
  rrhh: 'Recursos humanos',
  marketing: 'Marketing',
  legal: 'Legal',
  atencion_cliente: 'Atención al cliente',
  otro: 'Otro (escribir)',
}

export const COUNTRY_LABELS: Record<CountryCode, string> = {
  PY: 'Paraguay',
  AR: 'Argentina',
  BR: 'Brasil',
  UY: 'Uruguay',
  CL: 'Chile',
  BO: 'Bolivia',
  PE: 'Perú',
  CO: 'Colombia',
  EC: 'Ecuador',
  VE: 'Venezuela',
  MX: 'México',
  US: 'Estados Unidos',
  ES: 'España',
  OTHER: 'Otro pais',
}

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: 'Remoto',
  hybrid: 'Híbrido',
  onsite: 'Presencial',
  any: 'Cualquiera',
}

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  available: 'Disponible',
  not_available: 'No disponible',
}

export const EXPERIENCE_BAND_LABELS: Record<ExperienceBand, string> = {
  '0-1': '0 a 1 años',
  '2-4': '2 a 4 años',
  '5-9': '5 a 9 años',
  '10+': '10 años o más',
}

export const PY_CITY_SUGGESTIONS = [
  'Asunción',
  'Ciudad del Este',
  'San Lorenzo',
  'Luque',
  'Capiatá',
  'Lambaré',
  'Fernando de la Mora',
  'Encarnacion',
  'Limpio',
  'Villa Elisa',
  'Mariano Roque Alonso',
  'Areguá',
  'Itauguá',
  'Pedro Juan Caballero',
  'Coronel Oviedo',
]

export const SKILL_SUGGESTIONS = [
  'Excel', 'Atención al cliente', 'Ventas', 'Contabilidad', 'Liderazgo de equipos',
  'JavaScript', 'TypeScript', 'React', 'Python', 'Java', 'SQL', 'AWS', 'DevOps',
  'Gestión de proyectos', 'Análisis de datos', 'Marketing digital', 'Inglés',
]
