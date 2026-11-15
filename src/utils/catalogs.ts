import type { Area, Availability, CountryCode, ExperienceBand, WorkMode } from '@/types/profile'

export const AREA_LABELS: Record<Area, string> = {
  tecnologia: 'Tecnologia',
  finanzas: 'Finanzas y contabilidad',
  ventas: 'Ventas y comercial',
  administracion: 'Administracion',
  operaciones: 'Operaciones y logistica',
  rrhh: 'Recursos humanos',
  marketing: 'Marketing',
  legal: 'Legal',
  atencion_cliente: 'Atencion al cliente',
  otro: 'Otro (escribir)',
}

export const COUNTRY_LABELS: Record<CountryCode, string> = {
  PY: 'Paraguay',
  AR: 'Argentina',
  BR: 'Brasil',
  UY: 'Uruguay',
  CL: 'Chile',
  BO: 'Bolivia',
  PE: 'Peru',
  CO: 'Colombia',
  EC: 'Ecuador',
  VE: 'Venezuela',
  MX: 'Mexico',
  US: 'Estados Unidos',
  ES: 'Espana',
  OTHER: 'Otro pais',
}

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: 'Remoto',
  hybrid: 'Hibrido',
  onsite: 'Presencial',
  any: 'Cualquiera',
}

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  available: 'Disponible',
  not_available: 'No disponible',
}

export const EXPERIENCE_BAND_LABELS: Record<ExperienceBand, string> = {
  '0-1': '0 a 1 anios',
  '2-4': '2 a 4 anios',
  '5-9': '5 a 9 anios',
  '10+': '10 anios o mas',
}

export const PY_CITY_SUGGESTIONS = [
  'Asuncion',
  'Ciudad del Este',
  'San Lorenzo',
  'Luque',
  'Capiata',
  'Lambare',
  'Fernando de la Mora',
  'Encarnacion',
  'Limpio',
  'Villa Elisa',
  'Mariano Roque Alonso',
  'Aregua',
  'Itaugua',
  'Pedro Juan Caballero',
  'Coronel Oviedo',
]

export const SKILL_SUGGESTIONS = [
  'Excel', 'Atencion al cliente', 'Ventas', 'Contabilidad', 'Liderazgo de equipos',
  'JavaScript', 'TypeScript', 'React', 'Python', 'Java', 'SQL', 'AWS', 'DevOps',
  'Gestion de proyectos', 'Analisis de datos', 'Marketing digital', 'Ingles',
]
