import Avatar from '@mui/material/Avatar'
import AppBar from '@mui/material/AppBar'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function Header() {
  const { status, user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)

  async function handleSignOut() {
    setAnchor(null)
    await signOut()
    navigate('/', { replace: true })
  }

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
        {status === 'authenticated' && user ? (
          <>
            <IconButton onClick={(event) => setAnchor(event.currentTarget)} aria-label="Menu de usuario">
              <Avatar src={user.photoURL ?? undefined} alt="" sx={{ width: 32, height: 32 }}>
                {(user.displayName ?? user.email ?? '?').charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
              <MenuItem component={RouterLink} to="/dashboard" onClick={() => setAnchor(null)}>Mi panel</MenuItem>
              <MenuItem component={RouterLink} to="/perfil/editar" onClick={() => setAnchor(null)}>Editar perfil</MenuItem>
              {isAdmin && (
                <MenuItem component={RouterLink} to="/admin" onClick={() => setAnchor(null)}>Administracion</MenuItem>
              )}
              <MenuItem onClick={handleSignOut}>Cerrar sesion</MenuItem>
            </Menu>
          </>
        ) : (
          status === 'unauthenticated' && (
            <Button component={RouterLink} to="/login" variant="contained">Ingresar</Button>
          )
        )}
      </Toolbar>
    </AppBar>
  )
}
