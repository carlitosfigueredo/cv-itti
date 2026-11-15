import { useCallback, useEffect, useState } from 'react'
import { searchProfiles } from '@/services/search.service'
import type { PublicProfile } from '@/types/profile'
import type { DirectoryFilters } from '@/types/search'
import type { QueryDocumentSnapshot } from 'firebase/firestore'

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | {
      status: 'ready'
      profiles: PublicProfile[]
      cursor: QueryDocumentSnapshot | null
      hasMore: boolean
      loadingMore: boolean
      moreError: boolean
    }

function logError(error: unknown) {
  // Solo el nombre del error: nunca datos personales.
  console.error('Fallo la busqueda de talentos', error instanceof Error ? error.name : 'error')
}

// Se usa con la key del componente = filtros actuales, asi cada busqueda nueva
// empieza desde "loading" sin estado viejo.
export function useTalentSearch(filters: DirectoryFilters) {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let active = true
    searchProfiles(filters)
      .then((page) => {
        if (active) setState({ status: 'ready', ...page, loadingMore: false, moreError: false })
      })
      .catch((error) => {
        logError(error)
        if (active) setState({ status: 'error' })
      })
    return () => {
      active = false
    }
  }, [filters])

  const retry = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      const page = await searchProfiles(filters)
      setState({ status: 'ready', ...page, loadingMore: false, moreError: false })
    } catch (error) {
      logError(error)
      setState({ status: 'error' })
    }
  }, [filters])

  const loadMore = useCallback(async () => {
    if (state.status !== 'ready' || state.loadingMore || !state.hasMore) return
    setState({ ...state, loadingMore: true, moreError: false })
    try {
      const page = await searchProfiles(filters, state.cursor)
      setState({
        status: 'ready',
        profiles: [...state.profiles, ...page.profiles],
        cursor: page.cursor,
        hasMore: page.hasMore,
        loadingMore: false,
        moreError: false,
      })
    } catch (error) {
      logError(error)
      setState({ ...state, loadingMore: false, moreError: true })
    }
  }, [filters, state])

  return { state, retry, loadMore }
}
