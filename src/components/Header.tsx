import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useDebounce } from '../hooks/useDebounce'
import { useProductFilters } from '../hooks/useProductFilters'
import { CountBadge, HeaderActions } from './HeaderActions'
import { MenuIcon } from './Icons'
import { Logo } from './Logo'

function SearchBar() {
  const [params] = useSearchParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { update } = useProductFilters()
  const urlQ = params.get('q') ?? ''
  const onListing = pathname === '/'

  const [value, setValue] = useState(urlQ)
  const debounced = useDebounce(value, 300)

  // Keep the box in sync when the URL changes elsewhere (e.g. "Clear all").
  useEffect(() => {
    setValue(urlQ)
  }, [urlQ])

  const apply = (q: string) => {
    if (onListing) update({ q })
    else if (q.trim()) navigate(`/?q=${encodeURIComponent(q.trim())}`)
  }

  // Live search once the user pauses typing.
  useEffect(() => {
    if (debounced !== value || debounced.trim() === urlQ.trim()) return
    apply(debounced)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    apply(value)
  }

  return (
    <form role="search" onSubmit={submit} className="min-w-0 flex-1">
      <input
        type="search"
        aria-label="Search products"
        placeholder="Search products by name or brand"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full max-w-xl rounded-md bg-white px-3.5 py-2 text-sm text-ink placeholder:text-slate-500"
      />
    </form>
  )
}

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { pathname } = useLocation()
  const { activeCount } = useProductFilters()

  return (
    <header className="sticky top-0 z-20 bg-navy text-white">
      <div className="mx-auto flex max-w-[1800px] items-center gap-2 px-4 py-3 sm:gap-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open filters menu"
          className="relative rounded-md p-2 transition-colors hover:bg-white/10"
        >
          <MenuIcon />
          {pathname === '/' && <CountBadge count={activeCount} />}
        </button>
        <Link to="/" aria-label="ShopHive home">
          <Logo />
        </Link>
        <SearchBar />
        <HeaderActions />
      </div>
    </header>
  )
}
