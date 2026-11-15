import { PageContainer } from '@/components/common/PageContainer'
import { TalentDirectory } from '@/components/search/TalentDirectory'

// El inicio es el directorio. La invitacion a cargar el CV esta en el header.
export default function HomePage() {
  return (
    <PageContainer>
      <TalentDirectory />
    </PageContainer>
  )
}
