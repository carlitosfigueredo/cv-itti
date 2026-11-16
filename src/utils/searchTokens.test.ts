import { buildSearchTokens, MAX_SEARCH_TOKENS, searchTermFrom, splitWords } from './searchTokens'

const base = { displayName: 'Ana López', headline: 'Contadora senior', areaLabel: 'Finanzas y contabilidad', city: 'Asunción', skills: ['Excel', 'Power BI'] }

describe('splitWords', () => {
  it('normaliza tildes y mayusculas, separa por simbolos y descarta letras sueltas', () => {
    expect(splitWords('  Node.js / C# y TypeScript ')).toEqual(['node', 'js', 'typescript'])
    expect(splitWords('Ñandutí')).toEqual(['nanduti'])
  })
})

describe('buildSearchTokens', () => {
  const tokens = buildSearchTokens(base)

  it('incluye palabras completas de titular, habilidades, area, ciudad y nombre', () => {
    for (const w of ['contadora', 'senior', 'excel', 'power', 'bi', 'finanzas', 'contabilidad', 'asuncion', 'ana', 'lopez']) {
      expect(tokens).toContain(w)
    }
  })

  it('incluye los comienzos de cada palabra para buscar mientras se escribe', () => {
    expect(tokens).toEqual(expect.arrayContaining(['co', 'con', 'cont', 'conta', 'contad']))
    expect(tokens).not.toContain('c')
    expect(tokens).not.toContain('tadora')
  })

  it('no repite ni pasa del maximo', () => {
    expect(new Set(tokens).size).toBe(tokens.length)
    const huge = buildSearchTokens({ ...base, skills: Array.from({ length: 15 }, (_, i) => `habilidadmuylarga${i} otrapalabralarga${i}`) })
    expect(huge.length).toBeLessThanOrEqual(MAX_SEARCH_TOKENS)
    expect(huge).toContain('contadora')
  })
})

describe('searchTermFrom', () => {
  it('usa la primera palabra normalizada', () => {
    expect(searchTermFrom('  Contadóra senior')).toBe('contadora')
    expect(searchTermFrom('a')).toBeNull()
    expect(searchTermFrom('')).toBeNull()
  })
})
