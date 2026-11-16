import { doc, serverTimestamp, setDoc } from 'firebase/firestore/lite'
import { getFirebase } from '@/firebase/config'

export const REPORT_REASONS = ['inappropriate', 'false_information', 'spam', 'other'] as const
export type ReportReason = (typeof REPORT_REASONS)[number]

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  inappropriate: 'Contenido inapropiado',
  false_information: 'Información falsa',
  spam: 'Spam o publicidad',
  other: 'Otro motivo',
}

export type ReportResult = 'sent' | 'already-reported' | 'error'

// El id {perfil}_{reportante} permite un solo reporte por usuario y perfil: un segundo
// intento es una actualizacion y las reglas lo rechazan.
export async function reportProfile(
  profileUid: string,
  reporterUid: string,
  reason: ReportReason,
  comment: string,
): Promise<ReportResult> {
  const trimmed = comment.trim()
  try {
    await setDoc(doc(getFirebase().db, 'reports', `${profileUid}_${reporterUid}`), {
      profileUid,
      reason,
      ...(trimmed ? { comment: trimmed } : {}),
      reporterUid,
      status: 'open',
      createdAt: serverTimestamp(),
    })
    return 'sent'
  } catch (error) {
    return (error as { code?: string }).code === 'permission-denied' ? 'already-reported' : 'error'
  }
}
