import Button from '@mui/material/Button'
import { Link as RouterLink } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { PageContainer } from '@/components/common/PageContainer'

export default function NotFoundPage() {
  return (
    <PageContainer>
      <EmptyState
        title="Esta página no existe"
        description="Puede que el enlace esté mal escrito o que la página se haya movido."
        action={<Button component={RouterLink} to="/" variant="contained">Ir al inicio</Button>}
      />
    </PageContainer>
  )
}
