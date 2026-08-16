import { CollectionView } from "@/components/collection/collection-view"
import { getAllProducts } from "@/lib/products-service"

// Force dynamic rendering — data comes from Supabase at request time
export const dynamic = "force-dynamic"

export const metadata = {
  title: "New Arrivals — Native Made Accessories",
  description:
    "Shop the latest handcrafted jewelry, accessories and apparel at Native Made Accessories.",
}

export default async function NewArrivalsPage() {
  const products = await getAllProducts()

  return (
    <div className="pt-10">
      <div className="text-center px-4">
        <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-2">
          Just Landed
        </p>
        <h1 className="font-serif text-4xl font-medium lg:text-5xl">New Arrivals</h1>
        {products.length > 0 && (
          <p className="mt-2 text-sm text-muted-foreground">{products.length} items</p>
        )}
      </div>

      {products.length === 0 ? (
        <div className="mt-20 text-center px-4">
          <p className="text-muted-foreground text-sm">
            New products are on the way — check back soon!
          </p>
        </div>
      ) : (
        <CollectionView products={products} />
      )}
    </div>
  )
}
