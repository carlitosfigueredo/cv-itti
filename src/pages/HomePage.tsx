import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import { useLocation } from 'react-router-dom'
import { PageContainer } from '@/components/common/PageContainer'
import { TalentDirectory } from '@/components/search/TalentDirectory'

// El inicio es el directorio. La invitacion a cargar el CV esta en el header.
export default function HomePage() {
  const location = useLocation()
  const accountDeleted = (location.state as { accountDeleted?: boolean } | null)?.accountDeleted === true
  return (
    <PageContainer>
      <Stack spacing={3}>
        {accountDeleted && <Alert severity="success">Tu cuenta se eliminó. Gracias por haber participado.</Alert>}
        <TalentDirectory />
      </Stack>
    </PageContainer>
  )
}
