import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../context/store'
import { formatPrice } from '../lib/filterProducts'
import type { ProductSummary } from '../types'
import { CartIcon, HeartIcon, UserIcon } from './Icons'

type PanelName = 'wishlist' | 'cart' | 'user'

export function CountBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-extrabold text-ink">
      {count > 99 ? '99+' : count}
    </span>
  )
}

function ItemLink({ product, onClick }: { product: ProductSummary; onClick: () => void }) {
  return (
    <Link to={`/product/${product.id}`} onClick={onClick} className="flex min-w-0 flex-1 gap-3">
      <img src={product.thumbnail} alt="" className="h-14 w-14 shrink-0 rounded bg-slate-50 object-contain" />
      <span className="min-w-0">
        <span className="line-clamp-2 block text-sm font-semibold">{product.title}</span>
        <span className="text-sm font-bold">{formatPrice(product.price)}</span>
      </span>
    </Link>
  )
}

const iconButton = 'relative rounded-md p-2 transition-colors hover:bg-white/10'

export function HeaderActions() {
  const { wishlist, cart, cartCount, cartTotal, removeFromWishlist, setQty, addToCart } = useStore()
  const [open, setOpen] = useState<PanelName | null>(null)
  const wrapper = useRef<HTMLDivElement>(null)

  // Close the panel when clicking elsewhere or pressing Escape.
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e: MouseEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = (name: PanelName) => setOpen((current) => (current === name ? null : name))
  const close = () => setOpen(null)

  return (
    <div ref={wrapper} className="relative flex items-center">
      <button
        type="button"
        className={iconButton}
        aria-label={`Wishlist, ${wishlist.length} items`}
        aria-expanded={open === 'wishlist'}
        onClick={() => toggle('wishlist')}
      >
        <HeartIcon />
        <CountBadge count={wishlist.length} />
      </button>
      <button
        type="button"
        className={iconButton}
        aria-label={`Cart, ${cartCount} items`}
        aria-expanded={open === 'cart'}
        onClick={() => toggle('cart')}
      >
        <CartIcon />
        <CountBadge count={cartCount} />
      </button>
      <button
        type="button"
        className={iconButton}
        aria-label="Your profile"
        aria-expanded={open === 'user'}
        onClick={() => toggle('user')}
      >
        <UserIcon />
      </button>

      {open && (
        <div className="fade-in absolute right-0 top-full z-30 mt-2 max-h-[75vh] w-[min(22rem,92vw)] overflow-y-auto rounded-lg border border-slate-200 bg-white text-ink shadow-xl">
          {open === 'wishlist' && (
            <>
              <h2 className="border-b border-slate-200 px-4 py-3 font-extrabold">Wishlist ({wishlist.length})</h2>
              {wishlist.length === 0 ? (
                <p className="p-4 text-sm text-slate-600">Your wishlist is empty.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {wishlist.map((p) => (
                    <li key={p.id} className="flex gap-3 p-3">
                      <ItemLink product={p} onClick={close} />
                      <div className="flex flex-col items-end justify-between gap-1">
                        <button onClick={() => addToCart(p)} className="text-xs font-semibold text-brand hover:underline">
                          Add to cart
                        </button>
                        <button
                          onClick={() => removeFromWishlist(p.id)}
                          className="text-xs font-semibold text-slate-500 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {open === 'cart' && (
            <>
              <h2 className="border-b border-slate-200 px-4 py-3 font-extrabold">Cart ({cartCount})</h2>
              {cart.length === 0 ? (
                <p className="p-4 text-sm text-slate-600">Your cart is empty.</p>
              ) : (
                <>
                  <ul className="divide-y divide-slate-100">
                    {cart.map(({ product, qty }) => (
                      <li key={product.id} className="flex gap-3 p-3">
                        <ItemLink product={product} onClick={close} />
                        <div className="flex flex-col items-end justify-between gap-1">
                          <div className="flex items-center rounded-md border border-slate-300">
                            <button
                              aria-label={`Decrease quantity of ${product.title}`}
                              onClick={() => setQty(product.id, qty - 1)}
                              className="px-2 py-0.5 hover:bg-slate-100"
                            >
                              −
                            </button>
                            <span className="min-w-6 text-center text-sm font-semibold">{qty}</span>
                            <button
                              aria-label={`Increase quantity of ${product.title}`}
                              onClick={() => setQty(product.id, qty + 1)}
                              className="px-2 py-0.5 hover:bg-slate-100"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => setQty(product.id, 0)}
                            className="text-xs font-semibold text-slate-500 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-slate-200 p-4">
                    <p className="flex justify-between font-extrabold">
                      <span>Total</span>
                      <span>{formatPrice(cartTotal)}</span>
                    </p>
                    {/* <p className="mt-1 text-xs text-slate-500">Checkout isn’t part of this demo.</p> */}
                  </div>
                </>
              )}
            </>
          )}

          {open === 'user' && (
            <div className="p-4">
              <p className="font-extrabold">Hello, Guest</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
