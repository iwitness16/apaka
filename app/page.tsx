import Link from "next/link"
import { ProductRail } from "@/components/product/product-rail"
import { HeroSlideshow } from "@/components/layout/hero-slideshow"
import { categories, getProductsByCategory } from "@/lib/catalog"
import type { CategorySlug } from "@/lib/types"

const collectionTiles: { slug: CategorySlug; label: string }[] = [
  { slug: "graphic-tees", label: "Graphic Tees" },
  { slug: "dresses-rompers", label: "Dresses & Rompers" },
  { slug: "tops", label: "Tops" },
  { slug: "bottoms", label: "Bottoms / Jeans" },
  { slug: "outerwear", label: "Outerwear" },
  { slug: "footwear", label: "Footwear" },
  { slug: "turquoise-jewelry", label: "Sterling Jewelry" },
  { slug: "western-belts", label: "Western Belts" },
]

export default function HomePage() {
  const railSlugs: CategorySlug[] = [
    "statement-pieces",
    "turquoise-jewelry",
    "tops",
    "bags",
    "dresses-rompers",
    "footwear",
  ]

  return (
    <>
      {/* Hero slideshow */}
      <HeroSlideshow />

      {/* Value props strip */}
      <div className="bg-secondary border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-4 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-accent">✦</span> Genuine Sterling Silver
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">✦</span> Handcrafted Quality
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">✦</span> Flexible Payment Plans
            </li>
            <li className="flex items-center gap-2">
              <span className="text-accent">✦</span> Secure Checkout
            </li>
          </ul>
        </div>
      </div>

      {/* New this week rail */}
      <ProductRail
        title="New This Week"
        href="/new-arrivals"
        products={getProductsByCategory("dresses-rompers")
          .concat(getProductsByCategory("tops"))
          .slice(0, 10)}
      />

      {/* Collections grid */}
      <section className="py-16">
        <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
          <div className="mb-10 text-center">
            <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-2">Browse By Category</p>
            <h2 className="font-serif text-3xl font-medium lg:text-4xl">
              Our Collections
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {collectionTiles.map((tile) => {
              const img = getProductsByCategory(tile.slug)[0]?.images[0]
              return (
                <Link
                  key={tile.slug}
                  href={`/category/${tile.slug}`}
                  className="group relative flex aspect-[3/4] items-end overflow-hidden bg-muted rounded-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img || "/placeholder.svg"}
                    alt={tile.label}
                    loading="lazy"
                    className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-106"
                  />
                  {/* overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity duration-500 group-hover:from-black/70" />
                  <span className="relative z-10 mb-4 mx-3 w-[calc(100%-1.5rem)] text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white drop-shadow">
                    {tile.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature callout */}
      <section className="bg-secondary py-16">
        <div className="mx-auto max-w-[800px] px-4 text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground mb-3">Our Promise</p>
          <h2 className="font-serif text-3xl font-medium leading-snug lg:text-4xl">
            Every piece tells a story.
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground max-w-lg mx-auto">
            Native Made Accessories curates handcrafted sterling silver jewelry and artisan accessories
            inspired by indigenous traditions. Each item is selected with care — genuine materials,
            authentic craftsmanship, timeless beauty.
          </p>
          <Link
            href="/category/turquoise-jewelry"
            className="mt-8 inline-block bg-primary px-10 py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-foreground transition-all hover:opacity-85 shadow-sm"
          >
            Shop Jewelry
          </Link>
        </div>
      </section>

      {/* Category rails */}
      {railSlugs.map((slug) => {
        const meta = categories.find((c) => c.slug === slug)!
        return (
          <ProductRail
            key={slug}
            title={meta.label}
            href={`/category/${slug}`}
            products={getProductsByCategory(slug)}
          />
        )
      })}

      {/* Payment plan callout */}
      <section className="bg-primary py-14">
        <div className="mx-auto max-w-[900px] px-4 text-center">
          <h2 className="font-serif text-2xl font-medium text-primary-foreground lg:text-3xl">
            Flexible Payment Plans
          </h2>
          <p className="mt-4 text-sm text-primary-foreground/75 max-w-lg mx-auto">
            Shop now and pay over time. Orders $400+ qualify for installment plans.
            Add items to your bag and choose your plan at checkout.
          </p>
          <div className="mt-8 flex flex-wrap items-start justify-center gap-5">
            {[
              { range: "$0 – $399", plan: "One-time payment", note: "Standard checkout" },
              { range: "$400 – $799", plan: "4 installments", note: "Weekly or monthly" },
              { range: "$800+", plan: "6 installments", note: "Weekly or monthly" },
            ].map((tier) => (
              <div key={tier.range} className="bg-primary-foreground/10 rounded-md px-6 py-5 min-w-[180px]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/60 mb-1">{tier.range}</p>
                <p className="font-serif text-lg font-semibold text-primary-foreground">{tier.plan}</p>
                <p className="text-[11px] text-primary-foreground/60 mt-1">{tier.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
