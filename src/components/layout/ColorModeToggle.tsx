import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useColorScheme } from '@mui/material/styles'

// Alterna entre tema claro y oscuro. La eleccion queda guardada en el navegador.
export function ColorModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme()
  const current = (mode === 'system' ? systemMode : mode) ?? 'light'
  const next = current === 'dark' ? 'light' : 'dark'
  const label = next === 'dark' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'

  return (
    <Tooltip title={label}>
      <IconButton onClick={() => setMode(next)} aria-label={label} color="inherit">
        {current === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
      </IconButton>
    </Tooltip>
  )
}
