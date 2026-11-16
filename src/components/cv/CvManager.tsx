import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import DownloadIcon from '@mui/icons-material/Download'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { useRef, useState, type ChangeEvent } from 'react'
import { deleteCv, downloadCv, uploadCv } from '@/services/cv.service'
import type { PublicProfile } from '@/types/profile'
import { formatBytes, validateCvFile } from '@/utils/cvFile'

interface CvManagerProps {
  profile: PublicProfile | null
  onChanged: () => Promise<void>
}

export function CvManager({ profile, onChanged }: CvManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!profile) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h3" component="h2" gutterBottom>Mi CV</Typography>
          <Typography color="text.secondary">Primero creá tu perfil y después vas a poder subir tu CV.</Typography>
        </CardContent>
      </Card>
    )
  }

  const uid = profile.uid
  const hasCv = Boolean(profile.cvPath)

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = '' // permite volver a elegir el mismo archivo
    if (!file) return
    setError(null)
    setSuccess(null)

    const validation = await validateCvFile(file)
    if (!validation.ok) {
      setError(validation.message)
      return
    }

    setBusy(true)
    setProgress(0)
    try {
      await uploadCv(uid, file, setProgress)
      await onChanged()
      setSuccess(hasCv ? 'Tu CV se reemplazó correctamente.' : 'Tu CV se subió correctamente.')
    } catch {
      setError('No se pudo subir el CV. Revisá tu conexión e intentá de nuevo.')
    } finally {
      setBusy(false)
      setProgress(null)
    }
  }

  async function handleDownload() {
    setError(null)
    setBusy(true)
    try {
      await downloadCv(uid, `CV - ${profile?.displayName ?? 'perfil'}.pdf`)
    } catch {
      setError('No se pudo descargar el CV. Intentá de nuevo en unos minutos.')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    setConfirmOpen(false)
    setError(null)
    setSuccess(null)
    setBusy(true)
    try {
      await deleteCv(uid)
      await onChanged()
      setSuccess('Tu CV se eliminó.')
    } catch {
      setError('No se pudo eliminar el CV. Intentá de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card component="section" aria-labelledby="cv-title">
      <CardContent>
        <Stack spacing={2} sx={{ p: 1 }}>
          <Typography id="cv-title" variant="h3" component="h2">Mi CV</Typography>

          {hasCv && profile.cvUpdatedAt ? (
            <Typography color="text.secondary">
              CV cargado el {dayjs(profile.cvUpdatedAt.toDate()).format('DD/MM/YYYY HH:mm')}
              {profile.cvSize ? ` (${formatBytes(profile.cvSize)})` : ''}.
            </Typography>
          ) : (
            <Typography color="text.secondary">Todavía no subiste tu CV. Aceptamos PDF de hasta 5 MB.</Typography>
          )}

          <Alert severity="info" role="note">
            Mientras tu perfil esté publicado, cualquiera puede descargar tu CV. Si dejás de publicarlo, deja de estar
            disponible acá, pero no podemos recuperar copias que alguien ya haya descargado.
          </Alert>

          {progress !== null && (
            <LinearProgress variant="determinate" value={progress} aria-label="Progreso de subida" />
          )}
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            hidden
            onChange={handleFile}
            data-testid="cv-input"
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {hasCv ? 'Reemplazar CV' : 'Subir CV'}
            </Button>
            {hasCv && (
              <>
                <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownload} disabled={busy}>
                  Descargar
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  onClick={() => setConfirmOpen(true)}
                  disabled={busy}
                >
                  Eliminar
                </Button>
              </>
            )}
          </Stack>
        </Stack>
      </CardContent>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} aria-labelledby="cv-delete-title">
        <DialogTitle id="cv-delete-title">¿Eliminar tu CV?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Se borrará el archivo de la plataforma. Podés subir uno nuevo cuando quieras.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}
