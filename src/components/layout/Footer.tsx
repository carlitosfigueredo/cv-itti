import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { BrandLogo } from './BrandLogo'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper', mt: 6 }}>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 4 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1.5, sm: 3 }}
          sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Box>
            <BrandLogo />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Para la comunidad de ITTI y Grupo Vázquez.
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">© {year} itti talentos</Typography>
        </Stack>
      </Container>
    </Box>
  )
}
