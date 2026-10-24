import type { Filters, ProductSummary } from '../types'

export const PAGE_SIZE = 12

type Criteria = Pick<Filters, 'min' | 'max' | 'brands' | 'q' | 'sort'>

/** Unique, alphabetically sorted brands. Products without a brand are skipped. */
export function getBrands(products: ProductSummary[]): string[] {
  const set = new Set<string>()
  for (const p of products) if (p.brand) set.add(p.brand)
  return [...set].sort((a, b) => a.localeCompare(b))
}

/** Pure + combined: every active criterion must match (AND), then sort. */
export function applyFilters(products: ProductSummary[], { min, max, brands, q, sort }: Criteria): ProductSummary[] {
  const query = q.trim().toLowerCase()
  const result = products.filter((p) => {
    if (min !== null && p.price < min) return false
    if (max !== null && p.price > max) return false
    if (brands.length > 0 && (!p.brand || !brands.includes(p.brand))) return false
    if (query && !`${p.title} ${p.brand ?? ''}`.toLowerCase().includes(query)) return false
    return true
  })
  if (sort === 'price-asc') result.sort((a, b) => a.price - b.price)
  else if (sort === 'price-desc') result.sort((a, b) => b.price - a.price)
  else if (sort === 'rating') result.sort((a, b) => b.rating - a.rating)
  return result
}

export function paginate<T>(items: T[], page: number, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.min(Math.max(1, page), totalPages)
  return { items: items.slice((current - 1) * pageSize, current * pageSize), page: current, totalPages }
}

export const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
