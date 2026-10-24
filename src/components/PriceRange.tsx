interface Props {
  min: number
  max: number
  step?: number
  value: [number, number]
  onChange: (value: [number, number]) => void
}

export function PriceRange({ min, max, step = 1, value, onChange }: Props) {
  const [lo, hi] = value
  const pct = (v: number) => ((v - min) / (max - min)) * 100

  return (
    <div className="px-1">
      <div className="mb-3 flex justify-between text-sm font-semibold text-slate-700">
        <span>₹{lo}</span>
        <span>₹{hi}</span>
      </div>

      <div className="relative h-5">
        {/* grey line */}
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-300" />
        {/* selected part (navy) */}
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-navy"
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />

        {/* min dot */}
        <input
          type="range"
          aria-label="Minimum price"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
          className="price-range-input"
          style={{ zIndex: lo > max - (max - min) / 10 ? 5 : 3 }}
        />
        {/* max dot */}
        <input
          type="range"
          aria-label="Maximum price"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
          className="price-range-input"
          style={{ zIndex: 4 }}
        />
      </div>
    </div>
  )
}