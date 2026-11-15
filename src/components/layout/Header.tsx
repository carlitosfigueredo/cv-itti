import Avatar from '@mui/material/Avatar'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { initialsOf } from '@/utils/normalize'
import { BrandLogo } from './BrandLogo'
import { ColorModeToggle } from './ColorModeToggle'

export function Header() {
  const { status, user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const close = () => setAnchor(null)

  async function handleSignOut() {
    close()
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <AppBar
      position="sticky"
      sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', backdropFilter: 'blur(8px)' }}
    >
      <Container maxWidth="lg" disableGutters>
        <Toolbar sx={{ gap: { xs: 0.5, sm: 1 }, minHeight: { xs: 60, sm: 68 }, px: { xs: 2, sm: 3 } }}>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <BrandLogo />
          </Box>

          <ColorModeToggle />

          {status === 'authenticated' && user ? (
            <>
              <Button
                component={RouterLink}
                to="/dashboard"
                color="inherit"
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Mi panel
              </Button>
              <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Menú de usuario" sx={{ p: 0.5 }}>
                <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.light', color: 'primary.dark', fontSize: 14, fontWeight: 700 }}>
                  {initialsOf(user.displayName ?? user.email ?? '?')}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={close}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem disabled sx={{ opacity: '1 !important' }}>
                  <ListItemText
                    primary={user.displayName ?? 'Mi cuenta'}
                    secondary={user.email}
                    slotProps={{ primary: { sx: { fontWeight: 600 } }, secondary: { sx: { overflowWrap: 'anywhere' } } }}
                  />
                </MenuItem>
                <Divider />
                <MenuItem component={RouterLink} to="/dashboard" onClick={close}>Mi panel</MenuItem>
                <MenuItem component={RouterLink} to="/perfil/editar" onClick={close}>Editar mi perfil</MenuItem>
                {isAdmin && <MenuItem component={RouterLink} to="/admin" onClick={close}>Administración</MenuItem>}
                <Divider />
                <MenuItem onClick={handleSignOut}>Cerrar sesión</MenuItem>
              </Menu>
            </>
          ) : (
            status === 'unauthenticated' && (
              <>
                <Button component={RouterLink} to="/login" color="inherit" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                  Ingresar
                </Button>
                <Button component={RouterLink} to="/login" variant="contained" size="small" sx={{ ml: 0.5, whiteSpace: 'nowrap' }}>
                  Cargar mi CV
                </Button>
              </>
            )
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}
