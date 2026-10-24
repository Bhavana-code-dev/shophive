import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { ProductSummary } from '../types'
import { StoreContext, toSummary, type CartItem, type StoreValue } from './store'

const STORAGE_KEY = 'shophive:store:v1'

function load(): { wishlist: ProductSummary[]; cart: CartItem[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { wishlist?: ProductSummary[]; cart?: CartItem[] }
      return {
        wishlist: Array.isArray(parsed.wishlist) ? parsed.wishlist : [],
        cart: Array.isArray(parsed.cart) ? parsed.cart : [],
      }
    }
  } catch {
    // Storage blocked or corrupt: start with empty lists.
  }
  return { wishlist: [], cart: [] }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<ProductSummary[]>(() => load().wishlist)
  const [cart, setCart] = useState<CartItem[]>(() => load().cart)
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef(0)

  // Remember the wishlist and cart between visits.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ wishlist, cart }))
    } catch {
      // Ignore: the app still works, it just won't remember.
    }
  }, [wishlist, cart])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const notify = useCallback((message: string) => {
    setToast(message)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 2400)
  }, [])

  const toggleWishlist = useCallback(
    (product: ProductSummary) => {
      const exists = wishlist.some((p) => p.id === product.id)
      setWishlist((list) => (exists ? list.filter((p) => p.id !== product.id) : [...list, toSummary(product)]))
      notify(exists ? 'Removed from wishlist' : 'Added to wishlist')
    },
    [wishlist, notify],
  )

  const removeFromWishlist = useCallback((id: number) => setWishlist((list) => list.filter((p) => p.id !== id)), [])

  const addToCart = useCallback(
    (product: ProductSummary) => {
      setCart((items) =>
        items.some((i) => i.product.id === product.id)
          ? items.map((i) => (i.product.id === product.id ? { ...i, qty: Math.min(99, i.qty + 1) } : i))
          : [...items, { product: toSummary(product), qty: 1 }],
      )
      notify('Added to cart')
    },
    [notify],
  )

  const setQty = useCallback(
    (id: number, qty: number) =>
      setCart((items) =>
        qty <= 0
          ? items.filter((i) => i.product.id !== id)
          : items.map((i) => (i.product.id === id ? { ...i, qty: Math.min(99, qty) } : i)),
      ),
    [],
  )

  const value: StoreValue = useMemo(
    () => ({
      wishlist,
      cart,
      cartCount: cart.reduce((n, i) => n + i.qty, 0),
      cartTotal: cart.reduce((sum, i) => sum + i.qty * i.product.price, 0),
      isWished: (id: number) => wishlist.some((p) => p.id === id),
      toggleWishlist,
      removeFromWishlist,
      addToCart,
      setQty,
      notify,
    }),
    [wishlist, cart, toggleWishlist, removeFromWishlist, addToCart, setQty, notify],
  )

  return (
    <StoreContext.Provider value={value}>
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fade-in fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </StoreContext.Provider>
  )
}
