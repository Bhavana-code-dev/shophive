import { createContext, useContext } from 'react'
import type { NavigateOptions } from 'react-router-dom'

export type GoWithLoader = (to: string, options?: NavigateOptions, prefetch?: Promise<unknown>) => void

export const LoaderContext = createContext<GoWithLoader | null>(null)

export function useNavigateWithLoader(): GoWithLoader {
  const go = useContext(LoaderContext)
  if (!go) throw new Error('useNavigateWithLoader must be used inside <LoaderProvider>')
  return go
}
