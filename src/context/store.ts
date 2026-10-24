import { createContext, useContext } from 'react'
import type { ProductSummary } from '../types'

export interface CartItem {
  product: ProductSummary
  qty: number
}

export interface StoreValue {
  wishlist: ProductSummary[]
  cart: CartItem[]
  cartCount: number
  cartTotal: number
  isWished: (id: number) => boolean
  toggleWishlist: (product: ProductSummary) => void
  removeFromWishlist: (id: number) => void
  addToCart: (product: ProductSummary) => void
  setQty: (id: number, qty: number) => void
  notify: (message: string) => void
}

export const StoreContext = createContext<StoreValue | null>(null)

export function useStore(): StoreValue {
  const value = useContext(StoreContext)
  if (!value) throw new Error('useStore must be used inside <StoreProvider>')
  return value
}

/** Keep only what the wishlist/cart need (small, safe to save in localStorage). */
export const toSummary = (p: ProductSummary): ProductSummary => ({
  id: p.id,
  title: p.title,
  price: p.price,
  rating: p.rating,
  thumbnail: p.thumbnail,
  brand: p.brand,
  category: p.category,
  discountPercentage: p.discountPercentage,
})
