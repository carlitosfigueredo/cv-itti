import MoreVertIcon from '@mui/icons-material/MoreVert'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import type { QueryDocumentSnapshot } from 'firebase/firestore/lite'
import { useCallback, useEffect, useState } from 'react'
import { ErrorState } from '@/components/common/ErrorState'
import { LoadingState } from '@/components/common/LoadingState'
import { useAuth } from '@/hooks/useAuth'
import {
  deleteAccountAsAdmin,
  listUsers,
  moderateAccount,
  type AffectedFilter,
  type StatusFilter,
} from '@/services/admin.service'
import type { AdminUserRow } from '@/types/admin'
import { ConfirmActionDialog, type ConfirmActionConfig } from './ConfirmActionDialog'
import { ProfileReviewDialog } from './ProfileReviewDialog'

type ListState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; rows: AdminUserRow[]; cursor: QueryDocumentSnapshot | null; hasMore: boolean; loadingMore: boolean }

const AFFECTED_LABEL = { yes: 'Sí', no: 'No', unanswered: 'Sin responder' } as const

function affectedLabel(value: boolean | null) {
  if (value === null) return AFFECTED_LABEL.unanswered
  return value ? AFFECTED_LABEL.yes : AFFECTED_LABEL.no
}

export function UsersPanel() {
  const { user } = useAuth()
  const [affected, setAffected] = useState<AffectedFilter>('all')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [list, setList] = useState<ListState>({ status: 'loading' })
  const [menu, setMenu] = useState<{ anchor: HTMLElement; row: AdminUserRow } | null>(null)
  const [action, setAction] = useState<ConfirmActionConfig | null>(null)
  const [reviewUid, setReviewUid] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [moreError, setMoreError] = useState(false)

  const fetchFirstPage = useCallback(async (): Promise<ListState> => {
    try {
      const page = await listUsers({ affected, status })
      return { status: 'ready', ...page, loadingMore: false }
    } catch {
      return { status: 'error' }
    }
  }, [affected, status])

  useEffect(() => {
    let active = true
    void fetchFirstPage().then((next) => {
      if (active) setList(next)
    })
    return () => {
      active = false
    }
  }, [fetchFirstPage])

  const load = useCallback(async () => {
    setList({ status: 'loading' })
    setList(await fetchFirstPage())
  }, [fetchFirstPage])

  async function loadMore() {
    if (list.status !== 'ready' || !list.hasMore) return
    setList({ ...list, loadingMore: true })
    setMoreError(false)
    try {
      const page = await listUsers({ affected, status }, list.cursor)
      setList({ status: 'ready', rows: [...list.rows, ...page.rows], cursor: page.cursor, hasMore: page.hasMore, loadingMore: false })
    } catch {
      setList({ ...list, loadingMore: false })
      setMoreError(true)
    }
  }

  function open(config: ConfirmActionConfig) {
    setMenu(null)
    setNotice(null)
    setAction(config)
  }

  function actionsFor(row: AdminUserRow) {
    const name = row.displayName || row.email
    const isSelf = row.uid === user?.uid
    return [
      { label: 'Ver perfil', run: () => { setMenu(null); setReviewUid(row.uid) } },
      {
        label: 'Despublicar perfil',
        disabled: isSelf,
        run: () => open({
          title: 'Despublicar perfil',
          description: `El perfil de ${name} dejará de verse en el directorio y su CV dejará de ser público. La persona puede volver a publicarlo.`,
          confirmLabel: 'Despublicar',
          run: (reason) => moderateAccount(row.uid, 'unpublish', reason),
        }),
      },
      {
        label: 'Eliminar CV',
        disabled: isSelf,
        run: () => open({
          title: 'Eliminar CV',
          description: `Se borrará el CV de ${name}. Usalo para contenido inapropiado. La persona puede subir otro.`,
          confirmLabel: 'Eliminar CV',
          danger: true,
          run: (reason) => moderateAccount(row.uid, 'removeCv', reason),
        }),
      },
      row.accountStatus === 'active'
        ? {
            label: 'Suspender cuenta',
            disabled: isSelf,
            run: () => open({
              title: 'Suspender cuenta',
              description: `${name} no podrá iniciar sesión y su perfil se despublicará. Podés reactivar la cuenta más tarde.`,
              confirmLabel: 'Suspender',
              danger: true,
              run: (reason) => moderateAccount(row.uid, 'suspend', reason),
            }),
          }
        : {
            label: 'Reactivar cuenta',
            disabled: isSelf,
            run: () => open({
              title: 'Reactivar cuenta',
              description: `${name} podrá volver a iniciar sesión. Su perfil seguirá privado hasta que lo publique.`,
              confirmLabel: 'Reactivar',
              run: (reason) => moderateAccount(row.uid, 'unsuspend', reason),
            }),
          },
      {
        label: 'Eliminar cuenta',
        disabled: isSelf,
        danger: true,
        run: () => open({
          title: 'Eliminar cuenta definitivamente',
          description: `Se borrarán la cuenta, el perfil y el CV de ${name}. No se puede deshacer. Por seguridad, si tu inicio de sesión no es reciente, se te pedirá volver a entrar.`,
          confirmLabel: 'Eliminar cuenta',
          danger: true,
          typeToConfirm: 'ELIMINAR',
          run: (reason) => deleteAccountAsAdmin(row.uid, reason),
        }),
      },
    ]
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField select label="Afectado Grupo Vázquez" value={affected} onChange={(e) => { setList({ status: 'loading' }); setAffected(e.target.value as AffectedFilter) }} sx={{ minWidth: { sm: 220 } }}>
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="yes">Sí</MenuItem>
          <MenuItem value="no">No</MenuItem>
          <MenuItem value="unanswered">Sin responder</MenuItem>
        </TextField>
        <TextField select label="Estado de la cuenta" value={status} onChange={(e) => { setList({ status: 'loading' }); setStatus(e.target.value as StatusFilter) }} sx={{ minWidth: { sm: 200 } }}>
          <MenuItem value="all">Todas</MenuItem>
          <MenuItem value="active">Activas</MenuItem>
          <MenuItem value="suspended">Suspendidas</MenuItem>
        </TextField>
      </Stack>

      {notice && <Alert severity="success" onClose={() => setNotice(null)}>{notice}</Alert>}

      {list.status === 'loading' && <LoadingState label="Cargando usuarios" />}
      {list.status === 'error' && <ErrorState message="No se pudieron cargar los usuarios." onRetry={load} />}
      {list.status === 'ready' && list.rows.length === 0 && (
        <Typography color="text.secondary">No hay usuarios con esos filtros.</Typography>
      )}
      {list.status === 'ready' && list.rows.length > 0 && (
        <>
          <TableContainer>
            <Table size="small" aria-label="Usuarios">
              <TableHead>
                <TableRow>
                  <TableCell>Persona</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Afectado GV</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Alta</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {list.rows.map((row) => (
                  <TableRow key={row.uid} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.displayName || 'Sin nombre'}</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{row.email}</Typography>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{affectedLabel(row.affectedGrupoVazquez)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={row.accountStatus === 'active' ? 'Activa' : 'Suspendida'} color={row.accountStatus === 'active' ? 'default' : 'error'} />
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{row.createdAt ? dayjs(row.createdAt.toDate()).format('DD/MM/YYYY') : '—'}</TableCell>
                    <TableCell align="right">
                      <IconButton aria-label={`Acciones para ${row.displayName || row.email}`} onClick={(e) => setMenu({ anchor: e.currentTarget, row })}>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {moreError && <ErrorState message="No se pudieron cargar más usuarios." onRetry={loadMore} />}
          {list.hasMore && (
            <Box sx={{ textAlign: 'center' }}>
              <Button variant="outlined" onClick={loadMore} disabled={list.loadingMore}>Ver más</Button>
            </Box>
          )}
        </>
      )}

      <Menu anchorEl={menu?.anchor} open={menu !== null} onClose={() => setMenu(null)}>
        {menu &&
          actionsFor(menu.row).map((item) => (
            <MenuItem key={item.label} onClick={item.run} disabled={item.disabled} sx={item.danger ? { color: 'error.main' } : undefined}>
              {item.label}
            </MenuItem>
          ))}
      </Menu>

      <ConfirmActionDialog
        config={action}
        onClose={() => setAction(null)}
        onDone={() => {
          setNotice(`Listo: ${action?.title.toLowerCase()}.`)
          setAction(null)
          void load()
        }}
      />
      <ProfileReviewDialog uid={reviewUid} onClose={() => setReviewUid(null)} />
    </Stack>
  )
}
