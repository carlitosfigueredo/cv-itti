import { useCallback, useEffect, useState } from 'react'
import type { ProfileContent, PublicProfile, UserDocument } from '@/types/profile'
import type { AuthUser } from '@/types/auth'
import { ensureUserDocument, getOwnProfile, saveOwnProfile } from '@/services/profile.service'

type State =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; userDoc: UserDocument; profile: PublicProfile | null }

async function load(user: AuthUser): Promise<State> {
  try {
    const userDoc = await ensureUserDocument(user)
    const profile = await getOwnProfile(user.uid)
    return { status: 'ready', userDoc, profile }
  } catch (error) {
    // No se registra el contenido del error para no filtrar datos personales.
    console.error('No se pudo cargar el perfil', error instanceof Error ? error.name : 'error')
    return { status: 'error' }
  }
}

export function useProfileData(user: AuthUser) {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let active = true
    void load(user).then((next) => {
      if (active) setState(next)
    })
    return () => {
      active = false
    }
  }, [user])

  const reload = useCallback(async () => {
    setState({ status: 'loading' })
    setState(await load(user))
  }, [user])

  const save = useCallback(
    async (content: ProfileContent, affected: boolean) => {
      if (state.status !== 'ready') throw new Error('Los datos todavia no estan cargados')
      await saveOwnProfile({ uid: user.uid, content, affected, existing: state.profile })
    },
    [state, user.uid],
  )

  return { state, reload, save }
}
