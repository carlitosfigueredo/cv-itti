import Button from '@mui/material/Button'
import { Link as RouterLink } from 'react-router-dom'
import { EmptyState } from '@/components/common/EmptyState'
import { PageContainer } from '@/components/common/PageContainer'

export default function NotFoundPage() {
  return (
    <PageContainer>
      <EmptyState
        title="Pagina no encontrada"
        description="La direccion que buscas no existe."
        action={<Button component={RouterLink} to="/" variant="contained">Volver al inicio</Button>}
      />
    </PageContainer>
  )
}
