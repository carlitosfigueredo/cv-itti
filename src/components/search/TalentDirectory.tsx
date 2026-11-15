import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { filtersToParams, parseFilters } from '@/services/search.filters'
import type { DirectoryFilters as Filters } from '@/types/search'
import { DirectoryFilters, type ApplyOptions } from './DirectoryFilters'
import { TalentResults } from './TalentResults'

// Directorio con filtros guardados en la URL (se puede compartir el enlace).
// Los filtros se aplican al instante; la caja de texto espera a que se deje de escribir.
export function TalentDirectory() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  // Cambia con cada busqueda: reinicia los resultados (no los filtros, para no perder el foco).
  const searchKey = filtersToParams(filters).toString()

  const apply = useCallback(
    (next: Filters, options?: ApplyOptions) => setSearchParams(filtersToParams(next), { replace: options?.replace }),
    [setSearchParams],
  )
  const clear = useCallback(() => setSearchParams(new URLSearchParams()), [setSearchParams])

  return (
    <Stack spacing={{ xs: 2.5, sm: 3 }}>
      <div>
        <Typography variant="h1" sx={{ mb: 1, maxWidth: 820 }}>
          Encontrá el mejor talento de{' '}
          <Box component="span" sx={{ color: 'primary.main' }}>ITTI y Grupo Vázquez</Box>
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 720, fontSize: { sm: '1.05rem' } }}>
          Buscá por puesto o habilidad, filtrá por área y experiencia, y descargá el CV de cada profesional.
        </Typography>
      </div>
      <DirectoryFilters filters={filters} onApply={apply} />
      <TalentResults key={searchKey} filters={filters} hasFilters={searchKey !== ''} onClear={clear} />
    </Stack>
  )
}
