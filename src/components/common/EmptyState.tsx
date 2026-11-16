import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Typography variant="h3" component="h2" gutterBottom>{title}</Typography>
      {description && <Typography color="text.secondary" sx={{ mb: 2 }}>{description}</Typography>}
      {action}
    </Box>
  )
}
