import { useCallback, useEffect, useState } from 'react'
import { getPublicProfile } from '@/services/profile.service'
import type { PublicProfile } from '@/types/profile'

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'not-found' }
  | { status: 'ready'; profile: PublicProfile }

async function load(uid: string): Promise<State> {
  try {
    const profile = await getPublicProfile(uid)
    return profile ? { status: 'ready', profile } : { status: 'not-found' }
  } catch (error) {
    console.error('No se pudo cargar el perfil publico', error instanceof Error ? error.name : 'error')
    return { status: 'error' }
  }
}

export function usePublicProfile(uid: string | undefined) {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    if (!uid) return
    let active = true
    void load(uid).then((next) => {
      if (active) setState(next)
    })
    return () => {
      active = false
    }
  }, [uid])

  const retry = useCallback(async () => {
    if (!uid) return
    setState({ status: 'loading' })
    setState(await load(uid))
  }, [uid])

  if (!uid) return { state: { status: 'not-found' } as State, retry }
  return { state, retry }
}
