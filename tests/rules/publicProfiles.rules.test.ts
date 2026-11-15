import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, type Firestore } from 'firebase/firestore'
import { baseProfile, createEnv, saveProfileBatch, seedProfile, seedUser } from './helpers'

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
const anon = () => env.unauthenticatedContext().firestore() as unknown as Firestore

describe('publicProfiles: lectura', () => {
  beforeEach(async () => {
    await seedProfile(env, 'pub', { isPublic: true })
    await seedProfile(env, 'priv', { isPublic: false })
  })

  it('cualquiera lee un perfil publico, nadie ajeno lee uno privado', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'publicProfiles', 'pub')))
    await assertFails(getDoc(doc(anon(), 'publicProfiles', 'priv')))
    await assertFails(getDoc(doc(as('otro'), 'publicProfiles', 'priv')))
  })

  it('el dueno y el admin leen un perfil privado', async () => {
    await assertSucceeds(getDoc(doc(as('priv'), 'publicProfiles', 'priv')))
    await assertSucceeds(getDoc(doc(as('adm', { admin: true }), 'publicProfiles', 'priv')))
  })

  it('el dueno puede consultar su perfil aunque no exista', async () => {
    await assertSucceeds(getDoc(doc(as('nuevo'), 'publicProfiles', 'nuevo')))
  })

  it('listar exige filtrar por isPublic == true', async () => {
    const col = collection(anon(), 'publicProfiles')
    await assertSucceeds(getDocs(query(col, where('isPublic', '==', true))))
    await assertFails(getDocs(col))
    await assertFails(getDocs(query(col, where('isPublic', '==', false))))
  })
})

describe('publicProfiles: escritura', () => {
  beforeEach(async () => {
    await seedUser(env, 'u1')
  })

  it('el dueno crea un perfil privado valido', async () => {
    await assertSucceeds(saveProfileBatch(as('u1'), 'u1', false, baseProfile('u1')))
  })

  it('no se puede crear directamente como publico', async () => {
    await assertFails(saveProfileBatch(as('u1'), 'u1', false, baseProfile('u1', { isPublic: true })))
  })

  it('no se puede escribir el perfil de otro usuario', async () => {
    await seedUser(env, 'u2')
    await assertFails(setDoc(doc(as('u1'), 'publicProfiles', 'u2'), baseProfile('u2')))
    await assertFails(setDoc(doc(as('u1'), 'publicProfiles', 'u1'), baseProfile('u2')))
  })

  it('un anonimo no escribe', async () => {
    await assertFails(setDoc(doc(anon(), 'publicProfiles', 'u1'), baseProfile('u1')))
  })

  it.each([
    ['area invalida', { area: 'hacker' }],
    ['pais invalido', { country: 'ZZ' }],
    ['modalidad invalida', { workMode: 'nunca' }],
    ['experiencia fuera de rango', { experienceYears: 99, experienceBand: '10+' }],
    ['tramo incoherente con los anios', { experienceBand: '0-1' }],
    ['demasiadas habilidades', { skills: Array(16).fill('a'), skillsNormalized: Array(16).fill('a') }],
    ['habilidades desparejas', { skillsNormalized: [] }],
    ['enlace http', { linkedin: 'http://x.com/a' }],
    ['enlace javascript', { github: 'javascript:alert(1)' }],
    ['resumen muy largo', { summary: 'a'.repeat(1001) }],
    ['campo no permitido', { isAdmin: true }],
    ['ciudad normalizada con mayusculas', { cityNormalized: 'Asuncion' }],
    ['area otro sin texto', { area: 'otro' }],
    ['texto de area sin ser otro', { areaOther: 'algo' }],
  ])('rechaza %s', async (_name, extra) => {
    await assertFails(saveProfileBatch(as('u1'), 'u1', false, baseProfile('u1', extra)))
  })

  it('acepta area propia cuando el area es otro', async () => {
    await assertSucceeds(saveProfileBatch(as('u1'), 'u1', false, baseProfile('u1', { area: 'otro', areaOther: 'Seguros' })))
  })

  it('el contacto publico exige su consentimiento y formato valido', async () => {
    const db = as('u1')
    await assertFails(saveProfileBatch(db, 'u1', false, baseProfile('u1', { publicEmail: 'a@b.com' })))
    await assertFails(saveProfileBatch(db, 'u1', false, baseProfile('u1', { contactEmailPublic: true })))
    await assertFails(saveProfileBatch(db, 'u1', false, baseProfile('u1', { contactEmailPublic: true, publicEmail: 'no-email' })))
    await assertFails(saveProfileBatch(db, 'u1', false, baseProfile('u1', { contactPhonePublic: true, publicPhone: 'abc' })))
  })

  it('acepta email publico con consentimiento', async () => {
    await assertSucceeds(saveProfileBatch(as('u1'), 'u1', false, baseProfile('u1', { contactEmailPublic: true, publicEmail: 'a@b.com' })))
  })

  it('acepta telefono publico con consentimiento', async () => {
    await assertSucceeds(saveProfileBatch(as('u1'), 'u1', false, baseProfile('u1', { contactPhonePublic: true, publicPhone: '+595 981 123456' })))
  })

  it('el flag publico exige consentimiento y coincidir con el valor privado', async () => {
    await assertFails(saveProfileBatch(as('u1'), 'u1', true, baseProfile('u1', { affectedGrupoVazquez: true })))
    await assertFails(saveProfileBatch(as('u1'), 'u1', false, baseProfile('u1', { affectedGrupoVazquezPublic: true, affectedGrupoVazquez: true })))
    await assertFails(saveProfileBatch(as('u1'), 'u1', true, baseProfile('u1', { affectedGrupoVazquezPublic: true })))
    await assertSucceeds(saveProfileBatch(as('u1'), 'u1', true, baseProfile('u1', { affectedGrupoVazquezPublic: true, affectedGrupoVazquez: true })))
  })

  it('un usuario suspendido no puede crear ni editar su perfil', async () => {
    await seedUser(env, 's1', { accountStatus: 'suspended' })
    await assertFails(setDoc(doc(as('s1'), 'publicProfiles', 's1'), baseProfile('s1')))
  })

  it('nadie borra perfiles desde el cliente', async () => {
    await seedProfile(env, 'u1')
    await assertFails(deleteDoc(doc(as('u1'), 'publicProfiles', 'u1')))
    await assertFails(deleteDoc(doc(as('adm', { admin: true }), 'publicProfiles', 'u1')))
  })
})

describe('publicProfiles: actualizacion y publicacion', () => {
  beforeEach(async () => {
    await seedUser(env, 'u1', { affectedGrupoVazquez: false })
    await seedProfile(env, 'u1')
  })

  it('el dueno actualiza su perfil conservando createdAt', async () => {
    const db = as('u1')
    const current = (await getDoc(doc(db, 'publicProfiles', 'u1'))).data()!
    await assertSucceeds(
      setDoc(doc(db, 'publicProfiles', 'u1'), { ...baseProfile('u1', { headline: 'Nuevo titular' }), createdAt: current['createdAt'] }),
    )
  })

  it('no se puede cambiar createdAt ni el uid', async () => {
    const db = as('u1')
    await assertFails(setDoc(doc(db, 'publicProfiles', 'u1'), baseProfile('u1')))
    await assertFails(updateDoc(doc(db, 'publicProfiles', 'u1'), { uid: 'u2', updatedAt: serverTimestamp() }))
  })

  it('otro usuario no puede modificar el perfil', async () => {
    await assertFails(updateDoc(doc(as('u2'), 'publicProfiles', 'u1'), { headline: 'Hackeado', updatedAt: serverTimestamp() }))
  })

  it('el dueno puede publicar si respondio la pregunta de Grupo Vazquez', async () => {
    await assertSucceeds(updateDoc(doc(as('u1'), 'publicProfiles', 'u1'), { isPublic: true, updatedAt: serverTimestamp() }))
  })

  it('no se puede publicar sin haber respondido la pregunta', async () => {
    await seedUser(env, 'u3', { affectedGrupoVazquez: null })
    await seedProfile(env, 'u3')
    await assertFails(updateDoc(doc(as('u3'), 'publicProfiles', 'u3'), { isPublic: true, updatedAt: serverTimestamp() }))
  })

  it('un usuario suspendido no puede publicar', async () => {
    await seedUser(env, 's1', { accountStatus: 'suspended', affectedGrupoVazquez: true })
    await seedProfile(env, 's1')
    await assertFails(updateDoc(doc(as('s1'), 'publicProfiles', 's1'), { isPublic: true, updatedAt: serverTimestamp() }))
  })

  it('el admin no escribe perfiles desde el cliente (lo hace una Cloud Function)', async () => {
    await assertFails(updateDoc(doc(as('adm', { admin: true }), 'publicProfiles', 'u1'), { isPublic: false, updatedAt: serverTimestamp() }))
  })
})

describe('deny por defecto', () => {
  it('colecciones no declaradas estan cerradas', async () => {
    await assertFails(setDoc(doc(as('u1'), 'cualquiera', 'x'), { a: 1 }))
    await assertFails(getDoc(doc(as('adm', { admin: true }), 'cualquiera', 'x')))
  })
})
