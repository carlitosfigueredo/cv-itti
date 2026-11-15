import { normalizeText } from './normalize'

// Firestore no busca dentro de textos. Para la caja de busqueda se guarda en cada
// perfil una lista de palabras clave (y sus comienzos) y se consulta con
// array-contains. Ejemplo: "Contadora" genera "co", "con", ..., "contadora".
export const MAX_SEARCH_TOKENS = 300
const MIN_PREFIX = 2
const MAX_PREFIX = 20

export function splitWords(text: string): string[] {
  return normalizeText(text)
    .split(/[^a-z0-9ñ]+/)
    .filter((w) => w.length >= MIN_PREFIX)
}

export interface SearchableFields {
  displayName: string
  headline: string
  areaLabel: string
  city: string
  skills: string[]
}

export function buildSearchTokens(fields: SearchableFields): string[] {
  const words = [
    ...splitWords(fields.headline),
    ...fields.skills.flatMap(splitWords),
    ...splitWords(fields.areaLabel),
    ...splitWords(fields.city),
    ...splitWords(fields.displayName),
  ]
  const unique = [...new Set(words)]
  // Primero las palabras completas: si hay que recortar, se pierden prefijos, no palabras.
  const tokens = new Set<string>(unique.map((w) => w.slice(0, MAX_PREFIX)))
  for (const word of unique) {
    for (let len = MIN_PREFIX; len < Math.min(word.length, MAX_PREFIX); len++) {
      if (tokens.size >= MAX_SEARCH_TOKENS) break
      tokens.add(word.slice(0, len))
    }
  }
  return [...tokens].slice(0, MAX_SEARCH_TOKENS)
}

// Termino que se envia a la consulta: la primera palabra de lo escrito.
export function searchTermFrom(input: string): string | null {
  const first = splitWords(input)[0]
  return first ? first.slice(0, MAX_PREFIX) : null
}
