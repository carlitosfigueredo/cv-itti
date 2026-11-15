import type { Timestamp } from 'firebase/firestore'
import type { ReportReason } from '@/services/report.service'

export type ModerateAction = 'unpublish' | 'removeCv' | 'suspend' | 'unsuspend'

export interface AdminStats {
  totalUsers: number
  suspendedUsers: number
  affectedYes: number
  affectedNo: number
  affectedUnanswered: number
  totalProfiles: number
  publishedProfiles: number
  profilesWithCv: number
  openReports: number
}

export interface AdminUserRow {
  uid: string
  email: string
  displayName: string
  affectedGrupoVazquez: boolean | null
  accountStatus: 'active' | 'suspended'
  createdAt: Timestamp | null
}

export interface ReportRow {
  id: string
  profileUid: string
  reason: ReportReason
  comment?: string
  reporterUid: string
  status: 'open' | 'resolved' | 'dismissed'
  createdAt: Timestamp | null
}

export interface AuditRow {
  id: string
  actorUid: string
  action: string
  targetUid: string
  reason?: string
  selfService?: boolean
  createdAt: Timestamp | null
}
