import { describe, expect, it } from 'vitest'
import { applyFilters, getBrands, paginate } from './filterProducts'
import type { ProductSummary } from '../types'

const mk = (id: number, price: number, brand?: string, rating = 4): ProductSummary => ({
  id, title: `Item ${id}`, price, rating, thumbnail: '', brand, category: 'x',
})
const data = [mk(1, 10, 'Apple'), mk(2, 50, 'Samsung', 5), mk(3, 100, 'Apple', 3), mk(4, 70)]
const base = { min: null, max: null, brands: [], q: '', sort: '' as const }

describe('applyFilters', () => {
  it('returns everything when no filter is active', () => expect(applyFilters(data, base)).toHaveLength(4))
  it('filters by inclusive price range', () =>
    expect(applyFilters(data, { ...base, min: 50, max: 100 }).map((p) => p.id)).toEqual([2, 3, 4]))
  it('supports multi-select brands and skips brandless products', () =>
    expect(applyFilters(data, { ...base, brands: ['Apple', 'Samsung'] }).map((p) => p.id)).toEqual([1, 2, 3]))
  it('combines filters with AND', () =>
    expect(applyFilters(data, { ...base, brands: ['Apple'], min: 50 }).map((p) => p.id)).toEqual([3]))
  it('sorts without mutating the input', () => {
    const copy = [...data]
    expect(applyFilters(data, { ...base, sort: 'price-desc' })[0].id).toBe(3)
    expect(data).toEqual(copy)
  })
})

describe('getBrands', () => {
  it('returns unique sorted brands', () => expect(getBrands(data)).toEqual(['Apple', 'Samsung']))
})

describe('paginate', () => {
  it('clamps out-of-range pages', () => {
    const r = paginate([1, 2, 3, 4, 5], 99, 2)
    expect(r.page).toBe(3)
    expect(r.items).toEqual([5])
  })
})
