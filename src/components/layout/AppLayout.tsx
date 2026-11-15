import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import { Outlet } from 'react-router-dom'
import { ScrollToTop } from '@/routes/ScrollToTop'
import { Footer } from './Footer'
import { Header } from './Header'

export function AppLayout() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Link
        href="#contenido"
        sx={{
          position: 'absolute',
          left: -9999,
          '&:focus': { left: 8, top: 8, zIndex: 2000, bgcolor: 'background.paper', p: 1, borderRadius: 1 },
        }}
      >
        Saltar al contenido
      </Link>
      <ScrollToTop />
      <Header />
      <Box component="main" id="contenido" tabIndex={-1} sx={{ flexGrow: 1, outline: 'none' }}>
        <Outlet />
      </Box>
      <Footer />
    </Box>
  )
}
