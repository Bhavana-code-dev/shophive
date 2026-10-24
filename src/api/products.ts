import { getJson } from './client'
import type { Category, Product, ProductSummary } from '../types'

/**
 * Only request the fields the listing needs. `limit=0` returns the whole
 * catalogue in one request, so filtering/pagination can be instant and
 * combined filters stay trivially correct (the API cannot filter by price or brand).
 */
const LIST_FIELDS = 'title,price,rating,thumbnail,brand,category,discountPercentage'

// Promise caches dedupe in-flight requests. A failed request is evicted so "Retry" really retries.
const listCache = new Map<string, Promise<ProductSummary[]>>()
const detailCache = new Map<number, Promise<Product>>()
let categoriesCache: Promise<Category[]> | null = null

// Resolved values, readable synchronously: screens render instantly when data
// was already fetched (no skeleton flash on Back).
const listData = new Map<string, ProductSummary[]>()
const detailData = new Map<number, Product>()
let categoriesData: Category[] | undefined

export const peekProducts = (category: string) => listData.get(category)
export const peekProduct = (id: number) => detailData.get(id)
export const peekCategories = () => categoriesData

function memo<K, V>(cache: Map<K, Promise<V>>, store: Map<K, V>, key: K, load: () => Promise<V>): Promise<V> {
  const hit = cache.get(key)
  if (hit) return hit
  const promise = load()
    .then((value) => {
      store.set(key, value)
      return value
    })
    .catch((err) => {
      cache.delete(key)
      throw err
    })
  cache.set(key, promise)
  return promise
}

export function fetchProducts(category: string): Promise<ProductSummary[]> {
  return memo(listCache, listData, category, async () => {
    const path = category ? `/products/category/${encodeURIComponent(category)}` : '/products'
    const data = await getJson<{ products: ProductSummary[] }>(`${path}?limit=0&select=${LIST_FIELDS}`)
    return data.products
  })
}

export function fetchProduct(id: number): Promise<Product> {
  return memo(detailCache, detailData, id, () => getJson<Product>(`/products/${id}`))
}

const titleCase = (slug: string) =>
  slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export function fetchCategories(): Promise<Category[]> {
  if (!categoriesCache) {
    categoriesCache = getJson<Array<string | Category>>('/products/categories')
      .then((list) => {
        // The endpoint returns objects today and plain strings in older versions: handle both.
        const result = list.map((c) =>
          typeof c === 'string' ? { slug: c, name: titleCase(c) } : { slug: c.slug, name: c.name },
        )
        categoriesData = result
        return result
      })
      .catch((err) => {
        categoriesCache = null
        throw err
      })
  }
  return categoriesCache
}

export async function fetchRelatedProducts(
  category: string,
  excludeId: number,
  limit = 4,
): Promise<ProductSummary[]> {
  // Fetch one extra so we still have `limit` items after removing the current product
  const res = await fetch(
    `https://dummyjson.com/products/category/${encodeURIComponent(category)}?limit=${limit + 1}`,
  )
  if (!res.ok) throw new Error('Could not load related products')
  const data = await res.json()
  return (data.products as ProductSummary[]).filter((p) => p.id !== excludeId).slice(0, limit)
}