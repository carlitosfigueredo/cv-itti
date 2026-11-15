import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { useAsync } from '@/hooks/useAsync'
import { listAudit } from '@/services/admin.service'

const ACTION_LABELS: Record<string, string> = {
  unpublish: 'Despublicó un perfil',
  remove_cv: 'Eliminó un CV',
  suspend: 'Suspendió una cuenta',
  unsuspend: 'Reactivó una cuenta',
  resolve_report: 'Resolvió un reporte',
  dismiss_report: 'Descartó un reporte',
  delete_account: 'Eliminó una cuenta',
  grant_admin: 'Otorgó rol de administrador',
  revoke_admin: 'Quitó rol de administrador',
}

export function AuditPanel() {
  const { state, reload } = useAsync(listAudit)
  if (state.status === 'loading') return <LoadingState label="Cargando auditoría" />
  if (state.status === 'error') return <ErrorState message="No se pudo cargar la auditoría." onRetry={reload} />
  if (state.data.length === 0) return <Typography color="text.secondary">Todavía no hay acciones registradas.</Typography>

  return (
    <TableContainer>
      <Table size="small" aria-label="Últimas acciones de administración">
        <TableHead>
          <TableRow>
            <TableCell>Fecha</TableCell>
            <TableCell>Acción</TableCell>
            <TableCell>Hecha por</TableCell>
            <TableCell>Cuenta afectada</TableCell>
            <TableCell>Motivo</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {state.data.map((e) => (
            <TableRow key={e.id}>
              <TableCell>{e.createdAt ? dayjs(e.createdAt.toDate()).format('DD/MM/YYYY HH:mm') : '—'}</TableCell>
              <TableCell>{ACTION_LABELS[e.action] ?? e.action}{e.selfService ? ' (pedido por la persona)' : ''}</TableCell>
              <TableCell>{e.actorUid === 'cli' ? 'Script de administración' : e.actorUid}</TableCell>
              <TableCell>{e.targetUid}</TableCell>
              <TableCell sx={{ overflowWrap: 'anywhere' }}>{e.reason ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
