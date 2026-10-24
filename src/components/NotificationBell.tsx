import { useEffect, useRef, useState } from 'react'
import { useStore } from '../context/store'
import { CountBadge } from './HeaderActions'
import { BellIcon } from './Icons'

interface Offer {
  id: string
  icon: string
  tag: string
  title: string
  text: string
  code: string
}

// Sample content for the demo. Swap these for real offers (or an API) later.
const OFFERS: Offer[] = [
  {
    id: 'diwali',
    icon: '🪔',
    tag: 'Festive sale',
    title: 'Diwali Sale: up to 40% off',
    text: 'Home décor, fragrances and gifts. Limited time only.',
    code: 'DIWALI40',
  },
  {
    id: 'sbi',
    icon: '💳',
    tag: 'Bank offer',
    title: 'SBI Credit Card: 10% instant discount',
    text: 'On orders above $100. Terms and conditions apply.',
    code: 'SBI10',
  },
  {
    id: 'shipping',
    icon: '🚚',
    tag: 'New customers',
    title: 'Free delivery on your first order',
    text: 'No minimum order value.',
    code: 'WELCOME',
  },
  {
    id: 'prepaid',
    icon: '🎁',
    tag: 'Payment offer',
    title: 'Extra 5% off on prepaid orders',
    text: 'Pay online and save on every order this week.',
    code: 'PREPAID5',
  },
]

const SEEN_KEY = 'shophive:offers-seen:v1'

function readSeen(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

export function NotificationBell() {
  const { notify } = useStore()
  const [open, setOpen] = useState(false)
  const [seen, setSeen] = useState(readSeen)
  const wrapper = useRef<HTMLDivElement>(null)

  // Close when clicking elsewhere or pressing Escape.
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e: MouseEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = () => {
    setOpen((o) => !o)
    if (!seen) {
      setSeen(true)
      try {
        localStorage.setItem(SEEN_KEY, '1')
      } catch {
        // Storage blocked: the badge simply comes back next visit.
      }
    }
  }

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      notify(`Code ${code} copied`)
    } catch {
      notify(`Use code ${code}`)
    }
  }

  const unread = seen ? 0 : OFFERS.length

  return (
    <div ref={wrapper} className="relative flex items-center">
      <button
        type="button"
        onClick={toggle}
        aria-label={unread > 0 ? `Notifications, ${unread} new` : 'Notifications'}
        aria-expanded={open}
        className="relative rounded-md p-2 transition-colors hover:bg-white/10"
      >
        <BellIcon />
        <CountBadge count={unread} />
      </button>

      {open && (
        <div
        className="
      fixed inset-x-2 top-[4.5rem] z-50 max-h-[calc(100dvh-5.5rem)] overflow-y-auto
      rounded-xl border border-slate-200 bg-white shadow-lg
      sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96 sm:max-h-[28rem]
    ">
          <h2 className="border-b border-slate-200 px-4 py-3 font-extrabold">Offers for you</h2>
          <ul className="divide-y divide-slate-100">
            {OFFERS.map((o) => (
              <li key={o.id} className="flex gap-3 p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-amber-50 text-2xl" aria-hidden="true">
                  {o.icon}
                </span>
                <div className="min-w-0">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    {o.tag}
                  </span>
                  <p className="mt-1 text-sm font-bold">{o.title}</p>
                  <p className="text-sm text-slate-600">{o.text}</p>
                  <button
                    type="button"
                    onClick={() => copy(o.code)}
                    aria-label={`Copy code ${o.code}`}
                    className="mt-2 rounded-md border border-dashed border-navy px-2.5 py-1 text-xs font-bold text-navy transition-colors hover:bg-slate-50"
                  >
                    Code: {o.code} · Copy
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {/* <p className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
            Sample offers for this demo. Codes aren’t applied at checkout.
          </p> */}
        </div>
      )}
    </div>
  )
}