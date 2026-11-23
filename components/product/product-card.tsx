import Link from "next/link"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/catalog"
import { cn } from "@/lib/utils"

export function ProductCard({
  product,
  className,
}: {
  product: Product
  className?: string
}) {
  // Prefer jpg/png/webp — etsystatic.com images are always JPEG
  const primary   = product.main_image || product.images?.[0] || ""
  const secondary = product.images?.[1] || ""

  const salePercent =
    product.is_sale && product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null

  return (
    <Link href={`/product/${product.handle}`} className={cn("group block", className)}>
      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-sm bg-secondary">
        {primary ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primary}
              alt={product.title}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                const img = e.currentTarget
                if (secondary && img.src !== secondary) img.src = secondary
                else img.style.display = "none"
              }}
              className={cn(
                "size-full object-cover transition-all duration-500 group-hover:scale-105",
                secondary && "group-hover:opacity-0 group-hover:scale-100"
              )}
            />
            {secondary && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={secondary}
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}
          </>
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground/20">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="size-10">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {salePercent && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              -{salePercent}%
            </span>
          )}
          {product.free_shipping && (
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
              Free shipping
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="pt-3">
        <h3 className="line-clamp-2 font-serif text-[14px] leading-snug text-foreground">
          {product.title}
        </h3>
        {product.seller_name && (
          <p className="mt-0.5 text-[11px] text-muted-foreground truncate">
            by {product.seller_name}
          </p>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.original_price)}
            </span>
          )}
        </div>
        {product.rating && product.review_count ? (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[11px] text-amber-500">★</span>
            <span className="text-[11px] text-muted-foreground">
              {product.rating.toFixed(1)} ({product.review_count})
            </span>
          </div>
        ) : null}
      </div>
    </Link>
  )
}
