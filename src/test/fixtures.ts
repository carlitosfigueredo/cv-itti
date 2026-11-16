import { Timestamp } from 'firebase/firestore/lite'
import type { PublicProfile } from '@/types/profile'

export function makeProfile(extra: Partial<PublicProfile> = {}): PublicProfile {
  return {
    uid: 'u1',
    displayName: 'Ana Lopez',
    headline: 'Contadora senior',
    area: 'finanzas',
    country: 'PY',
    city: 'Asunción',
    cityNormalized: 'asuncion',
    experienceYears: 7,
    experienceBand: '5-9',
    skills: ['Excel', 'SQL'],
    skillsNormalized: ['excel', 'sql'],
    workMode: 'hybrid',
    availability: 'available',
    contactEmailPublic: false,
    contactPhonePublic: false,
    affectedGrupoVazquezPublic: false,
    isPublic: true,
    createdAt: Timestamp.fromDate(new Date('2026-01-01')),
    updatedAt: Timestamp.fromDate(new Date('2026-01-02')),
    ...extra,
  }
}
