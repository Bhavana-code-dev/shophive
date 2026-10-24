import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { fetchProduct } from '../api/products'
import { useNavigateWithLoader } from '../context/loader'
import { useStore } from '../context/store'
import { formatPrice } from '../lib/filterProducts'
import type { ProductSummary } from '../types'
import { FadeImage } from './FadeImage'
import { HeartIcon } from './Icons'
import { Rating } from './Rating'

export function ProductCard({ product }: { product: ProductSummary }) {
  const go = useNavigateWithLoader()
  const { isWished, toggleWishlist } = useStore()
  const wished = isWished(product.id)

  const open = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    go(`/product/${product.id}`, { state: { fromListing: true } }, fetchProduct(product.id))
  }

  return (
    <div className="relative h-full overflow-hidden rounded-lg border border-slate-200 bg-white transition duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md">
      <Link to={`/product/${product.id}`} state={{ fromListing: true }} onClick={open} className="flex h-full flex-col">
        <div className="aspect-square bg-slate-50 p-4">
          <FadeImage src={product.thumbnail} alt={product.title} loading="lazy" className="h-full w-full object-contain" />
        </div>
        <div className="flex flex-1 flex-col gap-1.5 p-3">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{product.title}</h3>
          <p className="mt-auto text-lg font-extrabold">{formatPrice(product.price)}</p>
          <Rating value={product.rating} />
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggleWishlist(product)}
        aria-pressed={wished}
        aria-label={wished ? `Remove ${product.title} from wishlist` : `Add ${product.title} to wishlist`}
        className={`absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow transition duration-150 hover:scale-110 hover:bg-white active:scale-95 ${
          wished ? 'text-red-500' : 'text-slate-500 hover:text-red-500'
        }`}
      >
        <HeartIcon filled={wished} width={20} height={20} />
      </button>
    </div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-slate-200 bg-white" aria-hidden="true">
      <div className="aspect-square bg-slate-100" />
      <div className="space-y-2 p-3">
        <div className="h-3.5 w-4/5 rounded bg-slate-200" />
        <div className="h-5 w-1/3 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
      </div>
    </div>
  )
}