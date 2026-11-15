// Errores de autenticacion traducidos para el usuario. Sin dependencias de Firebase
// para poder probarlo de forma aislada.
export type AuthErrorKind = 'cancelled' | 'popup-blocked' | 'network' | 'unknown'

export interface AuthFailure {
  kind: AuthErrorKind
  message: string
}

const MESSAGES: Record<AuthErrorKind, string> = {
  cancelled: 'Cancelaste el inicio de sesion. Puedes intentarlo de nuevo.',
  'popup-blocked': 'El navegador bloqueo la ventana de Google. Permite las ventanas emergentes e intenta de nuevo.',
  network: 'No hay conexion con el servidor. Revisa tu internet e intenta de nuevo.',
  unknown: 'No se pudo iniciar sesion. Intenta de nuevo en unos minutos.',
}

export function mapAuthError(error: unknown): AuthFailure {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : ''
  let kind: AuthErrorKind = 'unknown'
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') kind = 'cancelled'
  else if (code === 'auth/popup-blocked') kind = 'popup-blocked'
  else if (code === 'auth/network-request-failed') kind = 'network'
  return { kind, message: MESSAGES[kind] }
}
