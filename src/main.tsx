import '@fontsource/poppins/400.css'
import '@fontsource/poppins/500.css'
import '@fontsource/poppins/600.css'
import '@fontsource/poppins/700.css'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initFirebase } from './firebase/config'
import { readFirebaseEnv } from './firebase/env'
import ConfigErrorPage from './pages/ConfigErrorPage'
import { theme } from './theme/theme'

const root = createRoot(document.getElementById('root')!)
const result = readFirebaseEnv(import.meta.env)

if (result.ok) initFirebase(result.env)

// El tema envuelve toda la app (tambien la pantalla de error de configuracion).
// defaultMode "system": la primera vez sigue la preferencia del dispositivo.
root.render(
  <StrictMode>
    <ThemeProvider theme={theme} defaultMode="system" disableTransitionOnChange>
      <CssBaseline enableColorScheme />
      {result.ok ? <App /> : <ConfigErrorPage errors={result.errors} />}
    </ThemeProvider>
  </StrictMode>,
)
