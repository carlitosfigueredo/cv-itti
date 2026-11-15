import DownloadIcon from '@mui/icons-material/Download'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LaunchIcon from '@mui/icons-material/Launch'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import type { PublicProfile } from '@/types/profile'
import {
  AREA_LABELS,
  AVAILABILITY_LABELS,
  COUNTRY_LABELS,
  WORK_MODE_LABELS,
} from '@/utils/catalogs'
import { initialsOf } from '@/utils/normalize'

interface PublicProfileViewProps {
  profile: PublicProfile
  /** Vista previa de un perfil que todavia no es publico (solo la ve su dueño o un admin). */
  preview?: boolean
  onDownloadCv?: () => void
  downloadingCv?: boolean
  cvError?: string | null
  /** Acciones adicionales (por ejemplo "Reportar"). */
  actions?: ReactNode
}

// Solo se enlazan URLs https (las reglas ya lo exigen; esto es defensa en profundidad).
const safeHttps = (url: string | undefined) => (url && /^https:\/\//.test(url) ? url : null)

function ExternalLink({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer nofollow" sx={{ display: 'inline-flex', gap: 0.5, alignItems: 'center' }}>
      {label}
      <LaunchIcon fontSize="inherit" aria-hidden />
    </Link>
  )
}

export function PublicProfileView({ profile, preview, onDownloadCv, downloadingCv, cvError, actions }: PublicProfileViewProps) {
  const area = profile.area === 'otro' ? (profile.areaOther ?? AREA_LABELS.otro) : AREA_LABELS[profile.area]
  const links = [
    { label: 'LinkedIn', href: safeHttps(profile.linkedin) },
    { label: 'GitHub', href: safeHttps(profile.github) },
    { label: 'Portfolio', href: safeHttps(profile.portfolio) },
  ].filter((l): l is { label: string; href: string } => l.href !== null)
  const hasContact = Boolean(profile.publicEmail || profile.publicPhone)
  const showAffected = profile.affectedGrupoVazquezPublic && profile.affectedGrupoVazquez === true

  return (
    <Stack spacing={3}>
      {preview && (
        <Alert severity="info" role="note">
          Vista previa: tu perfil es privado y solo vos lo ves. Publicalo desde tu panel para que aparezca en el directorio.
        </Alert>
      )}

      <Card>
        <CardContent>
          <Stack spacing={2.5} sx={{ p: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} sx={{ alignItems: { sm: 'center' } }}>
              <Avatar sx={{ width: 72, height: 72, bgcolor: 'primary.main', fontSize: 28 }} aria-hidden>
                {initialsOf(profile.displayName)}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h2" component="h1">{profile.displayName}</Typography>
                <Typography variant="h6" component="p" color="text.secondary">{profile.headline}</Typography>
              </Box>
              {actions}
            </Stack>

            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Chip label={area} />
              <Chip label={`${profile.city}, ${COUNTRY_LABELS[profile.country]}`} variant="outlined" />
              <Chip label={`${profile.experienceYears} ${profile.experienceYears === 1 ? 'año' : 'años'} de experiencia`} variant="outlined" />
              <Chip label={WORK_MODE_LABELS[profile.workMode]} variant="outlined" />
              <Chip
                label={AVAILABILITY_LABELS[profile.availability]}
                color={profile.availability === 'available' ? 'success' : 'default'}
                variant="outlined"
              />
              {showAffected && <Chip label="Afectado por Grupo Vázquez" color="secondary" />}
            </Stack>

            {profile.cvPath && onDownloadCv && (
              <Box>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={onDownloadCv}
                  disabled={downloadingCv}
                >
                  Descargar CV
                </Button>
              </Box>
            )}
            {cvError && <Alert severity="error">{cvError}</Alert>}
          </Stack>
        </CardContent>
      </Card>

      {profile.summary && (
        <Card component="section" aria-labelledby="resumen-titulo">
          <CardContent>
            <Typography id="resumen-titulo" variant="h3" component="h2" gutterBottom>Resumen</Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{profile.summary}</Typography>
          </CardContent>
        </Card>
      )}

      {profile.skills.length > 0 && (
        <Card component="section" aria-labelledby="habilidades-titulo">
          <CardContent>
            <Typography id="habilidades-titulo" variant="h3" component="h2" gutterBottom>Habilidades</Typography>
            <Stack direction="row" component="ul" sx={{ flexWrap: 'wrap', gap: 1, listStyle: 'none', p: 0, m: 0 }}>
              {profile.skills.map((skill) => (
                <li key={skill}>
                  <Chip label={skill} size="small" />
                </li>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {(links.length > 0 || hasContact) && (
        <Card component="section" aria-labelledby="contacto-titulo">
          <CardContent>
            <Typography id="contacto-titulo" variant="h3" component="h2" gutterBottom>Enlaces y contacto</Typography>
            <Stack spacing={1}>
              {links.map((l) => (
                <ExternalLink key={l.label} label={l.label} href={l.href} />
              ))}
              {profile.publicEmail && (
                <Link href={`mailto:${profile.publicEmail}`} sx={{ display: 'inline-flex', gap: 0.5, alignItems: 'center' }}>
                  <EmailOutlinedIcon fontSize="inherit" aria-hidden />
                  {profile.publicEmail}
                </Link>
              )}
              {profile.publicPhone && (
                <Link href={`tel:${profile.publicPhone.replace(/[^+\d]/g, '')}`} sx={{ display: 'inline-flex', gap: 0.5, alignItems: 'center' }}>
                  <PhoneOutlinedIcon fontSize="inherit" aria-hidden />
                  {profile.publicPhone}
                </Link>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}
