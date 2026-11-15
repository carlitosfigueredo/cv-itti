import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import { useCallback, useState } from 'react'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { useAsync } from '@/hooks/useAsync'
import { listReports, moderateAccount, resolveReport } from '@/services/admin.service'
import { REPORT_REASON_LABELS } from '@/services/report.service'
import type { ReportRow } from '@/types/admin'
import { ConfirmActionDialog, type ConfirmActionConfig } from './ConfirmActionDialog'
import { ProfileReviewDialog } from './ProfileReviewDialog'

const STATUS_LABEL = { open: 'Abierto', resolved: 'Resuelto', dismissed: 'Descartado' } as const

function ReportsList({ status }: { status: 'open' | 'closed' }) {
  const loader = useCallback(() => listReports(status), [status])
  const { state, reload } = useAsync(loader)
  const [action, setAction] = useState<ConfirmActionConfig | null>(null)
  const [reviewUid, setReviewUid] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  if (state.status === 'loading') return <LoadingState label="Cargando reportes" />
  if (state.status === 'error') return <ErrorState message="No se pudieron cargar los reportes." onRetry={reload} />
  if (state.data.length === 0) {
    return <Typography color="text.secondary">{status === 'open' ? 'No hay reportes abiertos.' : 'Todavía no hay reportes cerrados.'}</Typography>
  }

  const open = (config: ConfirmActionConfig) => {
    setNotice(null)
    setAction(config)
  }

  const actions = (r: ReportRow) => (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
      <Button size="small" onClick={() => setReviewUid(r.profileUid)}>Ver perfil</Button>
      <Button
        size="small"
        variant="contained"
        onClick={() =>
          open({
            title: 'Despublicar y resolver',
            description: 'Se despublica el perfil reportado y el reporte queda como resuelto.',
            confirmLabel: 'Despublicar y resolver',
            run: async (reason) => {
              await moderateAccount(r.profileUid, 'unpublish', reason || `Reporte: ${REPORT_REASON_LABELS[r.reason]}`)
              await resolveReport(r.id, 'resolved')
            },
          })
        }
      >
        Despublicar y resolver
      </Button>
      <Button
        size="small"
        onClick={() =>
          open({
            title: 'Marcar como resuelto',
            description: 'Usalo si ya tomaste una acción por otro medio (por ejemplo, eliminaste el CV).',
            confirmLabel: 'Marcar resuelto',
            run: () => resolveReport(r.id, 'resolved'),
          })
        }
      >
        Marcar resuelto
      </Button>
      <Button
        size="small"
        color="inherit"
        onClick={() =>
          open({
            title: 'Descartar reporte',
            description: 'El reporte se cierra sin aplicar ninguna acción sobre el perfil.',
            confirmLabel: 'Descartar',
            run: () => resolveReport(r.id, 'dismissed'),
          })
        }
      >
        Descartar
      </Button>
    </Stack>
  )

  return (
    <Stack spacing={2}>
      {notice && <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert>}
      {state.data.map((r) => (
        <Card key={r.id}>
          <CardContent>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
                <Typography sx={{ fontWeight: 600, flexGrow: 1 }}>{REPORT_REASON_LABELS[r.reason]}</Typography>
                <Chip size="small" label={STATUS_LABEL[r.status]} color={r.status === 'open' ? 'warning' : 'default'} />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {r.createdAt ? dayjs(r.createdAt.toDate()).format('DD/MM/YYYY HH:mm') : ''} · Perfil {r.profileUid}
              </Typography>
              {r.comment && (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>“{r.comment}”</Typography>
              )}
              {status === 'open' ? actions(r) : (
                <div><Button size="small" onClick={() => setReviewUid(r.profileUid)}>Ver perfil</Button></div>
              )}
            </Stack>
          </CardContent>
        </Card>
      ))}
      <ConfirmActionDialog
        config={action}
        onClose={() => setAction(null)}
        onDone={() => {
          setNotice('Listo. El reporte se actualizó.')
          setAction(null)
          void reload()
        }}
      />
      <ProfileReviewDialog uid={reviewUid} onClose={() => setReviewUid(null)} />
    </Stack>
  )
}

export function ReportsPanel() {
  const [status, setStatus] = useState<'open' | 'closed'>('open')
  return (
    <Stack spacing={2}>
      <ToggleButtonGroup exclusive size="small" value={status} onChange={(_, v) => v && setStatus(v)} aria-label="Estado de los reportes">
        <ToggleButton value="open">Abiertos</ToggleButton>
        <ToggleButton value="closed">Cerrados</ToggleButton>
      </ToggleButtonGroup>
      <ReportsList key={status} status={status} />
    </Stack>
  )
}
