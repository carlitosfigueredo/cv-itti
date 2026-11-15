import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Typography from '@mui/material/Typography'
import { PageContainer } from '@/components/common/PageContainer'

export default function ConfigErrorPage({ errors }: { errors: string[] }) {
  return (
    <PageContainer title="Falta configuracion" maxWidth="md">
      <Alert severity="error">
        <AlertTitle>No se pudo iniciar la aplicacion</AlertTitle>
        <Typography component="ul" sx={{ pl: 2, m: 0 }}>
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </Typography>
      </Alert>
      <Typography sx={{ mt: 2 }} color="text.secondary">
        Copia .env.example a .env.dev.local y completa los valores. Mas detalle en docs/firebase-setup.md.
      </Typography>
    </PageContainer>
  )
}
