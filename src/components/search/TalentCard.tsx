import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link as RouterLink } from 'react-router-dom'
import type { PublicProfile } from '@/types/profile'
import { AREA_LABELS, AVAILABILITY_LABELS, COUNTRY_LABELS, WORK_MODE_LABELS } from '@/utils/catalogs'
import { initialsOf } from '@/utils/normalize'

const MAX_SKILLS_SHOWN = 4

export function TalentCard({ profile }: { profile: PublicProfile }) {
  const area = profile.area === 'otro' ? (profile.areaOther ?? AREA_LABELS.otro) : AREA_LABELS[profile.area]
  const extraSkills = profile.skills.length - MAX_SKILLS_SHOWN
  const showAffected = profile.affectedGrupoVazquezPublic && profile.affectedGrupoVazquez === true

  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea component={RouterLink} to={`/talentos/${profile.uid}`} sx={{ height: '100%' }}>
        <CardContent>
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
              <Chip
                size="small"
                label={AVAILABILITY_LABELS[profile.availability]}
                color={profile.availability === 'available' ? 'success' : 'default'}
                variant="outlined"
              />
              <Chip size="small" label={WORK_MODE_LABELS[profile.workMode]} variant="outlined" />
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
      </CardActionArea>
    </Card>
  )
}
