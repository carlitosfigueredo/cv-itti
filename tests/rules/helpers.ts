import { readFileSync } from 'node:fs'
import { initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, serverTimestamp, setDoc, writeBatch, type Firestore } from 'firebase/firestore'

export const PROJECT_ID = 'demo-cv-itti'

export async function createEnv(): Promise<RulesTestEnvironment> {
  return initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
    storage: { rules: readFileSync('storage.rules', 'utf8') },
  })
}

export const baseUser = (uid: string, email = `${uid}@x.com`) => ({
  uid,
  email,
  displayName: 'Test',
  affectedGrupoVazquez: null,
  accountStatus: 'active',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
})

export const baseProfile = (uid: string, extra: Record<string, unknown> = {}) => ({
  uid,
  displayName: 'Ana Lopez',
  headline: 'Contadora',
  area: 'finanzas',
  country: 'PY',
  city: 'Asuncion',
  cityNormalized: 'asuncion',
  experienceYears: 7,
  experienceBand: '5-9',
  skills: ['Excel'],
  skillsNormalized: ['excel'],
  workMode: 'hybrid',
  availability: 'available',
  isPublic: false,
  contactEmailPublic: false,
  contactPhonePublic: false,
  affectedGrupoVazquezPublic: false,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...extra,
})

// Siembra datos saltando las reglas (como lo haria el Admin SDK).
export async function seedUser(env: RulesTestEnvironment, uid: string, extra: Record<string, unknown> = {}) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore() as unknown as Firestore, 'users', uid), { ...baseUser(uid), ...extra })
  })
}

export async function seedProfile(env: RulesTestEnvironment, uid: string, extra: Record<string, unknown> = {}) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore() as unknown as Firestore, 'publicProfiles', uid), baseProfile(uid, extra))
  })
}

// Escritura conjunta como la hace la app: flag privado + perfil en un batch.
export async function saveProfileBatch(
  db: Firestore,
  uid: string,
  affected: boolean,
  profile: Record<string, unknown>,
) {
  const batch = writeBatch(db)
  batch.update(doc(db, 'users', uid), { affectedGrupoVazquez: affected, updatedAt: serverTimestamp() })
  batch.set(doc(db, 'publicProfiles', uid), profile)
  await batch.commit()
}
