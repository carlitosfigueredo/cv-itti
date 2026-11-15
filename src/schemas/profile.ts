import { z } from 'zod'
import { AREAS, AVAILABILITIES, COUNTRY_CODES, MAX_SKILLS, WORK_MODES } from '@/types/profile'

const optionalHttpsUrl = z
  .string()
  .trim()
  .max(200, 'Maximo 200 caracteres')
  .refine((v) => v === '' || /^https:\/\/[^\s]+$/.test(v), 'Debe ser un enlace que empiece con https://')

export const profileFormSchema = z
  .object({
    displayName: z.string().trim().min(2, 'Minimo 2 caracteres').max(80, 'Maximo 80 caracteres'),
    headline: z.string().trim().min(3, 'Minimo 3 caracteres').max(80, 'Maximo 80 caracteres'),
    area: z.enum(AREAS, { error: 'Selecciona un area' }),
    areaOther: z.string().trim().max(40, 'Maximo 40 caracteres'),
    country: z.enum(COUNTRY_CODES, { error: 'Selecciona un pais' }),
    city: z.string().trim().min(2, 'Minimo 2 caracteres').max(60, 'Maximo 60 caracteres'),
    summary: z.string().trim().max(1000, 'Maximo 1000 caracteres'),
    experienceYears: z
      .string()
      .trim()
      .regex(/^\d{1,2}$/, 'Ingresa un numero entero entre 0 y 50')
      .refine((v) => Number(v) <= 50, 'Ingresa un numero entero entre 0 y 50'),
    skills: z
      .array(z.string().trim().min(1).max(40, 'Cada habilidad admite hasta 40 caracteres'))
      .max(MAX_SKILLS, `Maximo ${MAX_SKILLS} habilidades`),
    workMode: z.enum(WORK_MODES, { error: 'Selecciona una modalidad' }),
    availability: z.enum(AVAILABILITIES, { error: 'Selecciona tu disponibilidad' }),
    linkedin: optionalHttpsUrl,
    github: optionalHttpsUrl,
    portfolio: optionalHttpsUrl,
    contactEmailPublic: z.boolean(),
    publicEmail: z.string().trim().max(120, 'Maximo 120 caracteres'),
    contactPhonePublic: z.boolean(),
    publicPhone: z.string().trim().max(20, 'Maximo 20 caracteres'),
    affectedGrupoVazquez: z.enum(['yes', 'no'], { error: 'Responde esta pregunta' }),
    affectedGrupoVazquezPublic: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.area === 'otro' && v.areaOther.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['areaOther'], message: 'Escribe tu area (minimo 2 caracteres)' })
    }
    if (v.contactEmailPublic && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.publicEmail)) {
      ctx.addIssue({ code: 'custom', path: ['publicEmail'], message: 'Ingresa un email valido para publicarlo' })
    }
    if (v.contactPhonePublic && !/^\+?[0-9 ()-]{6,20}$/.test(v.publicPhone)) {
      ctx.addIssue({ code: 'custom', path: ['publicPhone'], message: 'Ingresa un telefono valido (6 a 20 digitos)' })
    }
  })

export type ProfileFormInput = z.input<typeof profileFormSchema>
export type ProfileFormOutput = z.output<typeof profileFormSchema>
