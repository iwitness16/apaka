export interface CartLine {
  handle: string
  title: string
  price: number
  image: string
  size: string
  quantity: number
}

export type CategorySlug =
  | "turquoise-jewelry"
  | "statement-pieces"
  | "accessories"
  | "bags"
  | "home"
  | "western-belts"
  | "footwear"

export interface Product {
  // Core identity
  handle: string
  etsy_id?: string
  etsy_url?: string

  // Display
  title: string
  description: string
  category: CategorySlug

  // Pricing
  price: number
  original_price?: number | null   // null = not on sale

  // Media
  main_image: string
  images: string[]

  // Attributes
  materials?: string
  gemstone?: string
  gem_color?: string
  size_info?: string
  style_info?: string

  // Seller
  seller_name?: string
  seller_url?: string

  // Social proof
  rating?: number | null
  review_count?: number

  // Flags
  is_active?: boolean
  is_sale?: boolean
  free_shipping?: boolean
}
