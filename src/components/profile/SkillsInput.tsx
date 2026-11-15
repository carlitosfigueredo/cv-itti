import Autocomplete from '@mui/material/Autocomplete'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import { MAX_SKILLS } from '@/types/profile'
import { SKILL_SUGGESTIONS } from '@/utils/catalogs'

interface SkillsInputProps {
  value: string[]
  onChange: (value: string[]) => void
  error?: string
}

export function SkillsInput({ value, onChange, error }: SkillsInputProps) {
  return (
    <Autocomplete
      multiple
      freeSolo
      options={SKILL_SUGGESTIONS}
      value={value}
      onChange={(_, next) => onChange(next.map((s) => s.trim()).filter(Boolean).slice(0, MAX_SKILLS))}
      renderTags={(tags, getTagProps) =>
        tags.map((tag, index) => {
          const { key, ...tagProps } = getTagProps({ index })
          return <Chip key={key} label={tag} size="small" {...tagProps} />
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Habilidades"
          error={Boolean(error)}
          helperText={error ?? `Escribe y presiona Enter. Maximo ${MAX_SKILLS}. ${value.length}/${MAX_SKILLS}`}
          slotProps={{ htmlInput: { ...params.inputProps, maxLength: 40 } }}
        />
      )}
    />
  )
}
