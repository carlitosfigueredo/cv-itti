// Traduce los codigos de las Cloud Functions a mensajes para la persona.
const DETAIL_MESSAGES: Record<string, string> = {
  'self-moderation': 'No podés aplicar esta acción sobre tu propia cuenta.',
  'target-is-admin': 'No se puede moderar a otro administrador. Primero hay que quitarle el rol.',
  'admin-cannot-self-delete': 'Un administrador no puede borrar su propia cuenta desde la app. Pedí que te quiten el rol antes.',
  'user-not-found': 'La cuenta ya no existe.',
  'profile-not-found': 'La persona no tiene un perfil creado.',
  'report-not-found': 'El reporte ya no existe.',
  'report-already-closed': 'Este reporte ya fue cerrado por otra persona.',
  'recent-login-required': 'Por seguridad, volvé a iniciar sesión e intentá de nuevo.',
  'admin-required': 'Tu cuenta no tiene permisos de administración. Si te los acaban de dar, cerrá sesión y volvé a entrar.',
}

const CODE_MESSAGES: Record<string, string> = {
  'functions/unauthenticated': 'Tu sesión expiró. Volvé a iniciar sesión.',
  'functions/permission-denied': DETAIL_MESSAGES['admin-required'] as string,
  'functions/unavailable': 'No hay conexión con el servidor. Revisá tu internet e intentá de nuevo.',
  'functions/deadline-exceeded': 'El servidor tardó demasiado. Intentá de nuevo.',
}

export function adminErrorMessage(error: unknown): string {
  const e = (error ?? {}) as { code?: string; message?: string }
  if (e.message && DETAIL_MESSAGES[e.message]) return DETAIL_MESSAGES[e.message] as string
  if (e.code && CODE_MESSAGES[e.code]) return CODE_MESSAGES[e.code] as string
  return 'No se pudo completar la acción. Intentá de nuevo en unos minutos.'
}
