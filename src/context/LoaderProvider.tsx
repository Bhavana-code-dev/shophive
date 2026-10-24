import { useCallback, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoaderContext, type GoWithLoader } from './loader'

const MIN_VISIBLE_MS = 800
const FADE_OUT_MS = 350

export function LoaderProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const busy = useRef(false)

  const go = useCallback<GoWithLoader>(
    (to, options, prefetch) => {
      if (busy.current) return
      busy.current = true
      setLeaving(false)
      setVisible(true)

      const minimum = new Promise((resolve) => window.setTimeout(resolve, MIN_VISIBLE_MS))
      // A failed prefetch is fine: the product page shows its own error state with a retry button.
      Promise.all([minimum, prefetch?.catch(() => undefined)]).then(() => {
        navigate(to, options)
        setLeaving(true)
        window.setTimeout(() => {
          setVisible(false)
          busy.current = false
        }, FADE_OUT_MS)
      })
    },
    [navigate],
  )

  return (
    <LoaderContext.Provider value={go}>
      {children}
      {visible && (
        <div
          role="status"
          aria-label="Loading product"
          className={`overlay-in fixed inset-0 z-[60] flex flex-col items-center justify-center gap-5 bg-white/90 backdrop-blur-sm transition-opacity duration-300 ${
            leaving ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-slate-200 border-t-brand" />
            <div className="absolute inset-0 flex animate-pulse items-center justify-center text-4xl" aria-hidden="true">
              🛒
            </div>
          </div>
          <p className="text-lg font-extrabold tracking-tight text-navy">ShopHive</p>
        </div>
      )}
    </LoaderContext.Provider>
  )
}
