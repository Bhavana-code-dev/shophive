interface Props {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

const arrow =
  'flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40'

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  )
}

/** Simple pager: previous chevron, the current page number, next chevron. */
export function Pagination({ page, totalPages, onChange }: Props) {
  if (totalPages <= 1) return null
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-3">
      <button className={arrow} disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <Chevron direction="left" />
      </button>
      <span
        aria-current="page"
        title={`Page ${page} of ${totalPages}`}
        className="flex h-9 min-w-9 items-center justify-center rounded-md bg-brand px-3 text-sm font-bold text-white"
      >
        <span className="sr-only">Page </span>
        {page}
        <span className="sr-only"> of {totalPages}</span>
      </span>
      <button className={arrow} disabled={page === totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
        <Chevron direction="right" />
      </button>
    </nav>
  )
}