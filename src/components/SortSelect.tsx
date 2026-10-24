import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import type { SortKey } from '../types'

const OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: '', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'discount', label: 'Biggest discount' },
]

interface Props {
  value: SortKey
  onChange: (value: SortKey) => void
}

/** Styled replacement for <select>, with full keyboard support (arrows, Home/End, Enter, Esc). */
export function SortSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const wrapper = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selectedIndex = Math.max(0, OPTIONS.findIndex((o) => o.value === value))

  // Close when clicking anywhere outside.
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e: MouseEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const openMenu = () => {
    setActive(selectedIndex)
    setOpen(true)
  }

  const choose = (index: number) => {
    onChange(OPTIONS[index].value)
    setOpen(false)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (open) setActive((i) => Math.min(OPTIONS.length - 1, i + 1))
        else openMenu()
        break
      case 'ArrowUp':
        e.preventDefault()
        if (open) setActive((i) => Math.max(0, i - 1))
        else openMenu()
        break
      case 'Home':
        if (open) {
          e.preventDefault()
          setActive(0)
        }
        break
      case 'End':
        if (open) {
          e.preventDefault()
          setActive(OPTIONS.length - 1)
        }
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (open) choose(active)
        else openMenu()
        break
      case 'Escape':
        if (open) {
          e.preventDefault()
          setOpen(false)
        }
        break
      case 'Tab':
        setOpen(false)
        break
    }
  }

  return (
    <div ref={wrapper} className="relative">
      <button
        type="button"
        role="combobox"
        aria-label="Sort by"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        className={`flex items-center gap-2 rounded-full border bg-white py-2 pl-4 pr-3 text-sm font-semibold text-ink shadow-sm transition-colors hover:border-slate-400 ${
          open ? 'border-brand' : 'border-slate-300'
        }`}
      >
        {OPTIONS[selectedIndex].label}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Sort by"
          className="fade-in absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          {OPTIONS.map((option, i) => {
            const selected = option.value === value
            return (
              <li
                key={option.label}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()} // keep keyboard focus on the button
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center justify-between px-4 py-2 text-sm ${
                  i === active ? 'bg-slate-100' : ''
                } ${selected ? 'font-bold text-brand' : ''}`}
              >
                {option.label}
                {selected && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}