import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import { WorkInfoChips } from '@/components/profile/WorkInfoChips'
import type { PublicProfile } from '@/types/profile'
import { AREA_LABELS, COUNTRY_LABELS } from '@/utils/catalogs'
import { initialsOf } from '@/utils/normalize'

const MAX_SKILLS_SHOWN = 4

// La tarjeta tiene un unico enlace (el boton "Ver perfil completo"). Su ::after se
// estira sobre toda la tarjeta, asi que un click en cualquier parte abre el perfil,
// sin anidar elementos interactivos y con un solo destino para lectores de pantalla.
export function TalentCard({ profile }: { profile: PublicProfile }) {
  const area = profile.area === 'otro' ? (profile.areaOther ?? AREA_LABELS.otro) : AREA_LABELS[profile.area]
  const extraSkills = profile.skills.length - MAX_SKILLS_SHOWN
  const showAffected = profile.affectedGrupoVazquezPublic && profile.affectedGrupoVazquez === true

  return (
    <Card
      sx={{
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 150ms, box-shadow 150ms',
        '&:hover': { borderColor: 'primary.main', boxShadow: 2 },
        '&:focus-within': { borderColor: 'primary.main' },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'primary.main' }} aria-hidden>{initialsOf(profile.displayName)}</Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" component="h3" noWrap>{profile.displayName}</Typography>
              <Typography variant="body2" color="text.secondary" noWrap>{profile.headline}</Typography>
            </Box>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {area} · {profile.city}, {COUNTRY_LABELS[profile.country]} · {profile.experienceYears}{' '}
            {profile.experienceYears === 1 ? 'año' : 'años'}
          </Typography>

          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            <WorkInfoChips availability={profile.availability} workMode={profile.workMode} size="small" />
            {showAffected && <Chip size="small" label="Afectado por Grupo Vázquez" color="secondary" />}
          </Stack>

          {profile.skills.length > 0 && (
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
              {profile.skills.slice(0, MAX_SKILLS_SHOWN).map((skill) => (
                <Chip key={skill} size="small" label={skill} />
              ))}
              {extraSkills > 0 && <Chip size="small" label={`+${extraSkills}`} variant="outlined" />}
            </Stack>
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button
          component={RouterLink}
          to={`/talentos/${profile.uid}`}
          variant="outlined"
          color="inherit"
          size="small"
          endIcon={<ArrowForwardIcon />}
          aria-label={`Ver perfil completo de ${profile.displayName}`}
          sx={{
            borderColor: 'divider',
            // Enlace estirado: el boton deja de ser el contenedor posicionado (MUI lo
            // pone en relative) para que su ::after cubra toda la tarjeta.
            position: 'static',
            '&::after': { content: '""', position: 'absolute', inset: 0, zIndex: 1 },
          }}
        >
          Ver perfil completo
        </Button>
      </CardActions>
    </Card>
  )
}
