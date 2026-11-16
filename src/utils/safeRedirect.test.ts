import { safeRedirectPath } from './safeRedirect'

describe('safeRedirectPath', () => {
  it('acepta rutas internas', () => {
    expect(safeRedirectPath('/perfil/editar')).toBe('/perfil/editar')
  })

  it.each(['https://malo.com', '//malo.com', '/\\malo.com', 42, undefined, null])(
    'rechaza %s',
    (value) => {
      expect(safeRedirectPath(value)).toBe('/dashboard')
    },
  )
})
