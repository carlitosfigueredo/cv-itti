import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

const STEPS = ['Ingresá con Google', 'Completá tu perfil y subí tu CV', 'Publicalo cuando quieras']

// Bloque superior del inicio: invita a cargar el CV sin tapar el directorio.
export function CvBanner() {
  const { status } = useAuth()
  const signedIn = status === 'authenticated'

  return (
    <Box
      component="section"
      aria-labelledby="cv-banner-title"
      sx={(theme) => ({
        borderRadius: { xs: 3, md: 4 },
        p: { xs: 3, sm: 4, md: 5 },
        bgcolor: 'primary.light',
        border: 1,
        borderColor: 'divider',
        ...theme.applyStyles('dark', { bgcolor: 'background.paper' }),
      })}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 3, md: 6 }}
        sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
      >
        <Box sx={{ maxWidth: 620 }}>
          <Typography variant="overline" component="p" color="primary" sx={{ display: 'block', mb: 1 }}>
            Comunidad ITTI y Grupo Vázquez
          </Typography>
          <Typography id="cv-banner-title" variant="h1" sx={{ mb: 1.5 }}>
            Cargá tu CV y que las empresas te encuentren
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: { sm: '1.05rem' } }}>
            Armá tu perfil en pocos pasos. Vos decidís qué se publica y podés ocultarlo cuando quieras.
          </Typography>
          <Button
            component={RouterLink}
            to={signedIn ? '/dashboard' : '/login'}
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{ mt: 3, width: { xs: '100%', sm: 'auto' } }}
          >
            {signedIn ? 'Ir a mi panel' : 'Cargar mi CV'}
          </Button>
        </Box>

        <Box component="ol" sx={{ listStyle: 'none', p: 0, m: 0, display: 'grid', gap: 1.5, minWidth: { md: 300 } }}>
          {STEPS.map((step, index) => (
            <Box component="li" key={step} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Box
                aria-hidden
                sx={{
                  flexShrink: 0,
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                  fontSize: 14,
                  bgcolor: 'background.paper',
                  color: 'primary.main',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                {index + 1}
              </Box>
              <Typography sx={{ fontWeight: 500 }}>{step}</Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    </Box>
  )
}
