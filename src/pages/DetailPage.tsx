import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { fetchProduct, fetchRelatedProducts, peekProduct } from '../api/products'
import { FadeImage } from '../components/FadeImage'
import { HeartIcon, ShareIcon } from '../components/Icons'
import { Pagination } from '../components/Pagination'
import { ProductCard } from '../components/ProductCard'
import { Rating } from '../components/Rating'
import { StateMessage } from '../components/StateMessage'
import { useStore } from '../context/store'
import { useAsync } from '../hooks/useAsync'
import { formatPrice, paginate } from '../lib/filterProducts'
import type { Product } from '../types'

const REVIEWS_PER_PAGE = 3
// const SPIN_MS = 2400 // keep in sync with .spin-y in index.css
const titleCase = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

function Gallery({ product }: { product: Product }) {
  const images = product.images.length > 0 ? product.images : [product.thumbnail]
  const [active, setActive] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  // const rotate = () => {
  //   if (spinning) return
  //   setSpinning(true)
  //   timer.current = window.setTimeout(() => setSpinning(false), SPIN_MS)
  // }

  const select = (i: number) => {
    window.clearTimeout(timer.current)
    setSpinning(false)
    setActive(i)
  }

  return (
    <div>
      <div className="relative aspect-square rounded-lg border border-slate-200 bg-white p-6 [perspective:900px]">
        <FadeImage
          key={images[active]}
          src={images[active]}
          alt={product.title}
          className={`h-full w-full object-contain ${spinning ? 'spin-y' : ''}`}
        />
        {/* <button
          type="button"
          onClick={rotate}
          disabled={spinning}
          aria-label="Rotate product 360 degrees"
          className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:text-brand disabled:opacity-60"
        > */}
          {/* <RotateIcon width={16} height={16} />
          360° */}
        {/* </button> */}
      </div>
      {images.length > 1 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {images.map((src, i) => (
            <li key={src}>
              <button
                onClick={() => select(i)}
                aria-label={`Show image ${i + 1}`}
                aria-pressed={i === active}
                className={`h-16 w-16 rounded-md border bg-white p-1 ${i === active ? 'border-brand' : 'border-slate-200'}`}
              >
                <img src={src} alt="" className="h-full w-full object-contain" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Reviews({ product }: { product: Product }) {
  const [page, setPage] = useState(1)
  const reviews = product.reviews ?? []
  if (reviews.length === 0) return <p className="text-sm text-slate-600">No reviews yet.</p>
  const { items, page: current, totalPages } = paginate(reviews, page, REVIEWS_PER_PAGE)
  return (
    <>
      <ul className="space-y-3">
        {items.map((r, i) => (
          <li key={`${r.reviewerName}-${r.date}-${i}`} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-bold">{r.reviewerName}</span>
              <Rating value={r.rating} />
              <time dateTime={r.date} className="text-xs text-slate-500">
                {new Date(r.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </time>
            </div>
            <p className="mt-1.5 text-sm text-slate-700">{r.comment}</p>
          </li>
        ))}
      </ul>
      <Pagination page={current} totalPages={totalPages} onChange={setPage} />
    </>
  )
}

function RelatedProducts({ category, currentId }: { category: string; currentId: number }) {
  const { data, loading, error } = useAsync(
    () => fetchRelatedProducts(category, currentId),
    [category, currentId],
  )

  // Suggestions are a bonus, so hide the section if it fails or comes back empty
  if (error || (!loading && (!data || data.length === 0))) return null

  return (
    <section className="mt-12" aria-labelledby="related-heading">
      <h2 id="related-heading" className="mb-3 text-xl font-extrabold">
        You might also like
      </h2>

      {loading ? (
        <div className="grid animate-pulse grid-cols-2 gap-4 md:grid-cols-4" aria-busy="true" aria-label="Loading suggestions">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-lg bg-slate-200" />
          ))}
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {data!.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function DetailSkeleton() {
  return (
    <div className="grid animate-pulse gap-8 md:grid-cols-2" aria-busy="true" aria-label="Loading product">
      <div className="aspect-square rounded-lg bg-slate-200" />
      <div className="space-y-4">
        <div className="h-8 w-3/4 rounded bg-slate-200" />
        <div className="h-6 w-1/4 rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-200" />
        <div className="h-24 rounded bg-slate-200" />
      </div>
    </div>
  )
}

export default function DetailPage() {
  const { id } = useParams()
  const productId = Number(id)
  const navigate = useNavigate()
  const location = useLocation()
  const { addToCart, toggleWishlist, isWished, notify } = useStore()
  const { data: product, loading, error, retry } = useAsync(() => fetchProduct(productId), [productId], () => peekProduct(productId))

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [productId])
  useEffect(() => {
    if (product) document.title = `${product.title} | ShopHive`
    return () => {
      document.title = 'ShopHive'
    }
  }, [product])

  // Came from the listing? Step back in history so the exact filtered view
  // (URL query + scroll position) is restored. Deep link? Go to the listing.
  const goBack = () => (location.state?.fromListing ? navigate(-1) : navigate('/'))

  // const buyNow = () => {
  //   if (!product) return
  //   addToCart(product)
  //   notify('Added to cart. Checkout isn’t part of this demo.')
  // }

  // Phones get the native share sheet; desktops copy the link (a predictable result).
  const share = async () => {
    if (!product) return
    const url = window.location.href
    try {
      if (typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches) {
        await navigator.share({ title: product.title, text: `${product.title} on ShopHive`, url })
        return
      }
      await navigator.clipboard.writeText(url)
      notify('Link copied to clipboard')
    } catch (err) {
      if ((err as DOMException).name !== 'AbortError') notify('Couldn’t share. Copy the link from the address bar.')
    }
  }

  const original =
    product?.discountPercentage && product.discountPercentage > 0
      ? product.price / (1 - product.discountPercentage / 100)
      : null
  const wished = product ? isWished(product.id) : false
  const inStock = product ? product.stock > 0 : false

  return (
    <main className="fade-in mx-auto max-w-6xl px-4 py-6">
      <button onClick={goBack} className="mb-5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold hover:bg-slate-100">
        ← Back to products
      </button>

      {loading ? (
        <DetailSkeleton />
      ) : error || !product ? (
        <StateMessage
          tone="error"
          title="We couldn’t load this product"
          message={error ?? undefined}
          action={{ label: 'Try again', onClick: retry }}
        />
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-2">
            <Gallery key={product.id} product={product} />
            <div>
              <h1 className="text-3xl font-extrabold leading-tight">{product.title}</h1>
              <div className="mt-2">
                <Rating value={product.rating} count={product.reviews?.length} />
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-extrabold">{formatPrice(product.price)}</span>
                {original && (
                  <>
                    <s className="text-slate-500">{formatPrice(original)}</s>
                    <span className="text-sm font-bold text-green-700">{Math.round(product.discountPercentage!)}% off</span>
                  </>
                )}
              </div>

              <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
                <dt className="font-bold">Brand</dt>
                <dd>{product.brand ?? 'Not specified'}</dd>
                <dt className="font-bold">Category</dt>
                <dd>
                  <Link to={`/?category=${encodeURIComponent(product.category)}`} className="text-brand hover:underline">
                    {titleCase(product.category)}
                  </Link>
                </dd>
                <dt className="font-bold">Availability</dt>
                <dd className={inStock ? 'text-green-700' : 'text-red-700'}>
                  {product.availabilityStatus ?? (inStock ? 'In stock' : 'Out of stock')}
                </dd>
                {product.shippingInformation && (<><dt className="font-bold">Shipping</dt><dd>{product.shippingInformation}</dd></>)}
                {product.warrantyInformation && (<><dt className="font-bold">Warranty</dt><dd>{product.warrantyInformation}</dd></>)}
              </dl>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => addToCart(product)}
                  disabled={!inStock}
                  className="rounded-md border-2 border-brand px-5 py-2.5 font-bold text-brand transition-colors hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Add to cart
                </button>
                <button
                  // onClick={buyNow}
                  disabled={!inStock}
                  className="rounded-md bg-amber-400 px-5 py-2.5 font-bold text-ink transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Buy now
                </button>
                <button
                  onClick={() => toggleWishlist(product)}
                  aria-pressed={wished}
                  aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`rounded-md border p-2.5 transition-colors ${
                    wished ? 'border-red-300 bg-red-50 text-red-600' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <HeartIcon filled={wished} />
                </button>
                <button
                  onClick={share}
                  aria-label="Share this product"
                  className="rounded-md border border-slate-300 bg-white p-2.5 text-slate-600 transition-colors hover:bg-slate-100"
                >
                  <ShareIcon />
                </button>
              </div>

              <h2 className="mt-8 text-lg font-bold">Description</h2>
              <p className="mt-1 max-w-prose text-slate-700">{product.description}</p>
            </div>
          </div>

          <section className="mt-12 max-w-3xl" aria-label="Reviews">
            <h2 className="mb-3 text-xl font-extrabold">Reviews</h2>
            <Reviews key={product.id} product={product} />
          </section>

          <RelatedProducts category={product.category} currentId={product.id} />
        </>
      )}
    </main>
  )
}