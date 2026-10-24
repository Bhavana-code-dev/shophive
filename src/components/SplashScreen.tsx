import { useEffect, useState } from 'react'

const SHOW_MS = 2300
const TOTAL_MS = 2900

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const hide = window.setTimeout(() => setLeaving(true), SHOW_MS)
    const done = window.setTimeout(onDone, TOTAL_MS)
    return () => {
      window.clearTimeout(hide)
      window.clearTimeout(done)
    }
  }, [onDone])

  return (
    <div
      role="status"
      aria-label="ShopHive is loading"
      className={`fixed inset-0 z-[70] flex flex-col items-center justify-center bg-navy px-6 text-center text-white ${
        leaving ? 'splash-out' : ''
      }`}
    >
      <div className="splash-logo flex items-center gap-4">
        <span className="text-6xl leading-none" aria-hidden="true">🛒</span>
        <span className="text-5xl font-extrabold tracking-tight">ShopHive</span>
      </div>
      <p className="splash-tagline mt-4 text-lg font-medium text-slate-200">Everything you love in one place</p>
      <div className="splash-bar mt-10 h-1 w-40 overflow-hidden rounded-full bg-white/20">
        <span className="block h-full origin-left rounded-full bg-amber-400" />
      </div>
    </div>
  )
}
