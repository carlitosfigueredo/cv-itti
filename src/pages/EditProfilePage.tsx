import Button from '@mui/material/Button'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageContainer } from '@/components/common/PageContainer'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { useAuth } from '@/hooks/useAuth'
import { useProfileData } from '@/hooks/useProfileData'
import type { ProfileFormOutput } from '@/schemas/profile'
import { emptyFormValues, formToProfileContent, profileToFormValues } from '@/services/profile.mappers'
import type { AuthUser } from '@/types/auth'

// Se separa para llamar al hook solo con un usuario ya autenticado (RequireAuth).
function EditProfileContent({ user }: { user: AuthUser }) {
  const navigate = useNavigate()
  const { state, reload, save } = useProfileData(user)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (state.status === 'loading') return <LoadingState label="Cargando perfil" />
  if (state.status === 'error') {
    return <ErrorState message="No se pudo cargar tu perfil." onRetry={reload} />
  }

  const email = user.email ?? ''
  const defaults = state.profile
    ? profileToFormValues(state.profile, state.userDoc.affectedGrupoVazquez, email)
    : emptyFormValues(user.displayName ?? '', email)

  async function handleSubmit(values: ProfileFormOutput) {
    setSubmitError(null)
    try {
      await save(formToProfileContent(values), values.affectedGrupoVazquez === 'yes')
      navigate('/dashboard')
    } catch {
      setSubmitError('No se pudo guardar el perfil. Revisá tu conexión e intentá de nuevo.')
    }
  }

  return <ProfileForm defaultValues={defaults} onSubmit={handleSubmit} submitError={submitError} />
}

export default function EditProfilePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  return (
    <PageContainer title="Editar perfil" maxWidth="md">
      {user ? (
        <EditProfileContent user={user} />
      ) : (
        <Button onClick={() => navigate('/login')}>Ingresar</Button>
      )}
    </PageContainer>
  )
}
