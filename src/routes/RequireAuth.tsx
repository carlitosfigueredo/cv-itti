import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoadingState } from '@/components/common/LoadingState'
import { useAuth } from '@/hooks/useAuth'

// Mejora de UX: la proteccion real esta en las reglas de Firebase y el backend.
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <LoadingState label="Verificando sesion" />
  if (status === 'unauthenticated') return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
