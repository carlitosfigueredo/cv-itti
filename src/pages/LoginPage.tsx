import GoogleIcon from '@mui/icons-material/Google'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Link as RouterLink, Navigate, useLocation } from 'react-router-dom'
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

  if (status === 'loading') return <LoadingState label="Verificando sesión" />
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
            <Typography variant="h2" component="h1">Ingresá a itti talentos</Typography>
            <Typography color="text.secondary">
              Usá tu cuenta de Google. Tu perfil arranca privado: nadie lo ve hasta que vos lo publiques.
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
            <Typography variant="body2" color="text.secondary">
              Al continuar aceptás los{' '}
              <Link component={RouterLink} to="/legal/terminos">Términos y condiciones</Link> y la{' '}
              <Link component={RouterLink} to="/legal/privacidad">Política de privacidad y tratamiento de datos</Link>.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </PageContainer>
  )
}
