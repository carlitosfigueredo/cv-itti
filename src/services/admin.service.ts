import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  type QueryConstraint,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { httpsCallable } from 'firebase/functions'
import { getFirebase } from '@/firebase/config'
import type { AdminStats, AdminUserRow, AuditRow, ModerateAction, ReportRow } from '@/types/admin'
import type { PublicProfile } from '@/types/profile'

export const ADMIN_PAGE_SIZE = 25

const count = async (...args: Parameters<typeof query>) => (await getCountFromServer(query(...args))).data().count

// Estadisticas con consultas de agregacion: cada conteo se cobra como lecturas
// por cada 1000 documentos contados, no por documento leido.
export async function getAdminStats(): Promise<AdminStats> {
  const { db } = getFirebase()
  const users = collection(db, 'users')
  const profiles = collection(db, 'publicProfiles')

  const [totalUsers, suspendedUsers, affectedYes, affectedNo, totalProfiles, publishedProfiles, profilesWithCv, openReports] =
    await Promise.all([
      count(users),
      count(users, where('accountStatus', '==', 'suspended')),
      count(users, where('affectedGrupoVazquez', '==', true)),
      count(users, where('affectedGrupoVazquez', '==', false)),
      count(profiles),
      count(profiles, where('isPublic', '==', true)),
      count(profiles, where('cvPath', '>', '')),
      count(collection(db, 'reports'), where('status', '==', 'open')),
    ])

  return {
    totalUsers,
    suspendedUsers,
    affectedYes,
    affectedNo,
    affectedUnanswered: Math.max(totalUsers - affectedYes - affectedNo, 0),
    totalProfiles,
    publishedProfiles,
    profilesWithCv,
    openReports,
  }
}

export type AffectedFilter = 'all' | 'yes' | 'no' | 'unanswered'
export type StatusFilter = 'all' | 'active' | 'suspended'

export interface UserPage {
  rows: AdminUserRow[]
  cursor: QueryDocumentSnapshot | null
  hasMore: boolean
}

export async function listUsers(
  filters: { affected: AffectedFilter; status: StatusFilter },
  cursor: QueryDocumentSnapshot | null = null,
): Promise<UserPage> {
  const constraints: QueryConstraint[] = []
  if (filters.affected === 'yes') constraints.push(where('affectedGrupoVazquez', '==', true))
  if (filters.affected === 'no') constraints.push(where('affectedGrupoVazquez', '==', false))
  if (filters.affected === 'unanswered') constraints.push(where('affectedGrupoVazquez', '==', null))
  if (filters.status !== 'all') constraints.push(where('accountStatus', '==', filters.status))
  constraints.push(orderBy('createdAt', 'desc'))
  if (cursor) constraints.push(startAfter(cursor))
  constraints.push(limit(ADMIN_PAGE_SIZE + 1))

  const snap = await getDocs(query(collection(getFirebase().db, 'users'), ...constraints))
  const hasMore = snap.docs.length > ADMIN_PAGE_SIZE
  const docs = hasMore ? snap.docs.slice(0, ADMIN_PAGE_SIZE) : snap.docs
  return {
    rows: docs.map((d) => d.data() as AdminUserRow),
    cursor: docs[docs.length - 1] ?? null,
    hasMore,
  }
}

// Un admin puede leer cualquier perfil (tambien los privados) para revisarlo.
export async function getProfileForReview(uid: string): Promise<PublicProfile | null> {
  const snap = await getDoc(doc(getFirebase().db, 'publicProfiles', uid))
  return snap.exists() ? (snap.data() as PublicProfile) : null
}

export async function listReports(status: 'open' | 'closed'): Promise<ReportRow[]> {
  const statuses = status === 'open' ? ['open'] : ['resolved', 'dismissed']
  const snap = await getDocs(
    query(collection(getFirebase().db, 'reports'), where('status', 'in', statuses), orderBy('createdAt', 'desc'), limit(50)),
  )
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ReportRow, 'id'>) }))
}

export async function listAudit(): Promise<AuditRow[]> {
  const snap = await getDocs(query(collection(getFirebase().db, 'adminAudit'), orderBy('createdAt', 'desc'), limit(50)))
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AuditRow, 'id'>) }))
}

// Las acciones pasan por Cloud Functions: el servidor verifica el claim admin.
export async function moderateAccount(targetUid: string, action: ModerateAction, reason?: string): Promise<void> {
  const call = httpsCallable(getFirebase().functions, 'moderateAccount')
  await call({ targetUid, action, ...(reason ? { reason } : {}) })
}

export async function resolveReport(reportId: string, resolution: 'resolved' | 'dismissed'): Promise<void> {
  const call = httpsCallable(getFirebase().functions, 'resolveReportCall')
  await call({ reportId, resolution })
}

export async function deleteAccountAsAdmin(targetUid: string, reason?: string): Promise<void> {
  const call = httpsCallable(getFirebase().functions, 'deleteAccount')
  await call({ targetUid, ...(reason ? { reason } : {}) })
}
