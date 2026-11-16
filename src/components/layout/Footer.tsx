import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { LEGAL_LINKS } from '@/config/legal'
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
              Para la comunidad de ITTI y Grupo Vázquez. Iniciativa independiente, no oficial.
            </Typography>
          </Box>
          <Stack spacing={1} sx={{ alignItems: { xs: 'flex-start', sm: 'flex-end' } }}>
            <Box component="nav" aria-label="Textos legales" sx={{ display: 'flex', flexWrap: 'wrap', columnGap: 2, rowGap: 0.5 }}>
              {LEGAL_LINKS.map((l) => (
                <Link key={l.to} component={RouterLink} to={l.to} variant="body2" color="text.secondary">{l.label}</Link>
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary">© {year} itti talentos</Typography>
          </Stack>
        </Stack>
      </Container>
    </Box>
  )
}
