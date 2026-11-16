import PublicIcon from '@mui/icons-material/Public'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { setProfilePublished } from '@/services/profile.service'
import type { PublicProfile } from '@/types/profile'

interface PublicationCardProps {
  profile: PublicProfile
  onChanged: () => Promise<void>
}

export function PublicationCard({ profile, onChanged }: PublicationCardProps) {
  const isMobile = useIsMobile()
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
    // Publicar pide confirmacion informada; dejar de publicar es inmediato.
    if (profile.isPublic) void apply(false)
    else setConfirmOpen(true)
  }

  return (
    <Card component="section" aria-labelledby="publicacion-titulo">
      <CardContent>
        <Stack spacing={2} sx={{ p: 1 }}>
          <Typography id="publicacion-titulo" variant="h3" component="h2">Publicación de tu perfil</Typography>

          {profile.isPublic ? (
            <Alert severity="success" icon={<PublicIcon />} role="status">
              <strong>Tu perfil está publicado.</strong> Cualquier persona puede encontrarlo en el directorio, verlo y
              descargar tu CV.
            </Alert>
          ) : (
            <Alert severity="info" icon={<VisibilityOffOutlinedIcon />} role="status">
              <strong>Tu perfil es privado.</strong> Solo vos lo ves. No aparece en el directorio y tu CV no se puede
              descargar.
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary">
            {profile.isPublic
              ? 'Si dejás de publicarlo, dejará de estar disponible en la plataforma de inmediato. No podemos recuperar copias de tu CV que ya se hayan descargado.'
              : 'Cuando estés listo, publicalo para que empresas y reclutadores te encuentren. Antes vas a ver qué datos se muestran.'}
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            {profile.isPublic ? (
              <Button variant="outlined" color="inherit" onClick={handleToggle} disabled={busy}>
                Dejar de publicar
              </Button>
            ) : (
              <Button variant="contained" onClick={handleToggle} disabled={busy}>
                Publicar mi perfil
              </Button>
            )}
            <Button component={RouterLink} to={`/talentos/${profile.uid}`} variant="text">
              {profile.isPublic ? 'Ver mi perfil público' : 'Ver vista previa'}
            </Button>
          </Stack>
        </Stack>
      </CardContent>

      <Dialog fullScreen={isMobile} open={confirmOpen} onClose={() => setConfirmOpen(false)} aria-labelledby="publicar-titulo">
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
            Podés dejar de publicarlo cuando quieras. Más detalle en la{' '}
            <Link component={RouterLink} to="/legal/privacidad">política de privacidad</Link>.
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
