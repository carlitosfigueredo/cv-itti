import { adminErrorMessage } from './admin.errors'

describe('adminErrorMessage', () => {
  it('prioriza el detalle enviado por la funcion', () => {
    expect(adminErrorMessage({ code: 'functions/failed-precondition', message: 'target-is-admin' })).toMatch(/otro administrador/)
    expect(adminErrorMessage({ code: 'functions/failed-precondition', message: 'recent-login-required' })).toMatch(/volvé a iniciar sesión/)
  })

  it('usa el codigo cuando no hay detalle conocido', () => {
    expect(adminErrorMessage({ code: 'functions/unavailable', message: 'x' })).toMatch(/conexión/)
    expect(adminErrorMessage({ code: 'functions/permission-denied' })).toMatch(/permisos de administración/)
  })

  it('cae en un mensaje generico sin filtrar detalles internos', () => {
    expect(adminErrorMessage({ code: 'functions/internal', message: 'stack trace con datos' })).toBe(
      'No se pudo completar la acción. Intentá de nuevo en unos minutos.',
    )
    expect(adminErrorMessage(null)).toMatch(/no se pudo completar/i)
  })
})
