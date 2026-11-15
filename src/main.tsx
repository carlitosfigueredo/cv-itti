import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App'
import { initFirebase } from './firebase/config'
import { readFirebaseEnv } from './firebase/env'
import ConfigErrorPage from './pages/ConfigErrorPage'
import { theme } from './theme/theme'

const root = createRoot(document.getElementById('root')!)
const result = readFirebaseEnv(import.meta.env)

if (result.ok) {
  initFirebase(result.env)
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} else {
  root.render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ConfigErrorPage errors={result.errors} />
    </ThemeProvider>,
  )
}
