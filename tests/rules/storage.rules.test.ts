import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { deleteObject, getBytes, ref, uploadBytes, type FirebaseStorage } from 'firebase/storage'
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
  await env.clearStorage()
})

const asStorage = (uid: string, claims: Record<string, unknown> = {}) =>
  env.authenticatedContext(uid, { email: `${uid}@x.com`, ...claims }).storage() as unknown as FirebaseStorage
const anonStorage = () => env.unauthenticatedContext().storage() as unknown as FirebaseStorage

const pdf = (size = 100) => {
  const bytes = new Uint8Array(size)
  bytes.set([0x25, 0x50, 0x44, 0x46, 0x2d]) // %PDF-
  return bytes
}
const PDF = { contentType: 'application/pdf' }
const cvRef = (s: FirebaseStorage, uid: string) => ref(s, `cvs/${uid}/cv.pdf`)

// Siembra un CV saltando las reglas, como lo haria una cuenta de servicio.
async function seedCv(uid: string) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await uploadBytes(cvRef(ctx.storage() as unknown as FirebaseStorage, uid), pdf(), PDF)
  })
}

describe('storage: subida', () => {
  beforeEach(async () => {
    await seedUser(env, 'u1')
  })

  it('el dueno sube un PDF valido', async () => {
    await assertSucceeds(uploadBytes(cvRef(asStorage('u1'), 'u1'), pdf(), PDF))
  })

  it('el dueno puede reemplazar su CV', async () => {
    await seedCv('u1')
    await assertSucceeds(uploadBytes(cvRef(asStorage('u1'), 'u1'), pdf(200), PDF))
  })

  it('acepta exactamente 5 MB y rechaza mas', async () => {
    await assertSucceeds(uploadBytes(cvRef(asStorage('u1'), 'u1'), pdf(5 * 1024 * 1024), PDF))
    await assertFails(uploadBytes(cvRef(asStorage('u1'), 'u1'), pdf(5 * 1024 * 1024 + 1), PDF))
  })

  it('rechaza archivos que no son PDF o sin tipo', async () => {
    await assertFails(uploadBytes(cvRef(asStorage('u1'), 'u1'), pdf(), { contentType: 'image/png' }))
    await assertFails(uploadBytes(cvRef(asStorage('u1'), 'u1'), pdf(), { contentType: 'text/html' }))
    await assertFails(uploadBytes(cvRef(asStorage('u1'), 'u1'), pdf()))
  })

  it('rechaza archivos vacios', async () => {
    await assertFails(uploadBytes(cvRef(asStorage('u1'), 'u1'), new Uint8Array(0), PDF))
  })

  it('no se puede subir al CV de otro usuario', async () => {
    await seedUser(env, 'u2')
    await assertFails(uploadBytes(cvRef(asStorage('u1'), 'u2'), pdf(), PDF))
  })

  it('un anonimo no puede subir', async () => {
    await assertFails(uploadBytes(cvRef(anonStorage(), 'u1'), pdf(), PDF))
  })

  it('un usuario suspendido no puede subir', async () => {
    await seedUser(env, 's1', { accountStatus: 'suspended' })
    await assertFails(uploadBytes(cvRef(asStorage('s1'), 's1'), pdf(), PDF))
  })

  it('un usuario sin documento en Firestore no puede subir', async () => {
    await assertFails(uploadBytes(cvRef(asStorage('nuevo'), 'nuevo'), pdf(), PDF))
  })

  it('no se pueden usar otras rutas ni nombres de archivo', async () => {
    const s = asStorage('u1')
    await assertFails(uploadBytes(ref(s, 'cvs/u1/otro.pdf'), pdf(), PDF))
    await assertFails(uploadBytes(ref(s, 'cvs/u1/sub/cv.pdf'), pdf(), PDF))
    await assertFails(uploadBytes(ref(s, 'publico/cv.pdf'), pdf(), PDF))
  })
})

describe('storage: lectura', () => {
  it('el CV de un perfil privado solo lo lee su dueno o un admin', async () => {
    await seedUser(env, 'u1')
    await seedProfile(env, 'u1', { isPublic: false })
    await seedCv('u1')
    await assertSucceeds(getBytes(cvRef(asStorage('u1'), 'u1')))
    await assertSucceeds(getBytes(cvRef(asStorage('adm', { admin: true }), 'u1')))
    await assertFails(getBytes(cvRef(asStorage('otro'), 'u1')))
    await assertFails(getBytes(cvRef(anonStorage(), 'u1')))
  })

  it('el CV de un perfil publicado lo lee cualquiera, incluso sin sesion', async () => {
    await seedUser(env, 'u1')
    await seedProfile(env, 'u1', { isPublic: true })
    await seedCv('u1')
    await assertSucceeds(getBytes(cvRef(anonStorage(), 'u1')))
    await assertSucceeds(getBytes(cvRef(asStorage('otro'), 'u1')))
  })

  it('al despublicar el perfil se corta el acceso publico al CV', async () => {
    await seedUser(env, 'u1')
    await seedProfile(env, 'u1', { isPublic: true })
    await seedCv('u1')
    await assertSucceeds(getBytes(cvRef(anonStorage(), 'u1')))
    await seedProfile(env, 'u1', { isPublic: false })
    await assertFails(getBytes(cvRef(anonStorage(), 'u1')))
  })

  it('sin perfil en Firestore no hay lectura publica', async () => {
    await seedUser(env, 'u1')
    await seedCv('u1')
    await assertFails(getBytes(cvRef(anonStorage(), 'u1')))
  })
})

describe('storage: borrado', () => {
  beforeEach(async () => {
    await seedUser(env, 'u1')
    await seedCv('u1')
  })

  it('el dueno y el admin pueden borrar', async () => {
    await assertSucceeds(deleteObject(cvRef(asStorage('u1'), 'u1')))
    await seedCv('u1')
    await assertSucceeds(deleteObject(cvRef(asStorage('adm', { admin: true }), 'u1')))
  })

  it('otro usuario o un anonimo no pueden borrar', async () => {
    await assertFails(deleteObject(cvRef(asStorage('otro'), 'u1')))
    await assertFails(deleteObject(cvRef(anonStorage(), 'u1')))
  })
})
