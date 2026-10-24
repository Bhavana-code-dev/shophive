import type { Category } from '../types'

interface Props {
  categories: Category[]
  images: Record<string, string>
  selected: string
  loading: boolean
  onSelect: (slug: string) => void
}

export function CategoryChips({ categories, images, selected, loading, onSelect }: Props) {
  if (loading) {
    return (
      <div className="flex gap-2 overflow-hidden rounded-full border border-slate-300 bg-white p-1.5 shadow-sm" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-[38px] w-28 shrink-0 animate-pulse rounded-full bg-slate-200" />
        ))}
      </div>
    )
  }

  return (
    <nav aria-label="Categories" className="relative overflow-hidden rounded-full border border-slate-300 bg-white shadow-sm">
      <ul className="flex gap-2 overflow-x-auto p-1.5 pr-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[{ slug: '', name: 'All' }, ...categories].map((c) => {
          const active = selected === c.slug
          return (
            <li key={c.slug || 'all'} className="shrink-0">
              <button
                onClick={() => onSelect(c.slug)}
                aria-pressed={active}
                className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm font-medium transition-colors ${
                  active
                    ? 'border-navy bg-navy text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-navy hover:text-navy'
                }`}
              >
                {c.slug && images[c.slug] ? (
                  <img
                    src={images[c.slug]}
                    alt=""
                    loading="lazy"
                    className="h-7 w-7 rounded-full bg-slate-100 object-cover"
                  />
                ) : (
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-xs ${
                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {c.slug ? c.name[0] : '★'}
                  </span>
                )}
                <span className="whitespace-nowrap">{c.name}</span>
              </button>
            </li>
          )
        })}
      </ul>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent" />
    </nav>
  )
}