export function Rating({ value, count }: { value: number; count?: number }) {
  const pct = (Math.max(0, Math.min(5, value)) / 5) * 100
  return (
    <span className="inline-flex items-center gap-1.5" role="img" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      <span className="relative inline-block text-[15px] leading-none" aria-hidden="true">
        <span className="text-slate-300">★★★★★</span>
        <span className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap text-amber-500" style={{ width: `${pct}%` }}>
          ★★★★★
        </span>
      </span>
      <span className="text-xs font-semibold text-slate-600">{value.toFixed(1)}</span>
      {count !== undefined && <span className="text-xs text-slate-500">({count})</span>}
    </span>
  )
}
