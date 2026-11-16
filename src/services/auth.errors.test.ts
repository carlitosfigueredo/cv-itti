import { mapAuthError } from './auth.errors'

describe('mapAuthError', () => {
  it.each([
    ['auth/popup-closed-by-user', 'cancelled'],
    ['auth/cancelled-popup-request', 'cancelled'],
    ['auth/popup-blocked', 'popup-blocked'],
    ['auth/network-request-failed', 'network'],
    ['auth/otra-cosa', 'unknown'],
  ])('mapea %s a %s', (code, kind) => {
    expect(mapAuthError({ code }).kind).toBe(kind)
  })

  it('maneja errores sin codigo', () => {
    expect(mapAuthError(new Error('x')).kind).toBe('unknown')
    expect(mapAuthError(null).kind).toBe('unknown')
  })
})
