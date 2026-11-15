import Stack from '@mui/material/Stack'
import { PageContainer } from '@/components/common/PageContainer'
import { CvBanner } from '@/components/home/CvBanner'
import { TalentDirectory } from '@/components/search/TalentDirectory'

export default function HomePage() {
  return (
    <PageContainer>
      <Stack spacing={{ xs: 4, md: 6 }}>
        <CvBanner />
        <TalentDirectory />
      </Stack>
    </PageContainer>
  )
}
