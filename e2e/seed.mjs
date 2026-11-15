// Carga perfiles ficticios en el emulador de Firestore (nunca en un proyecto real).
// "Bearer owner" es el token especial del emulador que saltea las reglas.
const PROJECT = 'demo-cv-itti'
const HOST = process.env.FIRESTORE_EMULATOR_HOST

if (!HOST) {
  console.error('Este script solo corre contra el emulador (falta FIRESTORE_EMULATOR_HOST).')
  process.exit(1)
}

const BASE = `http://${HOST}/v1/projects/${PROJECT}/databases/(default)/documents`

const s = (v) => ({ stringValue: v })
const b = (v) => ({ booleanValue: v })
const i = (v) => ({ integerValue: String(v) })
const t = (d) => ({ timestampValue: d.toISOString() })
const arr = (xs) => ({ arrayValue: { values: xs.map(s) } })
const norm = (x) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const AREA = { finanzas: 'Finanzas y contabilidad', tecnologia: 'Tecnología', ventas: 'Ventas y comercial', rrhh: 'Recursos humanos', operaciones: 'Operaciones y logística' }

// Copia simplificada de src/utils/searchTokens.ts (este script no puede importar TypeScript).
function tokens(...texts) {
  const words = [...new Set(texts.flatMap((t) => norm(t).split(/[^a-z0-9ñ]+/).filter((w) => w.length >= 2)))]
  const out = new Set(words)
  for (const w of words) for (let len = 2; len < Math.min(w.length, 20); len++) out.add(w.slice(0, len))
  return [...out].slice(0, 300)
}

const people = [
  ['ana', 'Ana López Benítez', 'Contadora senior', 'finanzas', 'Asunción', 7, '5-9', ['Excel', 'Contabilidad', 'SAP', 'Impuestos', 'Power BI'], 'hybrid', 'available', true],
  ['carlos', 'Carlos Giménez', 'Desarrollador full stack', 'tecnologia', 'Luque', 4, '2-4', ['React', 'TypeScript', 'Node.js', 'AWS'], 'remote', 'available', false],
  ['maria', 'María José Fernández Acosta', 'Ejecutiva comercial con experiencia en banca', 'ventas', 'San Lorenzo', 12, '10+', ['Ventas', 'Negociación', 'CRM'], 'onsite', 'not_available', true],
  ['diego', 'Diego Ramírez', 'Analista de datos', 'tecnologia', 'Asunción', 2, '2-4', ['SQL', 'Python', 'Análisis de datos'], 'any', 'available', true],
  ['lucia', 'Lucía Duarte', 'Especialista en RR. HH.', 'rrhh', 'Encarnación', 9, '5-9', ['Selección', 'Capacitación'], 'hybrid', 'available', false],
  ['jorge', 'Jorge Ortiz', 'Coordinador de logística', 'operaciones', 'Ciudad del Este', 15, '10+', ['Logística', 'Inventarios', 'Excel', 'Liderazgo de equipos'], 'onsite', 'available', true],
]

let n = 0
for (const [uid, name, headline, area, city, years, band, skills, workMode, availability, affected] of people) {
  const fields = {
    uid: s(uid),
    displayName: s(name),
    headline: s(headline),
    area: s(area),
    country: s('PY'),
    city: s(city),
    cityNormalized: s(norm(city)),
    experienceYears: i(years),
    experienceBand: s(band),
    skills: arr(skills),
    skillsNormalized: arr(skills.map(norm)),
    searchTokens: arr(tokens(headline, ...skills, AREA[area], city, name)),
    workMode: s(workMode),
    availability: s(availability),
    isPublic: b(true),
    contactEmailPublic: b(false),
    contactPhonePublic: b(false),
    affectedGrupoVazquezPublic: b(affected),
    ...(affected ? { affectedGrupoVazquez: b(true) } : {}),
    summary: s('Profesional con experiencia en equipos multidisciplinarios. Busco nuevos desafíos donde aportar y seguir aprendiendo.'),
    linkedin: s('https://www.linkedin.com/in/ejemplo'),
    createdAt: t(new Date(2026, 0, 1)),
    updatedAt: t(new Date(Date.now() - n++ * 60_000)),
  }
  const res = await fetch(`${BASE}/publicProfiles?documentId=${uid}`, {
    method: 'POST',
    headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  })
  if (!res.ok) throw new Error(`No se pudo cargar ${uid}: HTTP ${res.status} ${await res.text()}`)
}
console.log(`Cargados ${people.length} perfiles de prueba en el emulador.`)
