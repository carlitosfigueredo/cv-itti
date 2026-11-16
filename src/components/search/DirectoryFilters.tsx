import CancelIcon from '@mui/icons-material/Cancel'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import TuneIcon from '@mui/icons-material/Tune'
import Autocomplete from '@mui/material/Autocomplete'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'
import { brand } from '@/theme/theme'
import { searchUsesOnlyFirstWord } from '@/services/search.filters'
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
  WORK_MODE_LABELS,
} from '@/utils/catalogs'

export interface ApplyOptions {
  /** Reemplaza la entrada del historial (mientras se escribe) en vez de agregar una nueva. */
  replace?: boolean
}

interface DirectoryFiltersProps {
  filters: Filters
  onApply: (filters: Filters, options?: ApplyOptions) => void
}

const ALL = ''
const WORK_MODE_OPTIONS = WORK_MODES.filter((m) => m !== 'any')
const SEARCH_DELAY_MS = 450
// Filtros que van en el panel "Más filtros" (el area tambien, para celular).
const PANEL_KEYS: (keyof Filters)[] = ['country', 'city', 'experienceBand', 'workMode', 'availability']

function withValue<K extends keyof Filters>(filters: Filters, key: K, value: Filters[K] | undefined): Filters {
  const next = { ...filters }
  if (value === undefined || value === '') delete next[key]
  else next[key] = value
  return next
}

// ---------------------------------------------------------------- caja de busqueda
function SearchBox({ value, onCommit, compact }: { value: string; onCommit: (q: string) => void; compact: boolean }) {
  const [text, setText] = useState(value)
  const [prevValue, setPrevValue] = useState(value)
  const [lastCommitted, setLastCommitted] = useState(value)

  // Si el valor cambia desde afuera (por ejemplo "Limpiar todo"), se refleja en la caja.
  if (value !== prevValue) {
    setPrevValue(value)
    if (value !== lastCommitted) setText(value)
  }

  // Se busca medio segundo despues de dejar de escribir: evita una consulta por letra.
  useEffect(() => {
    if (text.trim() === value.trim()) return
    const timer = setTimeout(() => {
      setLastCommitted(text.trim())
      onCommit(text.trim())
    }, SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [text, value, onCommit])

  const firstWord = text.trim().split(/\s+/)[0] ?? ''

  return (
    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
      <TextField
        fullWidth
        value={text}
        sx={{ '& input::-webkit-search-cancel-button': { display: 'none' } }}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setLastCommitted(text.trim())
            onCommit(text.trim())
          }
        }}
        placeholder={compact ? 'Puesto, habilidad, ciudad…' : 'Buscá por puesto, habilidad, ciudad o nombre'}
        slotProps={{
          htmlInput: { maxLength: 60, enterKeyHint: 'search', 'aria-label': 'Buscar talentos', type: 'search' },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon aria-hidden />
              </InputAdornment>
            ),
            endAdornment: text ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  aria-label="Borrar búsqueda"
                  onClick={() => {
                    setText('')
                    setLastCommitted('')
                    onCommit('')
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
            sx: { borderRadius: 999, bgcolor: 'background.paper' },
          },
        }}
      />
      {searchUsesOnlyFirstWord(text) && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75, ml: 2 }}>
          Buscamos por “{firstWord}”. Por ahora se busca una palabra a la vez; usá los filtros para afinar.
        </Typography>
      )}
    </Box>
  )
}

// ---------------------------------------------------------------- campos del panel
function FilterFields({ draft, onChange }: { draft: Filters; onChange: (next: Filters) => void }) {
  const set = <K extends keyof Filters>(key: K, value: Filters[K] | undefined) => onChange(withValue(draft, key, value))
  return (
    <Stack spacing={2.5}>
      <TextField select label="Área" value={draft.area ?? ALL} onChange={(e) => set('area', (e.target.value || undefined) as Area | undefined)}>
        <MenuItem value={ALL}>Todas</MenuItem>
        {AREAS.map((code) => (
          <MenuItem key={code} value={code}>{code === 'otro' ? 'Otras áreas' : AREA_LABELS[code]}</MenuItem>
        ))}
      </TextField>
      <TextField select label="País" value={draft.country ?? ALL} onChange={(e) => set('country', (e.target.value || undefined) as CountryCode | undefined)}>
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
      <TextField select label="Modalidad" value={draft.workMode ?? ALL} onChange={(e) => set('workMode', (e.target.value || undefined) as Filters['workMode'])}>
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
    </Stack>
  )
}

// ---------------------------------------------------------------- chips de filtros activos
function activeChips(filters: Filters): { key: keyof Filters; label: string }[] {
  const chips: { key: keyof Filters; label: string }[] = []
  if (filters.q) chips.push({ key: 'q', label: `“${filters.q}”` })
  if (filters.area) chips.push({ key: 'area', label: filters.area === 'otro' ? 'Otras áreas' : AREA_LABELS[filters.area] })
  if (filters.country) chips.push({ key: 'country', label: COUNTRY_LABELS[filters.country] })
  if (filters.city) chips.push({ key: 'city', label: filters.city })
  if (filters.experienceBand) chips.push({ key: 'experienceBand', label: EXPERIENCE_BAND_LABELS[filters.experienceBand] })
  // "Remoto" y "Disponibles" ya se ven como filtros rapidos activos: no se repiten.
  if (filters.workMode && filters.workMode !== 'remote') chips.push({ key: 'workMode', label: WORK_MODE_LABELS[filters.workMode] })
  if (filters.availability && filters.availability !== 'available') {
    chips.push({ key: 'availability', label: AVAILABILITY_LABELS[filters.availability] })
  }
  return chips
}

// ---------------------------------------------------------------- filtro rapido
// Activo: negro con texto blanco en tema claro, verde con texto negro en oscuro (alto contraste).
function QuickChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <Chip
      label={label}
      clickable
      onClick={onClick}
      variant={active ? 'filled' : 'outlined'}
      aria-pressed={active}
      icon={active ? <CheckIcon /> : undefined}
      sx={(theme) => ({
        bgcolor: 'background.paper',
        ...(active && {
          bgcolor: brand.ink,
          color: '#ffffff',
          '& .MuiChip-icon': { color: 'inherit' },
          '&:hover, &.Mui-focusVisible': { bgcolor: brand.night },
          ...theme.applyStyles('dark', {
            bgcolor: brand.green,
            color: brand.ink,
            '&:hover, &.Mui-focusVisible': { bgcolor: brand.greenDark },
          }),
        }),
      })}
    />
  )
}

// ---------------------------------------------------------------- componente principal
export function DirectoryFilters({ filters, onApply }: DirectoryFiltersProps) {
  const isMobile = useIsMobile()
  const [panelOpen, setPanelOpen] = useState(false)
  const [draft, setDraft] = useState<Filters>(filters)

  // Cuenta solo lo elegido en el panel: "Remoto" y "Disponibles" ya se ven como filtros rapidos.
  const panelCount =
    PANEL_KEYS.filter((k) => {
      if (filters[k] === undefined) return false
      if (k === 'workMode' && filters.workMode === 'remote') return false
      if (k === 'availability' && filters.availability === 'available') return false
      return true
    }).length + (isMobile && filters.area ? 1 : 0)
  const chips = activeChips(filters)

  const openPanel = () => {
    setDraft(filters)
    setPanelOpen(true)
  }
  const applyPanel = () => {
    setPanelOpen(false)
    onApply({ ...draft, ...(filters.q ? { q: filters.q } : {}) })
  }
  const toggle = <K extends 'availability' | 'workMode'>(key: K, value: NonNullable<Filters[K]>) =>
    onApply(withValue(filters, key, filters[key] === value ? undefined : value))

  return (
    <Stack component="section" aria-label="Filtros de búsqueda" spacing={1.5}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
        <SearchBox compact={isMobile} value={filters.q ?? ''} onCommit={(q) => onApply(withValue(filters, 'q', q || undefined), { replace: true })} />

        {!isMobile && (
          <TextField
            select
            label="Área"
            value={filters.area ?? ALL}
            onChange={(e) => onApply(withValue(filters, 'area', (e.target.value || undefined) as Area | undefined))}
            sx={{ width: 220, flexShrink: 0 }}
            slotProps={{ input: { sx: { borderRadius: 999, bgcolor: 'background.paper' } } }}
          >
            <MenuItem value={ALL}>Todas las áreas</MenuItem>
            {AREAS.map((code) => (
              <MenuItem key={code} value={code}>{code === 'otro' ? 'Otras áreas' : AREA_LABELS[code]}</MenuItem>
            ))}
          </TextField>
        )}

        {isMobile ? (
          <IconButton
            onClick={openPanel}
            aria-label={panelCount ? `Más filtros (${panelCount} activos)` : 'Más filtros'}
            sx={{ border: 1, borderColor: 'divider', bgcolor: 'background.paper', width: 56, height: 56, flexShrink: 0 }}
          >
            <Badge badgeContent={panelCount} color="primary">
              <TuneIcon />
            </Badge>
          </IconButton>
        ) : (
          <Button
            onClick={openPanel}
            variant="outlined"
            color="inherit"
            startIcon={<TuneIcon />}
            sx={{ height: 56, flexShrink: 0, borderColor: 'divider', bgcolor: 'background.paper' }}
          >
            Más filtros{panelCount ? ` (${panelCount})` : ''}
          </Button>
        )}
      </Stack>

      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        <QuickChip label="Disponibles" active={filters.availability === 'available'} onClick={() => toggle('availability', 'available')} />
        <QuickChip label="Remoto" active={filters.workMode === 'remote'} onClick={() => toggle('workMode', 'remote')} />
        {chips.length > 0 && (
          <>
            <Box aria-hidden sx={{ width: '1px', height: 20, bgcolor: 'divider', mx: 0.5 }} />
            {chips.map((chip) => (
              <Chip
                key={chip.key}
                label={chip.label}
                size="small"
                onDelete={() => onApply(withValue(filters, chip.key, undefined))}
                deleteIcon={<CancelIcon titleAccess={`Quitar filtro ${chip.label}`} />}
              />
            ))}
            <Button size="small" color="inherit" onClick={() => onApply({})} sx={{ textDecoration: 'underline' }}>
              Limpiar todo
            </Button>
          </>
        )}
      </Stack>

      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        slotProps={{
          paper: {
            'aria-labelledby': 'mas-filtros-titulo',
            sx: isMobile
              ? { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '90dvh' }
              : { width: 380, maxWidth: '100vw' },
          },
        }}
      >
        <Stack sx={{ height: '100%' }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2.5, pb: 1 }}>
            <Typography id="mas-filtros-titulo" variant="h3" component="h2">Filtros</Typography>
            <IconButton onClick={() => setPanelOpen(false)} aria-label="Cerrar filtros">
              <CloseIcon />
            </IconButton>
          </Stack>
          <Box sx={{ px: 3, py: 2, overflowY: 'auto', flexGrow: 1 }}>
            <FilterFields draft={draft} onChange={setDraft} />
          </Box>
          <Stack direction="row" spacing={1.5} sx={{ p: 2.5, borderTop: 1, borderColor: 'divider' }}>
            <Button color="inherit" onClick={() => setDraft({})} sx={{ flexShrink: 0 }}>Limpiar</Button>
            <Button variant="contained" fullWidth onClick={applyPanel}>Ver resultados</Button>
          </Stack>
        </Stack>
      </Drawer>
    </Stack>
  )
}
