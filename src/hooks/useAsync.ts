import { useCallback, useEffect, useState } from 'react'

interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useAsync<T>(load: () => Promise<T>, deps: unknown[], peek?: () => T | undefined) {
  const [state, setState] = useState<AsyncState<T>>(() => {
    const cached = peek?.()
    return cached !== undefined
      ? { data: cached, loading: false, error: null }
      : { data: null, loading: true, error: null }
  })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const cached = peek?.()
    if (cached !== undefined) {
      setState({ data: cached, loading: false, error: null })
      return undefined
    }
    let cancelled = false
    setState({ data: null, loading: true, error: null })
    load()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((err: Error) => !cancelled && setState({ data: null, loading: false, error: err.message }))
    return () => {
      cancelled = true
    }
  }, [...deps, attempt])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])
  return { ...state, retry }
}
