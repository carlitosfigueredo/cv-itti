import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useState } from 'react'
import { adminErrorMessage } from '@/services/admin.errors'

export interface ConfirmActionConfig {
  title: string
  description: string
  confirmLabel: string
  danger?: boolean
  /** Si se define, la persona debe escribir este texto para confirmar. */
  typeToConfirm?: string
  run: (reason: string) => Promise<void>
}

interface ConfirmActionDialogProps {
  config: ConfirmActionConfig | null
  onClose: () => void
  onDone: () => void
}

// Dialogo unico para todas las acciones de moderacion: pide motivo (queda en la
// auditoria), muestra el progreso y traduce los errores de la funcion.
export function ConfirmActionDialog({ config, onClose, onDone }: ConfirmActionDialogProps) {
  const isMobile = useIsMobile()
  const [reason, setReason] = useState('')
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function close() {
    if (busy) return
    setReason('')
    setTyped('')
    setError(null)
    onClose()
  }

  async function confirm() {
    if (!config) return
    setBusy(true)
    setError(null)
    try {
      await config.run(reason.trim())
      setReason('')
      setTyped('')
      onDone()
    } catch (e) {
      setError(adminErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  const blocked = Boolean(config?.typeToConfirm) && typed.trim() !== config?.typeToConfirm

  return (
    <Dialog fullScreen={isMobile} open={config !== null} onClose={close} fullWidth maxWidth="sm" aria-labelledby="confirm-action-title">
      <DialogTitle id="confirm-action-title">{config?.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <DialogContentText>{config?.description}</DialogContentText>
          <TextField
            label="Motivo (queda registrado en la auditoría)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            minRows={2}
            slotProps={{ htmlInput: { maxLength: 300 } }}
            helperText={`${reason.length}/300`}
          />
          {config?.typeToConfirm && (
            <TextField
              label={`Escribí "${config.typeToConfirm}" para confirmar`}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
            />
          )}
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close} disabled={busy}>Cancelar</Button>
        <Button
          onClick={confirm}
          variant="contained"
          color={config?.danger ? 'error' : 'primary'}
          disabled={busy || blocked}
          startIcon={busy ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {config?.confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
