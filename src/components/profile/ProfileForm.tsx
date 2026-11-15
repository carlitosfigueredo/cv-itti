import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import FormControl from '@mui/material/FormControl'
import FormControlLabel from '@mui/material/FormControlLabel'
import FormHelperText from '@mui/material/FormHelperText'
import FormLabel from '@mui/material/FormLabel'
import MenuItem from '@mui/material/MenuItem'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { profileFormSchema, type ProfileFormInput, type ProfileFormOutput } from '@/schemas/profile'
import { AREAS, AVAILABILITIES, COUNTRY_CODES, WORK_MODES } from '@/types/profile'
import {
  AREA_LABELS,
  AVAILABILITY_LABELS,
  COUNTRY_LABELS,
  PY_CITY_SUGGESTIONS,
  WORK_MODE_LABELS,
} from '@/utils/catalogs'
import { SkillsInput } from './SkillsInput'

interface ProfileFormProps {
  defaultValues: Partial<ProfileFormInput>
  onSubmit: (values: ProfileFormOutput) => Promise<void>
  submitError?: string | null
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Card component="section">
      <CardContent>
        <Stack spacing={2.5} sx={{ p: 1 }}>
          <Box>
            <Typography variant="h3" component="h2">{title}</Typography>
            {description && <Typography variant="body2" color="text.secondary">{description}</Typography>}
          </Box>
          {children}
        </Stack>
      </CardContent>
    </Card>
  )
}

const twoCols = { display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }

export function ProfileForm({ defaultValues, onSubmit, submitError }: ProfileFormProps) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormInput, unknown, ProfileFormOutput>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  })

  const area = useWatch({ control, name: 'area' })
  const emailPublic = useWatch({ control, name: 'contactEmailPublic' })
  const phonePublic = useWatch({ control, name: 'contactPhonePublic' })
  const summary = useWatch({ control, name: 'summary' }) ?? ''

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} aria-label="Formulario de perfil">
      <Stack spacing={3}>
        <Alert severity="info" role="note">
          Tu perfil se guarda como privado. Nadie lo ve hasta que decidas publicarlo. Al publicarlo, tu CV también será público.
        </Alert>

        <Section title="Datos básicos">
          <TextField
            label="Nombre público"
            required
            {...register('displayName')}
            error={Boolean(errors.displayName)}
            helperText={errors.displayName?.message ?? 'Así aparecerá en tu perfil.'}
          />
          <TextField
            label="Titular"
            required
            placeholder="Ej: Contador senior"
            {...register('headline')}
            error={Boolean(errors.headline)}
            helperText={errors.headline?.message ?? 'Una línea que te describa (hasta 80 caracteres).'}
          />
          <Box sx={twoCols}>
            <Controller
              name="area"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  required
                  label="Área profesional"
                  {...field}
                  value={field.value ?? ''}
                  error={Boolean(errors.area)}
                  helperText={errors.area?.message}
                >
                  {AREAS.map((code) => (
                    <MenuItem key={code} value={code}>{AREA_LABELS[code]}</MenuItem>
                  ))}
                </TextField>
              )}
            />
            {area === 'otro' && (
              <TextField
                label="Tu área"
                required
                {...register('areaOther')}
                error={Boolean(errors.areaOther)}
                helperText={errors.areaOther?.message}
              />
            )}
          </Box>
          <TextField
            label="Resumen (opcional)"
            multiline
            minRows={4}
            {...register('summary')}
            error={Boolean(errors.summary)}
            helperText={errors.summary?.message ?? `${summary.length}/1000`}
          />
        </Section>

        <Section title="Ubicación">
          <Box sx={twoCols}>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  required
                  label="País"
                  {...field}
                  value={field.value ?? ''}
                  error={Boolean(errors.country)}
                  helperText={errors.country?.message}
                >
                  {COUNTRY_CODES.map((code) => (
                    <MenuItem key={code} value={code}>{COUNTRY_LABELS[code]}</MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Autocomplete
                  freeSolo
                  options={PY_CITY_SUGGESTIONS}
                  value={field.value ?? ''}
                  onChange={(_, next) => field.onChange(next ?? '')}
                  onInputChange={(_, next) => field.onChange(next)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Ciudad"
                      required
                      error={Boolean(errors.city)}
                      helperText={errors.city?.message}
                      slotProps={{ htmlInput: { ...params.inputProps, maxLength: 60 } }}
                    />
                  )}
                />
              )}
            />
          </Box>
        </Section>

        <Section title="Experiencia y disponibilidad">
          <Box sx={twoCols}>
            <TextField
              label="Años de experiencia"
              required
              {...register('experienceYears')}
              error={Boolean(errors.experienceYears)}
              helperText={errors.experienceYears?.message}
              slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 2 } }}
            />
            <Controller
              name="workMode"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  required
                  label="Modalidad de trabajo"
                  {...field}
                  value={field.value ?? ''}
                  error={Boolean(errors.workMode)}
                  helperText={errors.workMode?.message}
                >
                  {WORK_MODES.map((code) => (
                    <MenuItem key={code} value={code}>{WORK_MODE_LABELS[code]}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Box>
          <Controller
            name="availability"
            control={control}
            render={({ field }) => (
              <TextField
                select
                required
                label="Disponibilidad"
                {...field}
                value={field.value ?? ''}
                error={Boolean(errors.availability)}
                helperText={errors.availability?.message}
              >
                {AVAILABILITIES.map((code) => (
                  <MenuItem key={code} value={code}>{AVAILABILITY_LABELS[code]}</MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="skills"
            control={control}
            render={({ field }) => (
              <SkillsInput value={field.value ?? []} onChange={field.onChange} error={errors.skills?.message ?? errors.skills?.root?.message} />
            )}
          />
        </Section>

        <Section title="Enlaces (opcional)" description="Deben empezar con https://">
          <TextField label="LinkedIn" {...register('linkedin')} error={Boolean(errors.linkedin)} helperText={errors.linkedin?.message} />
          <TextField label="GitHub" {...register('github')} error={Boolean(errors.github)} helperText={errors.github?.message} />
          <TextField label="Portfolio o sitio web" {...register('portfolio')} error={Boolean(errors.portfolio)} helperText={errors.portfolio?.message} />
        </Section>

        <Section
          title="Contacto público (opcional)"
          description="Por defecto no se muestra ningún dato de contacto. Marcá cada casilla solo si querés publicarlo."
        >
          <Controller
            name="contactEmailPublic"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value ?? false} onChange={field.onChange} />}
                label="Mostrar mi email en mi perfil público"
              />
            )}
          />
          <TextField
            label="Email público"
            type="email"
            disabled={!emailPublic}
            {...register('publicEmail')}
            error={Boolean(errors.publicEmail)}
            helperText={errors.publicEmail?.message}
          />
          <Controller
            name="contactPhonePublic"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value ?? false} onChange={field.onChange} />}
                label="Mostrar mi teléfono en mi perfil público"
              />
            )}
          />
          <TextField
            label="Teléfono público"
            disabled={!phonePublic}
            placeholder="+595 981 123456"
            {...register('publicPhone')}
            error={Boolean(errors.publicPhone)}
            helperText={errors.publicPhone?.message}
          />
        </Section>

        <Section
          title="Grupo Vázquez"
          description="Esta plataforma está orientada a personas de ITTI y Grupo Vázquez que perdieron su trabajo."
        >
          <Controller
            name="affectedGrupoVazquez"
            control={control}
            render={({ field }) => (
              <FormControl error={Boolean(errors.affectedGrupoVazquez)} required>
                <FormLabel id="affected-label">¿Afectado Grupo Vázquez?</FormLabel>
                <RadioGroup row aria-labelledby="affected-label" {...field} value={field.value ?? ''}>
                  <FormControlLabel value="yes" control={<Radio />} label="Sí" />
                  <FormControlLabel value="no" control={<Radio />} label="No" />
                </RadioGroup>
                <FormHelperText>{errors.affectedGrupoVazquez?.message ?? 'Tu respuesta es privada por defecto.'}</FormHelperText>
              </FormControl>
            )}
          />
          <Controller
            name="affectedGrupoVazquezPublic"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox checked={field.value ?? false} onChange={field.onChange} />}
                label="Mostrar esta respuesta en mi perfil público. Entiendo que revela información laboral personal."
              />
            )}
          />
        </Section>

        {submitError && <Alert severity="error">{submitError}</Alert>}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            Guardar perfil
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
