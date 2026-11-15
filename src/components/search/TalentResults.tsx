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

const grid = { display: 'grid', gap: 2, gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' } }

interface TalentResultsProps {
  filters: DirectoryFilters
  hasFilters?: boolean
  onClear: () => void
}

export function TalentResults({ filters, hasFilters = true, onClear }: TalentResultsProps) {
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
    return hasFilters ? (
      <EmptyState
        title="Nadie coincide con estos filtros"
        description="Probá con otra palabra o sacá algún filtro."
        action={<Button variant="outlined" onClick={onClear}>Limpiar filtros</Button>}
      />
    ) : (
      <EmptyState
        title="Todavía no hay perfiles publicados"
        description="Sé de las primeras personas en sumarse: tocá “Cargar mi CV” arriba."
      />
    )
  }

  return (
    <Stack spacing={3}>
      <Typography role="status" variant="body2" color="text.secondary">
        {state.hasMore ? 'Mostrando los primeros ' : ''}
        {state.profiles.length} {state.profiles.length === 1 ? 'perfil' : 'perfiles'}
      </Typography>
      <Box component="ul" sx={{ ...grid, listStyle: 'none', p: 0, m: 0 }}>
        {state.profiles.map((profile) => (
          <Box component="li" key={profile.uid} sx={{ minWidth: 0 }}>
            <TalentCard profile={profile} />
          </Box>
        ))}
      </Box>
      {state.moreError && <ErrorState message="No se pudieron cargar más perfiles." onRetry={loadMore} />}
      {state.hasMore && (
        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={loadMore}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
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
