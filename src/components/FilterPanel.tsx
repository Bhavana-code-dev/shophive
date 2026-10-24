import { useState, type FormEvent } from 'react'
import type { Category, Filters } from '../types'

interface Props {
  categories: { data: Category[] | null; loading: boolean; error: string | null; retry: () => void }
  filters: Filters
  brands: string[]
  brandsLoading: boolean
  activeCount: number
  onChange: (patch: Partial<Filters>) => void
  onClear: () => void
}

const inputCls = 'w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm'

function PriceRange({ min, max, onApply }: { min: number | null; max: number | null; onApply: (min: number | null, max: number | null) => void }) {
  const [lo, setLo] = useState(min === null ? '' : String(min))
  const [hi, setHi] = useState(max === null ? '' : String(max))
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const a = lo.trim() === '' ? null : Number(lo)
    const b = hi.trim() === '' ? null : Number(hi)
    if ((a !== null && (!Number.isFinite(a) || a < 0)) || (b !== null && (!Number.isFinite(b) || b < 0))) {
      return setError('Enter prices of 0 or more.')
    }
    if (a !== null && b !== null && a > b) return setError('Minimum price cannot be higher than maximum.')
    setError('')
    onApply(a, b)
  }

  return (
    <form onSubmit={submit} noValidate>
      <fieldset>
        <legend className="mb-2 text-sm font-bold">Price range</legend>
        <div className="flex gap-2">
          <input aria-label="Minimum price" inputMode="decimal" placeholder="Min" value={lo} onChange={(e) => setLo(e.target.value)} className={inputCls} />
          <input aria-label="Maximum price" inputMode="decimal" placeholder="Max" value={hi} onChange={(e) => setHi(e.target.value)} className={inputCls} />
        </div>
        {error && <p role="alert" className="mt-1.5 text-xs text-red-700">{error}</p>}
        <button type="submit" className="mt-2 w-full rounded-md bg-brand py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
          Apply
        </button>
      </fieldset>
    </form>
  )
}

export function FilterPanel({ categories, filters, brands, brandsLoading, activeCount, onChange, onClear }: Props) {
  const brandOptions = [...new Set([...brands, ...filters.brands])].sort((a, b) => a.localeCompare(b))
  const toggleBrand = (b: string) =>
    onChange({ brands: filters.brands.includes(b) ? filters.brands.filter((x) => x !== b) : [...filters.brands, b] })

  return (
    <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-extrabold">Filters</h2>
        {activeCount > 0 && (
          <button onClick={onClear} className="text-sm font-semibold text-brand hover:underline">
            Clear all
          </button>
        )}
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-bold">Category</legend>
        {categories.error ? (
          <p className="text-sm text-red-700">
            Couldn’t load categories.{' '}
            <button onClick={categories.retry} className="font-semibold underline">Retry</button>
          </p>
        ) : categories.loading ? (
          <p className="text-sm text-slate-500">Loading categories…</p>
        ) : (
          <ul className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {[{ slug: '', name: 'All categories' }, ...(categories.data ?? [])].map((c) => (
              <li key={c.slug || 'all'}>
                <label className="flex cursor-pointer items-center gap-2 py-0.5 text-sm">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === c.slug}
                    onChange={() => onChange({ category: c.slug, brands: [] })}
                    className="accent-blue-600"
                  />
                  {c.name}
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <PriceRange key={`${filters.min}-${filters.max}`} min={filters.min} max={filters.max} onApply={(min, max) => onChange({ min, max })} />

      <fieldset>
        <legend className="mb-2 text-sm font-bold">Brand</legend>
        {brandsLoading ? (
          <p className="text-sm text-slate-500">Loading brands…</p>
        ) : brandOptions.length === 0 ? (
          <p className="text-sm text-slate-500">No brands for this category.</p>
        ) : (
          <ul className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {brandOptions.map((b) => (
              <li key={b}>
                <label className="flex cursor-pointer items-center gap-2 py-0.5 text-sm">
                  <input type="checkbox" checked={filters.brands.includes(b)} onChange={() => toggleBrand(b)} className="accent-blue-600" />
                  {b}
                </label>
              </li>
            ))}
          </ul>
        )}
      </fieldset>
    </div>
  )
}
