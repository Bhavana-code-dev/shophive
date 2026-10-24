import { useEffect, useRef, type ReactNode } from 'react'
import { CloseIcon } from './Icons'
import { ClearFiltersButton } from './FilterPanel'

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
  activeCount: number
  onClear: () => void

}

export function Sidebar({ open, onClose, activeCount, onClear,children }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    closeRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-30 bg-black/30 transition-[opacity,visibility] duration-300 ${
          open ? 'visible opacity-100' : 'invisible opacity-0'
        }`}
      />
      <aside
        aria-label="Filters"
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(20rem,88vw)] flex-col bg-slate-50 shadow-xl transition-[translate,transform,visibility] duration-300 ease-out ${
          open ? 'visible translate-x-0' : 'invisible -translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between bg-navy px-4 py-3 text-white">
          <span className="flex items-center gap-2 text-lg font-extrabold">
            {/* <span aria-hidden="true">🛒</span> */}
            Filters
          </span>
            <div className="flex items-center gap-1">
            <ClearFiltersButton count={activeCount} onClear={onClear} />
            <button
              ref={closeRef}
              onClick={onClose}
              aria-label="Close filters"
              className="rounded-md p-1 hover:bg-white/10"
            >
              <CloseIcon />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </aside>
    </>
  )
}
