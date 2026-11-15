import GoogleIcon from '@mui/icons-material/Google'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LoadingState } from '@/components/common/LoadingState'
import { PageContainer } from '@/components/common/PageContainer'
import { useAuth } from '@/hooks/useAuth'
import type { AuthFailure } from '@/services/auth.errors'
import { safeRedirectPath } from '@/utils/safeRedirect'

export default function LoginPage() {
  const { status, signIn } = useAuth()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)
  const [failure, setFailure] = useState<AuthFailure | null>(null)

  if (status === 'loading') return <LoadingState label="Verificando sesion" />
  if (status === 'authenticated') {
    const from = (location.state as { from?: unknown } | null)?.from
    return <Navigate to={safeRedirectPath(from)} replace />
  }

  async function handleSignIn() {
    setSubmitting(true)
    setFailure(null)
    const result = await signIn()
    if (!result.ok) setFailure(result.failure)
    setSubmitting(false)
  }

  return (
    <PageContainer maxWidth="sm">
      <Card>
        <CardContent>
          <Stack spacing={3} sx={{ p: 1 }}>
            <Typography variant="h2" component="h1">Ingresar</Typography>
            <Typography color="text.secondary">
              Usa tu cuenta de Google para crear tu perfil. Tu perfil y tu CV son privados hasta que
              decidas publicarlos.
            </Typography>
            {failure && (
              <Alert severity={failure.kind === 'cancelled' ? 'info' : 'error'}>{failure.message}</Alert>
            )}
            <Button
              variant="contained"
              size="large"
              onClick={handleSignIn}
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <GoogleIcon />}
            >
              Continuar con Google
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
