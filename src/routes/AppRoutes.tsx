import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { LoadingState } from '@/components/common/LoadingState'
import { AppLayout } from '@/components/layout/AppLayout'
import { RequireAdmin } from './RequireAdmin'
import { RequireAuth } from './RequireAuth'

const HomePage = lazy(() => import('@/pages/HomePage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const EditProfilePage = lazy(() => import('@/pages/EditProfilePage'))
const TalentSearchPage = lazy(() => import('@/pages/TalentSearchPage'))
const PublicProfilePage = lazy(() => import('@/pages/PublicProfilePage'))
const AdminPage = lazy(() => import('@/pages/AdminPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))
const TermsPage = lazy(() => import('@/pages/legal/TermsPage'))
const PrivacyPage = lazy(() => import('@/pages/legal/PrivacyPage'))
const DisclaimerPage = lazy(() => import('@/pages/legal/DisclaimerPage'))

// Las guardas son una mejora de UX; la seguridad real vive en reglas y Cloud Functions.
export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/talentos" element={<TalentSearchPage />} />
          <Route path="/talentos/:uid" element={<PublicProfilePage />} />
          <Route path="/legal/terminos" element={<TermsPage />} />
          <Route path="/legal/privacidad" element={<PrivacyPage />} />
          <Route path="/legal/responsabilidad" element={<DisclaimerPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/perfil/editar" element={<EditProfilePage />} />
          </Route>
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
