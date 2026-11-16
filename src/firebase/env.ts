import { z } from 'zod'

const requiredString = (name: string) =>
  z.string({ error: `Falta la variable ${name}` }).trim().min(1, `Falta la variable ${name}`)

const envSchema = z.object({
  VITE_FIREBASE_API_KEY: requiredString('VITE_FIREBASE_API_KEY'),
  VITE_FIREBASE_AUTH_DOMAIN: requiredString('VITE_FIREBASE_AUTH_DOMAIN'),
  VITE_FIREBASE_PROJECT_ID: requiredString('VITE_FIREBASE_PROJECT_ID'),
  VITE_FIREBASE_STORAGE_BUCKET: requiredString('VITE_FIREBASE_STORAGE_BUCKET'),
  VITE_FIREBASE_MESSAGING_SENDER_ID: requiredString('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  VITE_FIREBASE_APP_ID: requiredString('VITE_FIREBASE_APP_ID'),
  VITE_USE_EMULATORS: z.enum(['true', 'false']).optional(),
  VITE_APPCHECK_SITE_KEY: z.string().trim().optional(),
})

export interface FirebaseEnv {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  useEmulators: boolean
  /** Clave de sitio de reCAPTCHA Enterprise para App Check. null = App Check desactivado. */
  appCheckSiteKey: string | null
}

export type FirebaseEnvResult =
  | { ok: true; env: FirebaseEnv }
  | { ok: false; errors: string[] }

// Valida las variables VITE_FIREBASE_* sin lanzar excepciones, para poder
// mostrar un mensaje claro en pantalla cuando falta configuracion.
export function readFirebaseEnv(raw: Record<string, unknown>): FirebaseEnvResult {
  const parsed = envSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((issue) => issue.message) }
  }
  const v = parsed.data
  return {
    ok: true,
    env: {
      apiKey: v.VITE_FIREBASE_API_KEY,
      authDomain: v.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: v.VITE_FIREBASE_PROJECT_ID,
      storageBucket: v.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: v.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: v.VITE_FIREBASE_APP_ID,
      useEmulators: v.VITE_USE_EMULATORS === 'true',
      appCheckSiteKey: v.VITE_APPCHECK_SITE_KEY ? v.VITE_APPCHECK_SITE_KEY : null,
    },
  }
}
