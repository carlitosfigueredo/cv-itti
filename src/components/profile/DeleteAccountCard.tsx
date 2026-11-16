import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIsMobile } from '@/hooks/useIsMobile'
import { deleteOwnAccount } from '@/services/account.service'
import { adminErrorMessage } from '@/services/admin.errors'

const CONFIRM_WORD = 'ELIMINAR'

export function DeleteAccountCard() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function close() {
    if (busy) return
    setOpen(false)
    setTyped('')
    setError(null)
  }

  async function confirm() {
    setBusy(true)
    setError(null)
    const result = await deleteOwnAccount()
    setBusy(false)
    if (result.ok) {
      navigate('/', { replace: true, state: { accountDeleted: true } })
      return
    }
    if (result.reason === 'cancelled') {
      setError('Cancelaste la confirmación con Google. Tu cuenta no se eliminó.')
      return
    }
    setError(adminErrorMessage(result.error))
  }

  return (
    <Card component="section" aria-labelledby="eliminar-cuenta-titulo" sx={{ borderColor: 'error.main' }}>
      <CardContent>
        <Stack spacing={1.5} sx={{ p: 1 }}>
          <Typography id="eliminar-cuenta-titulo" variant="h3" component="h2">Eliminar mi cuenta</Typography>
          <Typography variant="body2" color="text.secondary">
            Se borran tu perfil, tu CV y los datos de tu cuenta. No se puede deshacer.
          </Typography>
          <div>
            <Button color="error" variant="outlined" onClick={() => setOpen(true)}>Eliminar mi cuenta</Button>
          </div>
        </Stack>
      </CardContent>

      <Dialog open={open} onClose={close} fullScreen={isMobile} fullWidth maxWidth="sm" aria-labelledby="eliminar-dialogo-titulo">
        <DialogTitle id="eliminar-dialogo-titulo">¿Eliminar tu cuenta definitivamente?</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography component="div" color="text.secondary">
              Se va a borrar:
              <ul>
                <li>Tu perfil (deja de aparecer en el directorio).</li>
                <li>Tu CV.</li>
                <li>Los datos de tu cuenta.</li>
              </ul>
              Queda solo un registro mínimo de la acción, sin el contenido de tu perfil ni de tu CV. No podemos borrar copias
              de tu CV que otras personas ya hayan descargado.
            </Typography>
            <Alert severity="info" role="note">Por seguridad, te vamos a pedir que confirmes con tu cuenta de Google.</Alert>
            <TextField
              label={`Escribí "${CONFIRM_WORD}" para confirmar`}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
            />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={close} disabled={busy}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            onClick={confirm}
            disabled={busy || typed.trim() !== CONFIRM_WORD}
            startIcon={busy ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            Eliminar mi cuenta
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}
