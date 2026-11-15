import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { useTalentSearch } from '@/hooks/useTalentSearch'
import type { DirectoryFilters } from '@/types/search'
import { TalentCard } from './TalentCard'

const grid = { display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }

interface TalentResultsProps {
  filters: DirectoryFilters
  onClear: () => void
}

export function TalentResults({ filters, onClear }: TalentResultsProps) {
  const { state, retry, loadMore } = useTalentSearch(filters)

  if (state.status === 'loading') {
    return (
      <Box sx={grid} role="status" aria-label="Cargando resultados">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} variant="rounded" height={190} />
        ))}
      </Box>
    )
  }

  if (state.status === 'error') {
    return <ErrorState message="No se pudieron cargar los talentos." onRetry={retry} />
  }

  if (state.profiles.length === 0) {
    return (
      <EmptyState
        title="No encontramos perfiles"
        description="Probá con menos filtros o con otros valores."
        action={<Button variant="outlined" onClick={onClear}>Limpiar filtros</Button>}
      />
    )
  }

  return (
    <Stack spacing={3}>
      <Typography role="status" color="text.secondary">
        Mostrando {state.profiles.length} {state.profiles.length === 1 ? 'perfil' : 'perfiles'}
        {state.hasMore ? ' (hay más)' : ''}
      </Typography>
      <Box component="ul" sx={{ ...grid, listStyle: 'none', p: 0, m: 0 }}>
        {state.profiles.map((profile) => (
          <li key={profile.uid}>
            <TalentCard profile={profile} />
          </li>
        ))}
      </Box>
      {state.moreError && <ErrorState message="No se pudieron cargar más perfiles." onRetry={loadMore} />}
      {state.hasMore && (
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            onClick={loadMore}
            disabled={state.loadingMore}
            startIcon={state.loadingMore ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            Ver más
          </Button>
        </Box>
      )}
    </Stack>
  )
}
