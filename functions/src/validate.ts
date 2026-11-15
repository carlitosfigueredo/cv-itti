// Validacion pura de las entradas de las funciones callable (sin Firebase).

export class InputError extends Error {}

const UID = /^[A-Za-z0-9]{1,128}$/
const REPORT_ID = /^[A-Za-z0-9]{1,128}_[A-Za-z0-9]{1,128}$/

export const MODERATE_ACTIONS = ['unpublish', 'removeCv', 'suspend', 'unsuspend'] as const
export type ModerateAction = (typeof MODERATE_ACTIONS)[number]

export const RESOLUTIONS = ['resolved', 'dismissed'] as const
export type Resolution = (typeof RESOLUTIONS)[number]

function asRecord(data: unknown): Record<string, unknown> {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) throw new InputError('invalid-input')
  return data as Record<string, unknown>
}

function uidField(value: unknown): string {
  if (typeof value !== 'string' || !UID.test(value)) throw new InputError('invalid-uid')
  return value
}

function optionalReason(value: unknown): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string') throw new InputError('invalid-reason')
  const trimmed = value.trim()
  if (trimmed.length > 300) throw new InputError('invalid-reason')
  return trimmed || undefined
}

export function parseModerateInput(data: unknown): { targetUid: string; action: ModerateAction; reason?: string } {
  const d = asRecord(data)
  const action = d['action']
  if (typeof action !== 'string' || !(MODERATE_ACTIONS as readonly string[]).includes(action)) {
    throw new InputError('invalid-action')
  }
  const reason = optionalReason(d['reason'])
  return {
    targetUid: uidField(d['targetUid']),
    action: action as ModerateAction,
    ...(reason ? { reason } : {}),
  }
}

export function parseResolveReportInput(data: unknown): { reportId: string; resolution: Resolution } {
  const d = asRecord(data)
  const reportId = d['reportId']
  const resolution = d['resolution']
  if (typeof reportId !== 'string' || !REPORT_ID.test(reportId)) throw new InputError('invalid-report')
  if (typeof resolution !== 'string' || !(RESOLUTIONS as readonly string[]).includes(resolution)) {
    throw new InputError('invalid-resolution')
  }
  return { reportId, resolution: resolution as Resolution }
}

// targetUid es opcional: si falta, la persona borra su propia cuenta.
export function parseDeleteAccountInput(data: unknown): { targetUid?: string; reason?: string } {
  if (data === undefined || data === null) return {}
  const d = asRecord(data)
  const reason = optionalReason(d['reason'])
  return {
    ...(d['targetUid'] !== undefined ? { targetUid: uidField(d['targetUid']) } : {}),
    ...(reason ? { reason } : {}),
  }
}

export const RECENT_LOGIN_SECONDS = 5 * 60

// auth_time: segundos desde epoch del ultimo inicio de sesion real (no del refresco del token).
export function isRecentLogin(authTime: unknown, nowMs: number): boolean {
  if (typeof authTime !== 'number' || !Number.isFinite(authTime)) return false
  const ageSeconds = nowMs / 1000 - authTime
  return ageSeconds >= -60 && ageSeconds <= RECENT_LOGIN_SECONDS
}
