import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ErrorState } from '@/components/common/ErrorState'
import { useAsync } from '@/hooks/useAsync'
import { getAdminStats } from '@/services/admin.service'

const grid = { display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' } }

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h3" component="p">{value.toLocaleString('es-PY')}</Typography>
        {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
      </CardContent>
    </Card>
  )
}

export function StatsPanel() {
  const { state, reload } = useAsync(getAdminStats)

  if (state.status === 'loading') {
    return (
      <Box sx={grid} role="status" aria-label="Cargando estadísticas">
        {Array.from({ length: 8 }, (_, i) => <Skeleton key={i} variant="rounded" height={104} />)}
      </Box>
    )
  }
  if (state.status === 'error') return <ErrorState message="No se pudieron cargar las estadísticas." onRetry={reload} />

  const s = state.data
  const pct = (n: number) => (s.totalUsers ? `${Math.round((n / s.totalUsers) * 100)}% del total` : undefined)

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" component="h2" gutterBottom>Plataforma</Typography>
        <Box sx={grid}>
          <Stat label="Usuarios registrados" value={s.totalUsers} />
          <Stat label="Perfiles creados" value={s.totalProfiles} />
          <Stat label="Perfiles publicados" value={s.publishedProfiles} />
          <Stat label="Perfiles con CV" value={s.profilesWithCv} />
          <Stat label="Reportes abiertos" value={s.openReports} />
          <Stat label="Cuentas suspendidas" value={s.suspendedUsers} />
        </Box>
      </Box>
      <Box>
        <Typography variant="h3" component="h2" gutterBottom>Afectados por Grupo Vázquez</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Respuesta privada de cada persona. Incluye a quienes no eligieron mostrarla públicamente.
        </Typography>
        <Box sx={grid}>
          <Stat label="Sí" value={s.affectedYes} hint={pct(s.affectedYes)} />
          <Stat label="No" value={s.affectedNo} hint={pct(s.affectedNo)} />
          <Stat label="Sin responder" value={s.affectedUnanswered} hint={pct(s.affectedUnanswered)} />
        </Box>
      </Box>
    </Stack>
  )
}
