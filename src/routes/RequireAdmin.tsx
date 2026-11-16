import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '@/components/common/LoadingState'
import { useAuth } from '@/hooks/useAuth'

// Mejora de UX: la autorizacion real de admin esta en reglas y Cloud Functions.
export function RequireAdmin() {
  const { status, isAdmin } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <LoadingState label="Verificando permisos" />
  if (status === 'unauthenticated') return <Navigate to="/login" replace state={{ from: location.pathname }} />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
