import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../context/store'
import { useDebounce } from '../hooks/useDebounce'
import { useProductFilters } from '../hooks/useProductFilters'
import { CountBadge, HeaderActions } from './HeaderActions'
import { MenuIcon } from './Icons'
import { Logo } from './Logo'
import { NotificationBell } from './NotificationBell'

/* ---------- Voice search helpers ---------- */

// The Web Speech API isn't in TypeScript's built-in DOM types, so describe the bits we use.
interface SpeechRecognitionResultLike {
  isFinal: boolean
  0: { transcript: string }
}
interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}
interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}
type SpeechRecognitionCtor = new () => SpeechRecognitionLike

const getSpeechRecognition = (): SpeechRecognitionCtor | null => {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

function MicIcon({ listening }: { listening: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill={listening ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <path d="M12 18v4" />
      <path d="M8 22h8" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

/* ---------- Search bar ---------- */
const SEARCH_WORDS = ['Beauty', 'Fragrances', 'Furniture', 'Groceries', 'Home Decoration', 'Kitchen Accessories', 'Watches']
function SearchBar() {
  const [params] = useSearchParams()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { update } = useProductFilters()
  const { notify } = useStore()
  const urlQ = params.get('q') ?? ''
  const onListing = pathname === '/'

  const [value, setValue] = useState(urlQ)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const debounced = useDebounce(value, 300)

  // Hide the mic entirely on browsers without speech recognition (e.g. Firefox).
  const voiceSupported = typeof window !== 'undefined' && getSpeechRecognition() !== null
  const [wordIndex, setWordIndex] = useState(0)

  // Rotate the category word only while the box is empty and idle.
  useEffect(() => {
    if (value || listening) return undefined
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const id = window.setInterval(() => setWordIndex((i) => (i + 1) % SEARCH_WORDS.length), 2500)
    return () => window.clearInterval(id)
  }, [value, listening])
  
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

  // Stop the microphone if the header unmounts mid-recording.
  useEffect(() => () => recognitionRef.current?.abort(), [])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    apply(value)
  }

  const toggleVoice = () => {
    // Tapping again while listening stops it.
    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    const Ctor = getSpeechRecognition()
    if (!Ctor) return

    const rec = new Ctor()
    rec.lang = navigator.language || 'en-US'
    rec.interimResults = true // show words as they are spoken
    rec.continuous = false // stop automatically after a pause

    let finalText = ''

    rec.onresult = (e) => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript
        if (e.results[i].isFinal) finalText += text
        else interim += text
      }
      setValue((finalText + interim).trim())
    }

    rec.onerror = (e) => {
      // 'aborted' just means we stopped it ourselves.
      if (e.error === 'aborted') return
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        notify('Microphone access is blocked. Allow it in your browser settings to use voice search.')
      } else if (e.error === 'no-speech') {
        notify('Didn’t catch that. Try again.')
      } else if (e.error === 'audio-capture') {
        notify('No microphone found.')
      } else {
        notify('Voice search isn’t available right now.')
      }
    }

    rec.onend = () => {
      setListening(false)
      recognitionRef.current = null
      // Search straight away with whatever was heard, no need to wait for the debounce.
      const text = finalText.trim()
      if (text) apply(text)
    }

    recognitionRef.current = rec
    try {
      rec.start()
      setListening(true)
    } catch {
      // start() throws if a session is already running
      setListening(false)
    }
  }

   return (
    <form role="search" onSubmit={submit} className="min-w-0 flex-1">
      <div className="relative w-full max-w-xl">
        <button
          type="submit"
          aria-label="Search"
          className="absolute left-1.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-500 transition-colors hover:text-ink"
        >
          <SearchIcon />
        </button>

                <input
          type="search"
          aria-label="Search products"
          placeholder={listening ? 'Listening…' : ''}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={`w-full rounded-md bg-white py-2 pl-10 text-sm text-ink placeholder:text-slate-500 ${
            voiceSupported ? 'pr-11' : 'pr-3.5'
          }`}
        />

        {!value && !listening && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-10 right-12 flex items-center gap-1 overflow-hidden whitespace-nowrap text-sm text-slate-500"
          >
            Search
            <span key={wordIndex} className="word-in font-semibold">
              {SEARCH_WORDS[wordIndex]}
            </span>
          </span>
        )}

        {voiceSupported && (
          <button
            type="button"
            onClick={toggleVoice}
            aria-label={listening ? 'Stop voice search' : 'Search by voice'}
            aria-pressed={listening}
            title={listening ? 'Stop listening' : 'Search by voice'}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-colors ${
              listening
                ? 'animate-pulse bg-red-100 text-red-600'
                : 'text-slate-600 hover:bg-slate-100 hover:text-ink'
            }`}
          >
            <MicIcon listening={listening} />
          </button>
        )}
      </div>
    </form>
  )
}

/* ---------- Header ---------- */

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
        <div className="flex items-center">
          <NotificationBell />
          <HeaderActions />
        </div>
      </div>
    </header>
  )
}