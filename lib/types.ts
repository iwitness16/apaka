export type CategorySlug =
  | "turquoise-jewelry"
  | "tops"
  | "bottoms"
  | "dresses-rompers"
  | "graphic-tees"
  | "western-belts"
  | "outerwear"
  | "footwear"
  | "bags"
  | "accessories"
  | "home"
  | "statement-pieces"

export interface Product {
  handle: string
  title: string
  price: number
  category: CategorySlug
  images: string[]
  sizes: string[]
  optionName: string
  description: string
}

export interface CartLine {
  handle: string
  title: string
  price: number
  image: string
  size: string
  quantity: number
}
