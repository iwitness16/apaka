import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { CollectionView } from "@/components/collection/collection-view"
import { categories, getCategory } from "@/lib/catalog"
import { getProductsByCategory } from "@/lib/products-service"

// Force dynamic rendering — data comes from Supabase at request time
export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = getCategory(slug)
  return {
    title: category
      ? `${category.label} — Native Made Accessories`
      : "Collection — Native Made Accessories",
  }
}

const clothing = categories.filter((c) => c.group === "clothing")

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = getCategory(slug)
  if (!category) notFound()

  const products = await getProductsByCategory(slug)
  const showChips = category.group === "clothing"

  return (
    <div className="pt-10">
      <div className="text-center px-4">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-2">
          Collection
        </p>
        <h1 className="font-serif text-4xl font-medium lg:text-5xl">{category.label}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{products.length} items</p>
      </div>

      {showChips && (
        <div className="mx-auto mt-8 flex max-w-[1000px] flex-wrap justify-center gap-2.5 px-4">
          {clothing.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className={
                c.slug === slug
                  ? "bg-primary px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-foreground rounded-full"
                  : "bg-secondary px-5 py-2 text-[11px] font-medium uppercase tracking-[0.15em] text-secondary-foreground rounded-full transition-colors hover:bg-primary hover:text-primary-foreground"
              }
            >
              {c.label}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <div className="mt-20 text-center px-4">
          <p className="text-muted-foreground text-sm">
            No products found in this category yet. Check back soon!
          </p>
        </div>
      ) : (
        <CollectionView products={products} />
      )}
    </div>
  )
}
