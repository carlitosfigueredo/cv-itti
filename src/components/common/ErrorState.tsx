import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Ocurrió un error inesperado.', onRetry }: ErrorStateProps) {
  return (
    <Alert
      severity="error"
      action={onRetry && <Button color="inherit" size="small" onClick={onRetry}>Reintentar</Button>}
    >
      {message}
    </Alert>
  )
}
