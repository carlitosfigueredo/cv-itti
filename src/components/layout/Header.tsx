import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'

export function Header() {
  return (
    <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar sx={{ gap: 1, flexWrap: 'wrap' }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 1, color: 'primary.main', textDecoration: 'none', fontWeight: 700 }}
        >
          Talent Platform
        </Typography>
        <Button component={RouterLink} to="/talentos" color="inherit">Talentos</Button>
        <Button component={RouterLink} to="/login" variant="contained">Ingresar</Button>
      </Toolbar>
    </AppBar>
  )
}
