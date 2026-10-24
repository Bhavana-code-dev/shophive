import { useMemo } from 'react'
import { fetchCategories, fetchProducts, peekCategories, peekProducts } from '../api/products'
import { FilterPanel } from '../components/FilterPanel'
import { Pagination } from '../components/Pagination'
import { ProductCard, ProductCardSkeleton } from '../components/ProductCard'
import { Sidebar } from '../components/Sidebar'
import { StateMessage } from '../components/StateMessage'
import { useAsync } from '../hooks/useAsync'
import { useProductFilters } from '../hooks/useProductFilters'
import { applyFilters, getBrands, PAGE_SIZE, paginate } from '../lib/filterProducts'
import { SortSelect } from '../components/SortSelect'
import { CategoryChips } from '../components/CategoryChips'

interface Props {
  sidebarOpen: boolean
  onCloseSidebar: () => void
}

export default function ListingPage({ sidebarOpen, onCloseSidebar }: Props) {
  const { filters, update, clearAll, activeCount } = useProductFilters()

  const categories = useAsync(fetchCategories, [], peekCategories)
  const products = useAsync(() => fetchProducts(filters.category), [filters.category], () => peekProducts(filters.category))

  const brands = useMemo(() => getBrands(products.data ?? []), [products.data])
  const filtered = useMemo(
    () => applyFilters(products.data ?? [], filters),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [products.data, filters.min, filters.max, filters.brands.join('|'), filters.q, filters.sort],
  )
  const { items, page, totalPages } = paginate(filtered, filters.page)

  const heading = categories.data?.find((c) => c.slug === filters.category)?.name ?? 'All products'
  const hasFilters = activeCount > 0 || filters.q !== ''

  const goToPage = (p: number) => {
    update({ page: p })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const allProducts = useAsync(() => fetchProducts(''), [], () => peekProducts(''))
  const categoryImages = useMemo(() => {
    const map: Record<string, string> = {}
    for (const p of allProducts.data ?? []) {
      if (!map[p.category]) map[p.category] = p.thumbnail
    }
    return map
  }, [allProducts.data])
  return (
    <>
      <Sidebar open={sidebarOpen} onClose={onCloseSidebar} activeCount={activeCount} onClear={clearAll}>
        <FilterPanel
          categories={categories}
          filters={filters}
          brands={brands}
          brandsLoading={products.loading}
          activeCount={activeCount}
          onChange={update}
          onClear={clearAll}
        />
      </Sidebar>

      <main className="fade-in mx-auto max-w-[1800px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-end gap-x-6 gap-y-3">
          <div>
            <h1 className="text-2xl font-extrabold">{filters.q ? `Results for “${filters.q}”` : heading}</h1>
            <p className="text-sm text-slate-600" aria-live="polite">
              {products.loading ? 'Loading products…' : `${filtered.length} ${filtered.length === 1 ? 'product' : 'products'}`}
              {activeCount > 0 && (
                <>
                  {' · '}
                  {activeCount} {activeCount === 1 ? 'filter' : 'filters'} applied{' '}
                  <button onClick={clearAll} className="font-semibold text-brand hover:underline">
                    Clear
                  </button>
                </>
              )}
            </p>
          </div>

          <div className="order-last w-full min-w-0 lg:order-none lg:mr-6 lg:w-auto lg:flex-1">
            <CategoryChips
              categories={categories.data ?? []}
              images={categoryImages}
              selected={filters.category}
              loading={categories.loading}
              onSelect={(slug) => update({ category: slug, brands: [] })}
            />
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="hidden sm:inline">Sort by</span>
            <SortSelect value={filters.sort} onChange={(sort) => update({ sort })} />
          </div>
        </div>

        <section aria-label="Products">
          {products.error ? (
            <StateMessage tone="error" title="Products didn’t load" message={products.error} action={{ label: 'Try again', onClick: products.retry }} />
          ) : products.loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4" aria-busy="true">
              {Array.from({ length: PAGE_SIZE }, (_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : items.length === 0 ? (
            <StateMessage
              title="No products match these filters"
              message="Try widening the price range or removing a brand."
              action={hasFilters ? { label: 'Clear all filters', onClick: clearAll } : undefined}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {items.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
            </>
          )}
        </section>
      </main>
    </>
  )
}
