import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, doc, getCountFromServer, getDoc, getDocs, query, setDoc, where, type Firestore } from 'firebase/firestore'
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
})

const as = (uid: string, claims: Record<string, unknown> = {}) =>
  env.authenticatedContext(uid, { email: `${uid}@x.com`, ...claims }).firestore() as unknown as Firestore
const admin = () => as('adm', { admin: true })

describe('adminAudit', () => {
  beforeEach(async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore() as unknown as Firestore, 'adminAudit', 'e1'), { action: 'suspend', actorUid: 'adm', targetUid: 'u1' })
    })
  })

  it('solo el admin lee la auditoria', async () => {
    await assertSucceeds(getDoc(doc(admin(), 'adminAudit', 'e1')))
    await assertSucceeds(getDocs(collection(admin(), 'adminAudit')))
    await assertFails(getDoc(doc(as('u1'), 'adminAudit', 'e1')))
    await assertFails(getDocs(collection(env.unauthenticatedContext().firestore() as unknown as Firestore, 'adminAudit')))
  })

  it('nadie escribe la auditoria desde el cliente, ni siquiera un admin', async () => {
    await assertFails(setDoc(doc(admin(), 'adminAudit', 'e2'), { action: 'suspend' }))
    await assertFails(setDoc(doc(admin(), 'adminAudit', 'e1'), { action: 'otra' }))
  })

  it('un claim admin falso (string o false) no da acceso', async () => {
    await assertFails(getDoc(doc(as('x', { admin: 'true' }), 'adminAudit', 'e1')))
    await assertFails(getDoc(doc(as('x', { admin: false }), 'adminAudit', 'e1')))
  })
})

describe('estadisticas del panel (consultas de conteo)', () => {
  beforeEach(async () => {
    await seedUser(env, 'a', { affectedGrupoVazquez: true })
    await seedUser(env, 'b', { affectedGrupoVazquez: false })
    await seedUser(env, 'c', { accountStatus: 'suspended' })
    await seedProfile(env, 'a', { isPublic: true })
    await seedProfile(env, 'b', { isPublic: false })
  })

  it('el admin cuenta usuarios, perfiles y el flag privado de Grupo Vazquez', async () => {
    const db = admin()
    expect((await getCountFromServer(collection(db, 'users'))).data().count).toBe(3)
    expect((await getCountFromServer(query(collection(db, 'users'), where('affectedGrupoVazquez', '==', true)))).data().count).toBe(1)
    expect((await getCountFromServer(query(collection(db, 'users'), where('accountStatus', '==', 'suspended')))).data().count).toBe(1)
    expect((await getCountFromServer(collection(db, 'publicProfiles'))).data().count).toBe(2)
  })

  it('un usuario comun no puede contar usuarios ni el flag privado', async () => {
    const db = as('a')
    await assertFails(getCountFromServer(collection(db, 'users')))
    await assertFails(getCountFromServer(query(collection(db, 'users'), where('affectedGrupoVazquez', '==', true))))
    await assertFails(getCountFromServer(collection(db, 'reports')))
  })

  it('un anonimo puede contar solo perfiles publicados', async () => {
    const db = env.unauthenticatedContext().firestore() as unknown as Firestore
    await assertSucceeds(getCountFromServer(query(collection(db, 'publicProfiles'), where('isPublic', '==', true))))
    await assertFails(getCountFromServer(collection(db, 'publicProfiles')))
  })
})
