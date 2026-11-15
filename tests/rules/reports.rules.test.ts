import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc, deleteDoc, type Firestore } from 'firebase/firestore'
import { createEnv, seedProfile, seedUser } from './helpers'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await createEnv()
})
afterAll(async () => {
  await env.cleanup()
})
beforeEach(async () => {
  await env.clearFirestore()
  await seedUser(env, 'owner')
  await seedProfile(env, 'owner', { isPublic: true })
})

const as = (uid: string, claims: Record<string, unknown> = {}) =>
  env.authenticatedContext(uid, { email: `${uid}@x.com`, ...claims }).firestore() as unknown as Firestore
const anon = () => env.unauthenticatedContext().firestore() as unknown as Firestore

const report = (reporter: string, extra: Record<string, unknown> = {}) => ({
  profileUid: 'owner',
  reason: 'inappropriate',
  reporterUid: reporter,
  status: 'open',
  createdAt: serverTimestamp(),
  ...extra,
})

describe('reports', () => {
  it('un usuario con sesion puede reportar un perfil publicado', async () => {
    await assertSucceeds(setDoc(doc(as('rep'), 'reports', 'owner_rep'), report('rep', { comment: 'Contenido ofensivo' })))
  })

  it('un anonimo no puede reportar', async () => {
    await assertFails(setDoc(doc(anon(), 'reports', 'owner_rep'), report('rep')))
  })

  it('el id debe ser perfil_reportante (un reporte por usuario y perfil)', async () => {
    await assertFails(setDoc(doc(as('rep'), 'reports', 'cualquier-id'), report('rep')))
    await assertFails(setDoc(doc(as('rep'), 'reports', 'owner_otro'), report('rep')))
    await assertSucceeds(setDoc(doc(as('rep'), 'reports', 'owner_rep'), report('rep')))
    // Un segundo intento sobre el mismo id es una actualizacion y esta denegada.
    await assertFails(setDoc(doc(as('rep'), 'reports', 'owner_rep'), report('rep', { comment: 'otra vez' })))
  })

  it('no se puede suplantar al reportante', async () => {
    await assertFails(setDoc(doc(as('rep'), 'reports', 'owner_rep'), report('otro')))
  })

  it('no se puede reportar el propio perfil', async () => {
    await assertFails(setDoc(doc(as('owner'), 'reports', 'owner_owner'), report('owner')))
  })

  it('no se puede reportar un perfil privado o inexistente', async () => {
    await seedProfile(env, 'priv', { isPublic: false })
    await assertFails(setDoc(doc(as('rep'), 'reports', 'priv_rep'), report('rep', { profileUid: 'priv' })))
    await assertFails(setDoc(doc(as('rep'), 'reports', 'nadie_rep'), report('rep', { profileUid: 'nadie' })))
  })

  it.each([
    ['motivo invalido', { reason: 'otra-cosa' }],
    ['estado distinto de open', { status: 'resolved' }],
    ['comentario muy largo', { comment: 'a'.repeat(501) }],
    ['comentario vacio', { comment: '' }],
    ['campo no permitido', { resolvedBy: 'x' }],
  ])('rechaza %s', async (_name, extra) => {
    await assertFails(setDoc(doc(as('rep'), 'reports', 'owner_rep'), report('rep', extra)))
  })

  it('solo el admin lee reportes; el reportante y el dueno no', async () => {
    await setDoc(doc(as('rep'), 'reports', 'owner_rep'), report('rep'))
    await assertSucceeds(getDoc(doc(as('adm', { admin: true }), 'reports', 'owner_rep')))
    await assertSucceeds(getDocs(collection(as('adm', { admin: true }), 'reports')))
    await assertFails(getDoc(doc(as('rep'), 'reports', 'owner_rep')))
    await assertFails(getDoc(doc(as('owner'), 'reports', 'owner_rep')))
    await assertFails(getDocs(collection(anon(), 'reports')))
  })

  it('nadie modifica ni borra reportes desde el cliente', async () => {
    await setDoc(doc(as('rep'), 'reports', 'owner_rep'), report('rep'))
    await assertFails(updateDoc(doc(as('adm', { admin: true }), 'reports', 'owner_rep'), { status: 'resolved' }))
    await assertFails(deleteDoc(doc(as('adm', { admin: true }), 'reports', 'owner_rep')))
    await assertFails(deleteDoc(doc(as('rep'), 'reports', 'owner_rep')))
  })
})
