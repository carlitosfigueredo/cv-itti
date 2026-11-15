import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { filtersToParams, parseFilters } from '@/services/search.filters'
import type { DirectoryFilters as Filters } from '@/types/search'
import { DirectoryFilters } from './DirectoryFilters'
import { TalentResults } from './TalentResults'

// Directorio con filtros guardados en la URL (se puede compartir el enlace).
export function TalentDirectory() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  // Cambia con cada busqueda: reinicia el formulario y los resultados.
  const searchKey = filtersToParams(filters).toString()
  const hasFilters = searchKey !== ''

  const apply = useCallback((next: Filters) => setSearchParams(filtersToParams(next)), [setSearchParams])
  const clear = useCallback(() => setSearchParams(new URLSearchParams()), [setSearchParams])

  return (
    <Stack component="section" aria-labelledby="talentos-titulo" spacing={2.5}>
      <div>
        <Typography id="talentos-titulo" variant="h2">Talentos</Typography>
        <Typography color="text.secondary">
          Personas que publicaron su perfil. Filtrá por área, ciudad, experiencia y más.
        </Typography>
      </div>
      <DirectoryFilters key={searchKey} filters={filters} onApply={apply} />
      <TalentResults key={`r-${searchKey}`} filters={filters} hasFilters={hasFilters} onClear={clear} />
    </Stack>
  )
}
