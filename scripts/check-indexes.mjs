#!/usr/bin/env node
// Ejecuta contra Firestore real cada forma de consulta que usa la app y falla si
// alguna necesita un indice que no existe. Los emuladores no exigen indices, por
// eso este chequeo complementa las pruebas.
//
// Uso: node scripts/check-indexes.mjs <proyecto>   (ej.: cv-itti-dev)
// Requiere una sesion de gcloud con permisos de lectura en el proyecto.
// Solo lee (limit 1): no modifica datos.
import { execFileSync } from 'node:child_process'

const project = process.argv[2]
if (!project) {
  console.error('Uso: node scripts/check-indexes.mjs <proyecto>')
  process.exit(2)
}
const token = execFileSync('gcloud', ['auth', 'print-access-token']).toString().trim()
const url = `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents:runQuery`

const v = (x) =>
  typeof x === 'boolean' ? { booleanValue: x } : x === null ? { nullValue: null } : Array.isArray(x)
    ? { arrayValue: { values: x.map(v) } } : { stringValue: x }
const eq = (field, value, op = 'EQUAL') => ({ fieldFilter: { field: { fieldPath: field }, op, value: v(value) } })
const query = (collectionId, filters, orderBy) => ({
  structuredQuery: {
    from: [{ collectionId }],
    ...(filters.length && {
      where: filters.length === 1 ? filters[0] : { compositeFilter: { op: 'AND', filters } },
    }),
    ...(orderBy && { orderBy: [{ field: { fieldPath: orderBy }, direction: 'DESCENDING' }] }),
    limit: 1,
  },
})

// Debe reflejar src/services/search.service.ts y src/services/admin.service.ts.
const pub = eq('isPublic', true)
const checks = {
  'directorio: sin filtros': query('publicProfiles', [pub], 'updatedAt'),
  'directorio: busqueda': query('publicProfiles', [pub, eq('searchTokens', 'co', 'ARRAY_CONTAINS')], 'updatedAt'),
  'directorio: todos los filtros': query('publicProfiles', [
    pub,
    eq('searchTokens', 'co', 'ARRAY_CONTAINS'),
    eq('area', 'finanzas'),
    eq('country', 'PY'),
    eq('cityNormalized', 'asuncion'),
    eq('experienceBand', '5-9'),
    eq('workMode', ['remote', 'any'], 'IN'),
    eq('availability', 'available'),
  ], 'updatedAt'),
  'admin: reportes abiertos': query('reports', [eq('status', ['open'], 'IN')], 'createdAt'),
  'admin: reportes cerrados': query('reports', [eq('status', ['resolved', 'dismissed'], 'IN')], 'createdAt'),
  'admin: usuarios sin filtros': query('users', [], 'createdAt'),
  'admin: usuarios por Grupo Vazquez': query('users', [eq('affectedGrupoVazquez', true)], 'createdAt'),
  'admin: usuarios sin responder': query('users', [eq('affectedGrupoVazquez', null)], 'createdAt'),
  'admin: usuarios por estado': query('users', [eq('accountStatus', 'suspended')], 'createdAt'),
  'admin: usuarios por ambos': query('users', [eq('affectedGrupoVazquez', false), eq('accountStatus', 'active')], 'createdAt'),
  'admin: auditoria': query('adminAudit', [], 'createdAt'),
}

let failed = 0
for (const [name, body] of Object.entries(checks)) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'x-goog-user-project': project, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  const error = Array.isArray(data) ? data.find((d) => d.error)?.error : data.error
  if (res.ok && !error) {
    console.log(`ok     ${name}`)
  } else {
    failed++
    console.log(`FALLA  ${name}: ${error?.status ?? res.status} ${error?.message?.split('. ')[0] ?? ''}`)
  }
}
console.log(failed ? `\n${failed} consulta(s) sin indice en ${project}.` : `\nTodas las consultas tienen indice en ${project}.`)
process.exit(failed ? 1 : 0)
