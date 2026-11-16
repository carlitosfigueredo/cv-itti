import { z } from 'zod'
import { AREAS, AVAILABILITIES, COUNTRY_CODES, MAX_SKILLS, WORK_MODES } from '@/types/profile'

const optionalHttpsUrl = z
  .string()
  .trim()
  .max(200, 'Máximo 200 caracteres')
  .refine((v) => v === '' || /^https:\/\/[^\s]+$/.test(v), 'Debe ser un enlace que empiece con https://')

export const profileFormSchema = z
  .object({
    displayName: z.string().trim().min(2, 'Mínimo 2 caracteres').max(80, 'Máximo 80 caracteres'),
    headline: z.string().trim().min(3, 'Mínimo 3 caracteres').max(80, 'Máximo 80 caracteres'),
    area: z.enum(AREAS, { error: 'Seleccioná un área' }),
    areaOther: z.string().trim().max(40, 'Máximo 40 caracteres'),
    country: z.enum(COUNTRY_CODES, { error: 'Seleccioná un país' }),
    city: z.string().trim().min(2, 'Mínimo 2 caracteres').max(60, 'Máximo 60 caracteres'),
    summary: z.string().trim().max(1000, 'Máximo 1000 caracteres'),
    experienceYears: z
      .string()
      .trim()
      .regex(/^\d{1,2}$/, 'Ingresá un número entero entre 0 y 50')
      .refine((v) => Number(v) <= 50, 'Ingresá un número entero entre 0 y 50'),
    skills: z
      .array(z.string().trim().min(1).max(40, 'Cada habilidad admite hasta 40 caracteres'))
      .max(MAX_SKILLS, `Máximo ${MAX_SKILLS} habilidades`),
    workMode: z.enum(WORK_MODES, { error: 'Seleccioná una modalidad' }),
    availability: z.enum(AVAILABILITIES, { error: 'Seleccioná tu disponibilidad' }),
    linkedin: optionalHttpsUrl,
    github: optionalHttpsUrl,
    portfolio: optionalHttpsUrl,
    contactEmailPublic: z.boolean(),
    publicEmail: z.string().trim().max(120, 'Máximo 120 caracteres'),
    contactPhonePublic: z.boolean(),
    publicPhone: z.string().trim().max(20, 'Máximo 20 caracteres'),
    affectedGrupoVazquez: z.enum(['yes', 'no'], { error: 'Respondé esta pregunta' }),
    affectedGrupoVazquezPublic: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.area === 'otro' && v.areaOther.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['areaOther'], message: 'Escribí tu área (mínimo 2 caracteres)' })
    }
    if (v.contactEmailPublic && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.publicEmail)) {
      ctx.addIssue({ code: 'custom', path: ['publicEmail'], message: 'Ingresá un email válido para publicarlo' })
    }
    if (v.contactPhonePublic && !/^\+?[0-9 ()-]{6,20}$/.test(v.publicPhone)) {
      ctx.addIssue({ code: 'custom', path: ['publicPhone'], message: 'Ingresá un teléfono válido (6 a 20 dígitos)' })
    }
  })

export type ProfileFormInput = z.input<typeof profileFormSchema>
export type ProfileFormOutput = z.output<typeof profileFormSchema>
