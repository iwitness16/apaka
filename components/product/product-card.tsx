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
  // Prefer jpg/png/webp images — skip .heic which browsers can't display
  const usable = product.images.filter(
    (img) => img && !/\.heic(\?|$)/i.test(img)
  )
  const primary = usable[0] ?? product.images[0] ?? ""
  const secondary = usable[1] ?? ""

  return (
    <Link href={`/product/${product.handle}`} className={cn("group block", className)}>
      {/* Image container — fixed aspect ratio prevents collapse on failed/slow loads */}
      <div className="relative aspect-square overflow-hidden bg-secondary rounded-sm">
        {primary ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primary}
              alt={product.title}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                // If primary fails try secondary, else hide
                const img = e.currentTarget
                if (secondary && img.src !== secondary) {
                  img.src = secondary
                } else {
                  img.style.display = "none"
                }
              }}
              className={cn(
                "size-full object-cover transition-all duration-500 group-hover:scale-105",
                secondary && "group-hover:opacity-0 group-hover:scale-100",
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
          /* Placeholder when no image */
          <div className="flex size-full items-center justify-center text-muted-foreground/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} className="size-12">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* "New" badge placeholder — can be wired to a date field later */}
      </div>

      <div className="pt-3">
        <h3 className="line-clamp-2 font-serif text-[15px] leading-snug text-foreground">
          {product.title}
        </h3>
        <p className="mt-1.5 text-sm font-semibold text-foreground">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  )
}
