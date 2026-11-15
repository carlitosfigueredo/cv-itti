import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { PageContainer } from '@/components/common/PageContainer'

export default function HomePage() {
  return (
    <PageContainer>
      <Stack spacing={3} sx={{ py: { xs: 4, md: 8 }, maxWidth: 720 }}>
        <Typography variant="h1">Tu próximo trabajo empieza con un buen perfil</Typography>
        <Typography variant="h6" component="p" color="text.secondary">
          Publicá tu perfil y tu CV para que empresas y reclutadores encuentren a los profesionales
          de ITTI y Grupo Vázquez.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button component={RouterLink} to="/login" variant="contained" size="large">Crear mi perfil</Button>
          <Button component={RouterLink} to="/talentos" variant="outlined" size="large">Buscar talento</Button>
        </Stack>
      </Stack>
    </PageContainer>
  )
}
