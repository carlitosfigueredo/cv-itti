// Datos del responsable de la plataforma para los textos legales. Se configuran por
// ambiente (.env) para no fijarlos en el codigo. Si faltan, las paginas legales
// muestran un aviso de borrador.
const clean = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null)

export const legalConfig = {
  owner: clean(import.meta.env.VITE_LEGAL_OWNER),
  contactEmail: clean(import.meta.env.VITE_LEGAL_CONTACT_EMAIL),
  /** Fecha de la ultima actualizacion de los textos legales. */
  updatedAt: '15/11/2026',
}

export const legalComplete = Boolean(legalConfig.owner && legalConfig.contactEmail)

export const LEGAL_LINKS = [
  { to: '/legal/terminos', label: 'Términos y condiciones' },
  { to: '/legal/privacidad', label: 'Privacidad y datos' },
  { to: '/legal/responsabilidad', label: 'Descargo de responsabilidad' },
] as const
