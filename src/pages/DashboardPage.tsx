import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageContainer } from '@/components/common/PageContainer'
import { useAuth } from '@/hooks/useAuth'
import { useProfileData } from '@/hooks/useProfileData'
import type { AuthUser } from '@/types/auth'
import { AREA_LABELS } from '@/utils/catalogs'

function DashboardContent({ user }: { user: AuthUser }) {
  const { state, reload } = useProfileData(user)

  if (state.status === 'loading') return <LoadingState label="Cargando tu panel" />
  if (state.status === 'error') return <ErrorState message="No se pudo cargar tu panel." onRetry={reload} />

  const { profile } = state

  if (!profile) {
    return (
      <Card>
        <CardContent>
          <Stack spacing={2} sx={{ p: 1 }}>
            <Typography variant="h3" component="h2">Todavía no creaste tu perfil</Typography>
            <Typography color="text.secondary">
              Completá tus datos profesionales. Tu perfil será privado hasta que decidas publicarlo.
            </Typography>
            <div>
              <Button component={RouterLink} to="/perfil/editar" variant="contained">Crear mi perfil</Button>
            </div>
          </Stack>
        </CardContent>
      </Card>
    )
  }

  return (
    <Stack spacing={3}>
      <Card>
        <CardContent>
          <Stack spacing={2} sx={{ p: 1 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
              <Typography variant="h3" component="h2" sx={{ flexGrow: 1 }}>{profile.displayName}</Typography>
              <Chip
                label={profile.isPublic ? 'Perfil publicado' : 'Perfil privado'}
                color={profile.isPublic ? 'success' : 'default'}
              />
            </Stack>
            <Typography color="text.secondary">
              {profile.headline} - {AREA_LABELS[profile.area]} - {profile.city}
            </Typography>
            {!profile.isPublic && (
              <Alert severity="info">
                Nadie puede ver tu perfil todavía. La opción para publicarlo estará disponible pronto.
              </Alert>
            )}
            <div>
              <Button component={RouterLink} to="/perfil/editar" variant="outlined">Editar perfil</Button>
            </div>
          </Stack>
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <Typography variant="h3" component="h2" gutterBottom>Mi CV</Typography>
          <Typography color="text.secondary">La carga de CV estará disponible pronto.</Typography>
        </CardContent>
      </Card>
    </Stack>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  return (
    <PageContainer title="Mi panel" maxWidth="md">
      {user && <DashboardContent user={user} />}
    </PageContainer>
  )
}
