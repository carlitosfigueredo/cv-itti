import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

interface PageContainerProps {
  title?: string
  children: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

export function PageContainer({ title, children, maxWidth = 'lg' }: PageContainerProps) {
  return (
    <Container maxWidth={maxWidth} sx={{ py: { xs: 3, md: 5 } }}>
      {title && (
        <Typography variant="h2" component="h1" gutterBottom>
          {title}
        </Typography>
      )}
      {children}
    </Container>
  )
}
