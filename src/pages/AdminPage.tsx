import Box from '@mui/material/Box'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { useSearchParams } from 'react-router-dom'
import { PageContainer } from '@/components/common/PageContainer'
import { AuditPanel } from '@/components/admin/AuditPanel'
import { ReportsPanel } from '@/components/admin/ReportsPanel'
import { StatsPanel } from '@/components/admin/StatsPanel'
import { UsersPanel } from '@/components/admin/UsersPanel'

const TABS = [
  { id: 'estadisticas', label: 'Estadísticas', Panel: StatsPanel },
  { id: 'usuarios', label: 'Usuarios', Panel: UsersPanel },
  { id: 'reportes', label: 'Reportes', Panel: ReportsPanel },
  { id: 'auditoria', label: 'Auditoría', Panel: AuditPanel },
] as const

export default function AdminPage() {
  const [params, setParams] = useSearchParams()
  const current = TABS.find((t) => t.id === params.get('tab')) ?? TABS[0]
  const { Panel } = current

  return (
    <PageContainer title="Administración">
      <Tabs
        value={current.id}
        onChange={(_, value: string) => setParams({ tab: value })}
        variant="scrollable"
        allowScrollButtonsMobile
        aria-label="Secciones de administración"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {TABS.map((t) => (
          <Tab key={t.id} value={t.id} label={t.label} id={`tab-${t.id}`} aria-controls={`panel-${t.id}`} />
        ))}
      </Tabs>
      <Box role="tabpanel" id={`panel-${current.id}`} aria-labelledby={`tab-${current.id}`}>
        <Panel key={current.id} />
      </Box>
    </PageContainer>
  )
}
