import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/product/product-detail"
import { ProductRail } from "@/components/product/product-rail"
import { categoryLabel } from "@/lib/catalog"
import { getProduct, getRelatedProducts } from "@/lib/products-service"

// Force dynamic rendering — data comes from Supabase at request time
export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>
}): Promise<Metadata> {
  const { handle } = await params
  const product = await getProduct(handle)
  return {
    title: product
      ? `${product.title} — Native Made Accessories`
      : "Product — Native Made Accessories",
    description: product?.description
      ? product.description.slice(0, 160)
      : `Shop at Native Made Accessories.`,
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const { handle } = await params
  const product = await getProduct(handle)
  if (!product) notFound()

  const related = await getRelatedProducts(product)

  return (
    <>
      <ProductDetail product={product} />
      {related.length > 0 && (
        <ProductRail
          title="You May Also Love"
          href={`/category/${product.category}`}
          products={related}
        />
      )}
    </>
  )
}
