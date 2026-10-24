export interface Review {
  rating: number
  comment: string
  date: string
  reviewerName: string
}

export interface ProductSummary {
  id: number
  title: string
  price: number
  rating: number
  thumbnail: string
  brand?: string
  category: string
  discountPercentage?: number
}

export interface Product extends ProductSummary {
  description: string
  stock: number
  images: string[]
  availabilityStatus?: string
  warrantyInformation?: string
  shippingInformation?: string
  returnPolicy?: string
  reviews?: Review[]
}

export interface Category {
  slug: string
  name: string
}

export type SortKey = '' | 'price-asc' | 'price-desc' | 'rating' | 'discount'

export interface Filters {
  category: string
  min: number | null
  max: number | null
  brands: string[]
  q: string
  sort: SortKey
  page: number
}
