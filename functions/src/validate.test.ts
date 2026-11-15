import { InputError, isRecentLogin, parseDeleteAccountInput, parseModerateInput, parseResolveReportInput } from './validate'

describe('parseModerateInput', () => {
  it('acepta una accion valida', () => {
    expect(parseModerateInput({ targetUid: 'abc123', action: 'suspend', reason: ' spam ' })).toEqual({
      targetUid: 'abc123',
      action: 'suspend',
      reason: 'spam',
    })
  })

  it.each([
    [null], [undefined], ['texto'], [[]], [{}],
    [{ targetUid: 'abc', action: 'borrarTodo' }],
    [{ targetUid: '../etc', action: 'suspend' }],
    [{ targetUid: 'a b', action: 'suspend' }],
    [{ targetUid: 123, action: 'suspend' }],
    [{ targetUid: 'abc', action: 'suspend', reason: 'x'.repeat(301) }],
    [{ targetUid: 'abc', action: 'suspend', reason: 5 }],
  ])('rechaza %j', (input) => {
    expect(() => parseModerateInput(input)).toThrow(InputError)
  })
})

describe('parseResolveReportInput', () => {
  it('acepta el formato perfil_reportante', () => {
    expect(parseResolveReportInput({ reportId: 'p1_r1', resolution: 'dismissed' })).toEqual({ reportId: 'p1_r1', resolution: 'dismissed' })
  })

  it.each([
    [{ reportId: 'singuion', resolution: 'resolved' }],
    [{ reportId: 'a_b/c', resolution: 'resolved' }],
    [{ reportId: 'a_b', resolution: 'open' }],
    [{ resolution: 'resolved' }],
  ])('rechaza %j', (input) => {
    expect(() => parseResolveReportInput(input)).toThrow(InputError)
  })
})

describe('parseDeleteAccountInput', () => {
  it('sin datos significa "mi propia cuenta"', () => {
    expect(parseDeleteAccountInput(undefined)).toEqual({})
    expect(parseDeleteAccountInput({})).toEqual({})
  })

  it('valida el uid objetivo', () => {
    expect(parseDeleteAccountInput({ targetUid: 'abc' })).toEqual({ targetUid: 'abc' })
    expect(() => parseDeleteAccountInput({ targetUid: 'a/b' })).toThrow(InputError)
  })
})

describe('isRecentLogin', () => {
  const now = Date.UTC(2026, 0, 1, 12, 0, 0)
  const sec = (offset: number) => now / 1000 + offset

  it('acepta un login de hace menos de 5 minutos', () => {
    expect(isRecentLogin(sec(-30), now)).toBe(true)
    expect(isRecentLogin(sec(-299), now)).toBe(true)
  })

  it('rechaza logins viejos, futuros lejanos o invalidos', () => {
    expect(isRecentLogin(sec(-301), now)).toBe(false)
    expect(isRecentLogin(sec(3600), now)).toBe(false)
    expect(isRecentLogin(undefined, now)).toBe(false)
    expect(isRecentLogin('123', now)).toBe(false)
    expect(isRecentLogin(NaN, now)).toBe(false)
  })
})
