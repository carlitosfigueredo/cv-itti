import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

// true en pantallas chicas (menos de 600 px). Se usa para dialogos a pantalla completa.
export function useIsMobile(): boolean {
  const theme = useTheme()
  return useMediaQuery(theme.breakpoints.down('sm'))
}
