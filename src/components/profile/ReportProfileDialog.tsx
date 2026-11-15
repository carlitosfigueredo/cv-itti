import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormLabel from '@mui/material/FormLabel'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import {
  REPORT_REASONS,
  REPORT_REASON_LABELS,
  reportProfile,
  type ReportReason,
} from '@/services/report.service'

interface ReportProfileDialogProps {
  open: boolean
  onClose: () => void
  profileUid: string
  /** null cuando el visitante no inició sesión. */
  reporterUid: string | null
  returnTo: string
}

type Outcome = { kind: 'sent' | 'already-reported' | 'error' } | null

export function ReportProfileDialog({ open, onClose, profileUid, reporterUid, returnTo }: ReportProfileDialogProps) {
  const isMobile = useIsMobile()
  const [reason, setReason] = useState<ReportReason>('inappropriate')
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [outcome, setOutcome] = useState<Outcome>(null)

  async function handleSend() {
    if (!reporterUid) return
    setSending(true)
    const result = await reportProfile(profileUid, reporterUid, reason, comment)
    setOutcome({ kind: result })
    setSending(false)
  }

  function handleClose() {
    onClose()
    setOutcome(null)
    setComment('')
  }

  const done = outcome?.kind === 'sent' || outcome?.kind === 'already-reported'

  return (
    <Dialog fullScreen={isMobile} open={open} onClose={handleClose} fullWidth maxWidth="sm" aria-labelledby="report-title">
      <DialogTitle id="report-title">Reportar perfil</DialogTitle>
      <DialogContent>
        {!reporterUid ? (
          <Alert severity="info" role="note">
            Para reportar un perfil necesitás iniciar sesión. Así evitamos reportes falsos o repetidos.
          </Alert>
        ) : done ? (
          <Alert severity={outcome?.kind === 'sent' ? 'success' : 'info'}>
            {outcome?.kind === 'sent'
              ? 'Gracias. Recibimos tu reporte y lo va a revisar el equipo de moderación.'
              : 'Ya reportaste este perfil antes. El equipo de moderación lo va a revisar.'}
          </Alert>
        ) : (
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <FormControl>
              <FormLabel id="report-reason-label">Motivo</FormLabel>
              <RadioGroup
                aria-labelledby="report-reason-label"
                value={reason}
                onChange={(event) => setReason(event.target.value as ReportReason)}
              >
                {REPORT_REASONS.map((code) => (
                  <FormControlLabel key={code} value={code} control={<Radio />} label={REPORT_REASON_LABELS[code]} />
                ))}
              </RadioGroup>
            </FormControl>
            <TextField
              label="Comentario (opcional)"
              multiline
              minRows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              slotProps={{ htmlInput: { maxLength: 500 } }}
              helperText={`${comment.length}/500`}
            />
            {outcome?.kind === 'error' && (
              <Alert severity="error">No se pudo enviar el reporte. Intentá de nuevo en unos minutos.</Alert>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{done ? 'Cerrar' : 'Cancelar'}</Button>
        {!reporterUid && (
          <Button component={RouterLink} to="/login" state={{ from: returnTo }} variant="contained">Ingresar</Button>
        )}
        {reporterUid && !done && (
          <Button onClick={handleSend} variant="contained" disabled={sending}>Enviar reporte</Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
