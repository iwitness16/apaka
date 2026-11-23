import Link from "next/link"
import { ProductRail } from "@/components/product/product-rail"
import { HeroSlideshow } from "@/components/layout/hero-slideshow"
import { categories } from "@/lib/catalog"
import { getProductsByCategory, getFeaturedProducts } from "@/lib/products-service"
import type { CategorySlug } from "@/lib/types"

export const dynamic = "force-dynamic"

const collectionTiles: { slug: CategorySlug; label: string; emoji: string }[] = [
  { slug: "turquoise-jewelry", label: "Turquoise Jewelry", emoji: "💎" },
  { slug: "statement-pieces",  label: "Statement Pieces",  emoji: "✨" },
  { slug: "accessories",       label: "Accessories",       emoji: "📿" },
  { slug: "bags",              label: "Bags",              emoji: "👜" },
  { slug: "home",              label: "Home & Decor",      emoji: "🏡" },
  { slug: "western-belts",     label: "Western Belts",     emoji: "🤠" },
]

export default async function HomePage() {
  const [
    featured,
    turquoiseProducts,
    statementProducts,
  ] = await Promise.all([
    getFeaturedProducts(8),
    getProductsByCategory("turquoise-jewelry"),
    getProductsByCategory("statement-pieces"),
  ])

  return (
    <>
      {/* Hero */}
      <HeroSlideshow />

      {/* Value strip */}
      <div className="bg-primary/5 border-y border-primary/10 py-3">
        <div className="mx-auto max-w-[1400px] px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
            <span>✦ Authentic Native Jewelry</span>
            <span className="hidden sm:inline">✦ Flexible Payment Plans</span>
            <span>✦ WhatsApp Support</span>
            <span className="hidden lg:inline">✦ Free Shipping Available</span>
          </div>
        </div>
      </div>

      {/* Collection tiles */}
      <section className="mx-auto max-w-[1400px] px-4 py-14 lg:px-8">
        <div className="mb-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-2">Browse</p>
          <h2 className="font-serif text-3xl font-medium">Shop by Category</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {collectionTiles.map(({ slug, label, emoji }) => (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-secondary/40 px-3 py-6 text-center transition-all hover:border-primary/40 hover:bg-secondary hover:shadow-sm"
            >
              <span className="text-3xl">{emoji}</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground group-hover:text-foreground transition-colors">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products rail */}
      {featured.length > 0 && (
        <ProductRail
          title="Featured Pieces"
          href="/new-arrivals"
          products={featured}
        />
      )}

      {/* Installment payment callout */}
      <section className="bg-primary/5 border-y border-primary/10 py-14">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-primary mb-2">
            Flexible Payments
          </p>
          <h2 className="font-serif text-3xl font-medium mb-4">
            Own It Now, Pay Later
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Orders $400+ qualify for installment plans. Split into 4 or 6 payments — weekly or monthly.
            Pay via CashApp, Apple Pay, Chime, Zelle, or Bitcoin.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["CashApp", "Apple Pay", "Chime", "Zelle", "Bitcoin"].map((m) => (
              <span
                key={m}
                className="rounded-full border border-primary/20 bg-background px-4 py-2 text-[12px] font-semibold text-primary"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Turquoise jewelry rail */}
      {turquoiseProducts.length > 0 && (
        <ProductRail
          title="Turquoise Jewelry"
          href="/category/turquoise-jewelry"
          products={turquoiseProducts.slice(0, 8)}
        />
      )}

      {/* Statement pieces rail */}
      {statementProducts.length > 0 && (
        <ProductRail
          title="Statement Pieces"
          href="/category/statement-pieces"
          products={statementProducts.slice(0, 8)}
        />
      )}
    </>
  )
}
