import type { ExperienceBand } from '@/types/profile'

export function collapseSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

// Minusculas, sin tildes y sin espacios repetidos. Sirve para filtros exactos.
export function normalizeText(value: string): string {
  return collapseSpaces(value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase())
}

export function experienceBandFor(years: number): ExperienceBand {
  if (years <= 1) return '0-1'
  if (years <= 4) return '2-4'
  if (years <= 9) return '5-9'
  return '10+'
}

export function initialsOf(name: string): string {
  const parts = collapseSpaces(name).split(' ').filter(Boolean)
  const first = parts[0]?.charAt(0) ?? '?'
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : ''
  return (first + last).toUpperCase()
}
