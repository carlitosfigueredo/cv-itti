import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'
import Button from '@mui/material/Button'
import { useEffect, useState } from 'react'
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { PageContainer } from '@/components/common/PageContainer'
import { PublicProfileView } from '@/components/profile/PublicProfileView'
import { ReportProfileDialog } from '@/components/profile/ReportProfileDialog'
import { useAuth } from '@/hooks/useAuth'
import { usePublicProfile } from '@/hooks/usePublicProfile'
import { downloadCv } from '@/services/cv.service'

function PublicProfileContent({ uid }: { uid: string | undefined }) {
  const { user } = useAuth()
  const location = useLocation()
  const { state, retry } = usePublicProfile(uid)
  const [reportOpen, setReportOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [cvError, setCvError] = useState<string | null>(null)

  const name = state.status === 'ready' ? state.profile.displayName : null
  useEffect(() => {
    if (!name) return
    const previous = document.title
    document.title = `${name} | itti talentos`
    return () => {
      document.title = previous
    }
  }, [name])

  if (state.status === 'loading') return <LoadingState label="Cargando perfil" />

  if (state.status === 'error') {
    return (
      <PageContainer maxWidth="md">
        <ErrorState message="No se pudo cargar el perfil." onRetry={retry} />
      </PageContainer>
    )
  }

  if (state.status === 'not-found') {
    return (
      <PageContainer maxWidth="md">
        <EmptyState
          title="Este perfil no está disponible"
          description="Puede que no exista o que su dueño lo haya ocultado."
          action={<Button component={RouterLink} to="/" variant="contained">Ver talentos</Button>}
        />
      </PageContainer>
    )
  }

  const { profile } = state
  const isOwn = user?.uid === profile.uid

  async function handleDownload() {
    setCvError(null)
    setDownloading(true)
    try {
      await downloadCv(profile.uid, `CV - ${profile.displayName}.pdf`)
    } catch {
      setCvError('No se pudo descargar el CV. Intentá de nuevo en unos minutos.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <PageContainer maxWidth="md">
      <PublicProfileView
        profile={profile}
        preview={!profile.isPublic}
        onDownloadCv={handleDownload}
        downloadingCv={downloading}
        cvError={cvError}
        actions={
          profile.isPublic && !isOwn ? (
            <Button variant="text" color="inherit" startIcon={<FlagOutlinedIcon />} onClick={() => setReportOpen(true)}>
              Reportar
            </Button>
          ) : undefined
        }
      />
      <ReportProfileDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        profileUid={profile.uid}
        reporterUid={user?.uid ?? null}
        returnTo={location.pathname}
      />
    </PageContainer>
  )
}

// La key reinicia el estado al navegar de un perfil a otro.
export default function PublicProfilePage() {
  const { uid } = useParams<{ uid: string }>()
  return <PublicProfileContent key={uid} uid={uid} />
}
