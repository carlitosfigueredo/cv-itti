import Box from '@mui/material/Box'
import { Link as RouterLink } from 'react-router-dom'

// Marca en texto. No se usa el logo de itti hasta confirmar que se puede usar.
export function BrandLogo() {
  return (
    <Box
      component={RouterLink}
      to="/"
      aria-label="itti talentos, ir al inicio"
      sx={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 0.75,
        textDecoration: 'none',
        color: 'text.primary',
        fontWeight: 700,
        fontSize: { xs: '1.15rem', sm: '1.3rem' },
        letterSpacing: '-0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      itti
      <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>talentos</Box>
    </Box>
  )
}
