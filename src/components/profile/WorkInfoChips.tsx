import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ScheduleIcon from '@mui/icons-material/Schedule'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import type { Availability, WorkMode } from '@/types/profile'
import { AVAILABILITY_LABELS, WORK_MODE_LABELS } from '@/utils/catalogs'

// Chips de disponibilidad y modalidad con icono y texto explicito, para que se
// entienda a que se refiere cada uno sin contexto adicional.
export function WorkInfoChips({ availability, workMode, size = 'medium' }: {
  availability: Availability
  workMode: WorkMode
  size?: 'small' | 'medium'
}) {
  const available = availability === 'available'
  return (
    <>
      <Tooltip title="Disponibilidad para empezar a trabajar">
        <Chip
          size={size}
          icon={available ? <CheckCircleOutlineIcon /> : <ScheduleIcon />}
          label={AVAILABILITY_LABELS[availability]}
          color={available ? 'success' : 'default'}
          variant="outlined"
        />
      </Tooltip>
      <Tooltip title="Modalidad de trabajo que busca">
        <Chip size={size} icon={<WorkOutlineIcon />} label={WORK_MODE_LABELS[workMode]} variant="outlined" />
      </Tooltip>
    </>
  )
}
