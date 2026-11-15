import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { setProfilePublished } from '@/services/profile.service'
import type { PublicProfile } from '@/types/profile'

interface PublicationCardProps {
  profile: PublicProfile
  onChanged: () => Promise<void>
}

export function PublicationCard({ profile, onChanged }: PublicationCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function apply(next: boolean) {
    setConfirmOpen(false)
    setBusy(true)
    setError(null)
    try {
      await setProfilePublished(profile.uid, next)
      await onChanged()
    } catch {
      setError(
        next
          ? 'No se pudo publicar tu perfil. Revisá que esté completo e intentá de nuevo.'
          : 'No se pudo despublicar tu perfil. Intentá de nuevo.',
      )
    } finally {
      setBusy(false)
    }
  }

  function handleToggle() {
    // Publicar pide confirmacion informada; despublicar es inmediato.
    if (profile.isPublic) void apply(false)
    else setConfirmOpen(true)
  }

  return (
    <Card component="section" aria-labelledby="publicacion-titulo">
      <CardContent>
        <Stack spacing={2} sx={{ p: 1 }}>
          <Typography id="publicacion-titulo" variant="h3" component="h2">Visibilidad</Typography>
          <FormControlLabel
            control={<Switch
                checked={profile.isPublic}
                onChange={handleToggle}
                disabled={busy}
                slotProps={{ input: { role: 'switch' } }}
              />}
            label={profile.isPublic ? 'Mi perfil está publicado' : 'Mi perfil es privado'}
          />
          <Typography variant="body2" color="text.secondary">
            {profile.isPublic
              ? 'Cualquier persona puede encontrar tu perfil y descargar tu CV. Si lo despublicás, dejará de estar disponible en la plataforma de inmediato, pero no podemos recuperar copias ya descargadas.'
              : 'Nadie puede ver tu perfil ni tu CV hasta que lo publiques.'}
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
          <div>
            <Button component={RouterLink} to={`/talentos/${profile.uid}`} variant="outlined">
              {profile.isPublic ? 'Ver mi perfil público' : 'Ver vista previa'}
            </Button>
          </div>
        </Stack>
      </CardContent>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} aria-labelledby="publicar-titulo">
        <DialogTitle id="publicar-titulo">¿Publicar tu perfil?</DialogTitle>
        <DialogContent>
          <DialogContentText component="div">
            Se va a mostrar públicamente:
            <ul>
              <li>Tu nombre público, titular, área, ciudad y país.</li>
              <li>Tu experiencia, habilidades, modalidad y disponibilidad.</li>
              <li>Tu resumen y tus enlaces, si los completaste.</li>
              <li>Tu CV en PDF, si lo subiste.</li>
              <li>
                Tu email y teléfono solo si marcaste que querés publicarlos
                {profile.contactEmailPublic || profile.contactPhonePublic ? ' (marcaste al menos uno)' : ' (hoy no marcaste ninguno)'}.
              </li>
              <li>
                Tu respuesta sobre Grupo Vázquez solo si diste tu consentimiento
                {profile.affectedGrupoVazquezPublic ? ' (lo diste)' : ' (hoy no lo diste)'}.
              </li>
            </ul>
            Podés despublicarlo cuando quieras.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button onClick={() => void apply(true)} variant="contained">Publicar</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}
