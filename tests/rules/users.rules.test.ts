import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, getDocs, collection, serverTimestamp, setDoc, updateDoc, type Firestore } from 'firebase/firestore'
import { baseUser, createEnv, seedUser } from './helpers'

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

describe('users/{uid}', () => {
  it('el dueno puede crear su documento con campos validos', async () => {
    await assertSucceeds(setDoc(doc(as('u1'), 'users', 'u1'), baseUser('u1')))
  })

  it('no se puede crear el documento de otro usuario', async () => {
    await assertFails(setDoc(doc(as('u1'), 'users', 'u2'), baseUser('u2')))
  })

  it('no se puede crear con otro uid dentro del documento', async () => {
    await assertFails(setDoc(doc(as('u1'), 'users', 'u1'), { ...baseUser('u1'), uid: 'u2' }))
  })

  it('el email debe coincidir con el del token', async () => {
    await assertFails(setDoc(doc(as('u1'), 'users', 'u1'), { ...baseUser('u1'), email: 'otro@x.com' }))
  })

  it('no se puede crear suspendido ni con campos de privilegio', async () => {
    await assertFails(setDoc(doc(as('u1'), 'users', 'u1'), { ...baseUser('u1'), accountStatus: 'suspended' }))
    await assertFails(setDoc(doc(as('u1'), 'users', 'u1'), { ...baseUser('u1'), admin: true }))
    await assertFails(setDoc(doc(as('u1'), 'users', 'u1'), { ...baseUser('u1'), role: 'admin' }))
  })

  it('el dueno puede responder el flag pero no cambiar el estado de cuenta', async () => {
    await seedUser(env, 'u1')
    const db = as('u1')
    await assertSucceeds(updateDoc(doc(db, 'users', 'u1'), { affectedGrupoVazquez: true, updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(doc(db, 'users', 'u1'), { accountStatus: 'suspended', updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(doc(db, 'users', 'u1'), { email: 'otro@x.com', updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(doc(db, 'users', 'u1'), { admin: true, updatedAt: serverTimestamp() }))
  })

  it('un usuario suspendido no puede modificar su documento', async () => {
    await seedUser(env, 'u1', { accountStatus: 'suspended' })
    await assertFails(updateDoc(doc(as('u1'), 'users', 'u1'), { affectedGrupoVazquez: true, updatedAt: serverTimestamp() }))
  })

  it('el flag privado no es legible por otros ni anonimos', async () => {
    await seedUser(env, 'u1', { affectedGrupoVazquez: true })
    await assertFails(getDoc(doc(as('u2'), 'users', 'u1')))
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore() as unknown as Firestore, 'users', 'u1')))
    await assertSucceeds(getDoc(doc(as('u1'), 'users', 'u1')))
  })

  it('solo admin puede leer y listar usuarios', async () => {
    await seedUser(env, 'u1')
    await assertSucceeds(getDoc(doc(as('adm', { admin: true }), 'users', 'u1')))
    await assertSucceeds(getDocs(collection(as('adm', { admin: true }), 'users')))
    await assertFails(getDocs(collection(as('u1'), 'users')))
  })

  it('un usuario no puede darse privilegios de admin con un campo propio', async () => {
    await seedUser(env, 'u1')
    await assertFails(getDocs(collection(as('u1'), 'users')))
  })

  it('nadie borra usuarios desde el cliente', async () => {
    await seedUser(env, 'u1')
    await assertFails(deleteDoc(doc(as('u1'), 'users', 'u1')))
    await assertFails(deleteDoc(doc(as('adm', { admin: true }), 'users', 'u1')))
  })
})
