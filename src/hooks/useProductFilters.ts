import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Filters, SortKey } from '../types'

const SORTS: SortKey[] = ['price-asc', 'price-desc', 'rating']

const toPrice = (v: string | null) => {
  if (v === null || v.trim() === '') return null
  const n = Number(v)
  return Number.isFinite(n) && n >= 0 ? n : null
}

/**
 * Single source of truth for filters = the URL query string.
 * Benefits: shareable links, refresh-safe, and "Back" from a product page
 * returns to the exact same filtered/paginated view with zero extra code.
 */
export function useProductFilters() {
  const [params, setParams] = useSearchParams()

  const filters: Filters = useMemo(() => {
    const sort = params.get('sort') as SortKey
    const page = parseInt(params.get('page') ?? '1', 10)
    return {
      category: params.get('category') ?? '',
      min: toPrice(params.get('min')),
      max: toPrice(params.get('max')),
      brands: params.getAll('brand'),
      q: params.get('q') ?? '',
      sort: SORTS.includes(sort) ? sort : '',
      page: Number.isFinite(page) && page > 0 ? page : 1,
    }
  }, [params])

  /** Any change except `page` itself resets pagination to page 1. */
  const update = useCallback(
    (patch: Partial<Filters>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          const set = (key: string, value: string | number | null) =>
            value === null || value === '' ? next.delete(key) : next.set(key, String(value))

          if ('category' in patch) set('category', patch.category ?? '')
          if ('min' in patch) set('min', patch.min ?? null)
          if ('max' in patch) set('max', patch.max ?? null)
          if ('q' in patch) set('q', patch.q?.trim() ?? '')
          if ('sort' in patch) set('sort', patch.sort ?? '')
          if ('brands' in patch) {
            next.delete('brand')
            patch.brands?.forEach((b) => next.append('brand', b))
          }
          if ('page' in patch && patch.page !== 1) set('page', patch.page ?? 1)
          else next.delete('page')
          return next
        },
        // replace: filter tweaks don't pollute history, so Back leaves the page in one click.
        { replace: true },
      )
    },
    [setParams],
  )

  const clearAll = useCallback(() => setParams({}, { replace: true }), [setParams])

  const activeCount =
    (filters.category ? 1 : 0) + (filters.min !== null ? 1 : 0) + (filters.max !== null ? 1 : 0) + filters.brands.length

  return { filters, update, clearAll, activeCount }
}
