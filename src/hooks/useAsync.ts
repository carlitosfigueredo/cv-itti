import { useCallback, useEffect, useState } from 'react'

export type AsyncState<T> = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: T }

// Carga datos al montar y permite recargar. Para listas simples del panel de admin.
export function useAsync<T>(loader: () => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' })

  useEffect(() => {
    let active = true
    loader()
      .then((data) => active && setState({ status: 'ready', data }))
      .catch((error: unknown) => {
        console.error('Fallo la carga', (error as { code?: string } | null)?.code ?? 'sin-codigo')
        if (active) setState({ status: 'error' })
      })
    return () => {
      active = false
    }
  }, [loader])

  const reload = useCallback(async () => {
    setState({ status: 'loading' })
    try {
      setState({ status: 'ready', data: await loader() })
    } catch (error) {
      console.error('Fallo la carga', (error as { code?: string } | null)?.code ?? 'sin-codigo')
      setState({ status: 'error' })
    }
  }, [loader])

  return { state, reload }
}
