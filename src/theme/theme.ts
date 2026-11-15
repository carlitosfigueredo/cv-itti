import { createTheme } from '@mui/material/styles'

// Tema centralizado. Cambiar colores o tipografia aqui afecta toda la app.
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1f4fd8' },
    secondary: { main: '#0f766e' },
    background: { default: '#f6f8fb', paper: '#ffffff' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontWeight: 700, fontSize: '2rem' },
    h3: { fontWeight: 600, fontSize: '1.5rem' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiCard: { defaultProps: { variant: 'outlined' } },
    MuiLink: { defaultProps: { underline: 'hover' } },
  },
})
