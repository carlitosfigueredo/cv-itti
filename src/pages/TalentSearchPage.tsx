import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageContainer } from '@/components/common/PageContainer'
import { DirectoryFilters } from '@/components/search/DirectoryFilters'
import { TalentResults } from '@/components/search/TalentResults'
import { filtersToParams, parseFilters } from '@/services/search.filters'
import type { DirectoryFilters as Filters } from '@/types/search'

export default function TalentSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => parseFilters(searchParams), [searchParams])
  // Cambia con cada busqueda: reinicia el formulario y los resultados.
  const searchKey = filtersToParams(filters).toString()

  const apply = useCallback((next: Filters) => setSearchParams(filtersToParams(next)), [setSearchParams])
  const clear = useCallback(() => setSearchParams(new URLSearchParams()), [setSearchParams])

  return (
    <PageContainer title="Talentos">
      <Stack spacing={3}>
        <Typography color="text.secondary">
          Profesionales que decidieron publicar su perfil. Filtrá por área, ubicación, experiencia y más.
        </Typography>
        <DirectoryFilters key={searchKey} filters={filters} onApply={apply} />
        <TalentResults key={searchKey} filters={filters} onClear={clear} />
      </Stack>
    </PageContainer>
  )
}
