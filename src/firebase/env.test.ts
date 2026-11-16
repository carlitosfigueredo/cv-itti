import { readFirebaseEnv } from './env'

const valid = {
  VITE_FIREBASE_API_KEY: 'key',
  VITE_FIREBASE_AUTH_DOMAIN: 'x.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'x',
  VITE_FIREBASE_STORAGE_BUCKET: 'x.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '123',
  VITE_FIREBASE_APP_ID: '1:123:web:abc',
}

describe('readFirebaseEnv', () => {
  it('acepta una configuracion completa', () => {
    const result = readFirebaseEnv(valid)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.env.useEmulators).toBe(false)
  })

  it('App Check queda desactivado sin clave y activo con clave', () => {
    const without = readFirebaseEnv(valid)
    expect(without.ok && without.env.appCheckSiteKey).toBeNull()
    const blank = readFirebaseEnv({ ...valid, VITE_APPCHECK_SITE_KEY: '  ' })
    expect(blank.ok && blank.env.appCheckSiteKey).toBeNull()
    const withKey = readFirebaseEnv({ ...valid, VITE_APPCHECK_SITE_KEY: 'clave-publica' })
    expect(withKey.ok && withKey.env.appCheckSiteKey).toBe('clave-publica')
  })

  it('activa emuladores solo con "true"', () => {
    const result = readFirebaseEnv({ ...valid, VITE_USE_EMULATORS: 'true' })
    expect(result.ok && result.env.useEmulators).toBe(true)
  })

  it('informa cada variable faltante', () => {
    const result = readFirebaseEnv({})
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.errors).toHaveLength(6)
      expect(result.errors[0]).toContain('VITE_FIREBASE_API_KEY')
    }
  })

  it('rechaza valores vacios', () => {
    const result = readFirebaseEnv({ ...valid, VITE_FIREBASE_PROJECT_ID: '   ' })
    expect(result.ok).toBe(false)
  })
})
