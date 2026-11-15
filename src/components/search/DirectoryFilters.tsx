import SearchIcon from '@mui/icons-material/Search'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import { useState, type FormEvent } from 'react'
import {
  AREAS,
  AVAILABILITIES,
  COUNTRY_CODES,
  EXPERIENCE_BANDS,
  WORK_MODES,
  type Area,
  type Availability,
  type CountryCode,
  type ExperienceBand,
} from '@/types/profile'
import type { DirectoryFilters as Filters } from '@/types/search'
import {
  AREA_LABELS,
  AVAILABILITY_LABELS,
  COUNTRY_LABELS,
  EXPERIENCE_BAND_LABELS,
  PY_CITY_SUGGESTIONS,
  SKILL_SUGGESTIONS,
  WORK_MODE_LABELS,
} from '@/utils/catalogs'

interface DirectoryFiltersProps {
  filters: Filters
  onApply: (filters: Filters) => void
}

const ALL = ''
const WORK_MODE_OPTIONS = WORK_MODES.filter((m) => m !== 'any')

export function DirectoryFilters({ filters, onApply }: DirectoryFiltersProps) {
  // Estado local: la busqueda se aplica al enviar el formulario (boton o Enter).
  const [draft, setDraft] = useState<Filters>(filters)

  const set = <K extends keyof Filters>(key: K, value: Filters[K] | undefined) =>
    setDraft((current) => {
      const next = { ...current }
      if (value === undefined || value === '') delete next[key]
      else next[key] = value
      return next
    })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    onApply(draft)
  }

  function handleClear() {
    setDraft({})
    onApply({})
  }

  return (
    <Card component="section" aria-label="Filtros de búsqueda">
      <CardContent>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' } }}>
              <TextField
                select
                label="Área"
                value={draft.area ?? ALL}
                onChange={(e) => set('area', (e.target.value || undefined) as Area | undefined)}
              >
                <MenuItem value={ALL}>Todas</MenuItem>
                {AREAS.map((code) => (
                  <MenuItem key={code} value={code}>{AREA_LABELS[code]}</MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="País"
                value={draft.country ?? ALL}
                onChange={(e) => set('country', (e.target.value || undefined) as CountryCode | undefined)}
              >
                <MenuItem value={ALL}>Todos</MenuItem>
                {COUNTRY_CODES.map((code) => (
                  <MenuItem key={code} value={code}>{COUNTRY_LABELS[code]}</MenuItem>
                ))}
              </TextField>

              <Autocomplete
                freeSolo
                options={PY_CITY_SUGGESTIONS}
                inputValue={draft.city ?? ''}
                onInputChange={(_, value) => set('city', value)}
                renderInput={(params) => (
                  <TextField {...params} label="Ciudad" slotProps={{ htmlInput: { ...params.inputProps, maxLength: 60 } }} />
                )}
              />

              <Autocomplete
                freeSolo
                options={SKILL_SUGGESTIONS}
                inputValue={draft.skill ?? ''}
                onInputChange={(_, value) => set('skill', value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Habilidad"
                    helperText="Una a la vez"
                    slotProps={{ htmlInput: { ...params.inputProps, maxLength: 40 } }}
                  />
                )}
              />

              <TextField
                select
                label="Experiencia"
                value={draft.experienceBand ?? ALL}
                onChange={(e) => set('experienceBand', (e.target.value || undefined) as ExperienceBand | undefined)}
              >
                <MenuItem value={ALL}>Cualquiera</MenuItem>
                {EXPERIENCE_BANDS.map((code) => (
                  <MenuItem key={code} value={code}>{EXPERIENCE_BAND_LABELS[code]}</MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Modalidad"
                value={draft.workMode ?? ALL}
                onChange={(e) => set('workMode', (e.target.value || undefined) as Filters['workMode'])}
              >
                <MenuItem value={ALL}>Todas</MenuItem>
                {WORK_MODE_OPTIONS.map((code) => (
                  <MenuItem key={code} value={code}>{WORK_MODE_LABELS[code]}</MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Disponibilidad"
                value={draft.availability ?? ALL}
                onChange={(e) => set('availability', (e.target.value || undefined) as Availability | undefined)}
              >
                <MenuItem value={ALL}>Todas</MenuItem>
                {AVAILABILITIES.map((code) => (
                  <MenuItem key={code} value={code}>{AVAILABILITY_LABELS[code]}</MenuItem>
                ))}
              </TextField>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={draft.affectedGrupoVazquez === true}
                  onChange={(e) => set('affectedGrupoVazquez', e.target.checked ? true : undefined)}
                />
              }
              label="Solo personas afectadas por Grupo Vázquez (que eligieron mostrarlo)"
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button type="submit" variant="contained" startIcon={<SearchIcon />}>Buscar</Button>
              <Button type="button" variant="text" onClick={handleClear}>Limpiar filtros</Button>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}
