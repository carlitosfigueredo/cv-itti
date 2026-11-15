import Button from '@mui/material/Button'
import { Link as RouterLink } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { PageContainer } from '@/components/common/PageContainer'

export default function NotFoundPage() {
  return (
    <PageContainer>
      <EmptyState
        title="Página no encontrada"
        description="La dirección que buscás no existe."
        action={<Button component={RouterLink} to="/" variant="contained">Volver al inicio</Button>}
      />
    </PageContainer>
  )
}
