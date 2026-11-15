import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { useCallback } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { PublicProfileView } from '@/components/profile/PublicProfileView'
import { useAsync } from '@/hooks/useAsync'
import { getProfileForReview } from '@/services/admin.service'

function ReviewContent({ uid }: { uid: string }) {
  const loader = useCallback(() => getProfileForReview(uid), [uid])
  const { state, reload } = useAsync(loader)
  if (state.status === 'loading') return <LoadingState label="Cargando perfil" />
  if (state.status === 'error') return <ErrorState message="No se pudo cargar el perfil." onRetry={reload} />
  if (!state.data) return <EmptyState title="Sin perfil" description="Esta persona todavía no creó su perfil." />
  return <PublicProfileView profile={state.data} />
}

export function ProfileReviewDialog({ uid, onClose }: { uid: string | null; onClose: () => void }) {
  return (
    <Dialog open={uid !== null} onClose={onClose} fullWidth maxWidth="md" aria-labelledby="review-title">
      <DialogTitle id="review-title">Revisión de perfil</DialogTitle>
      <DialogContent dividers>{uid && <ReviewContent key={uid} uid={uid} />}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}
