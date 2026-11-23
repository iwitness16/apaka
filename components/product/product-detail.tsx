"use client"

import { useState } from "react"
import { Check, ExternalLink, Minus, Plus, ShoppingBag, Star } from "lucide-react"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/catalog"
import { useCart } from "@/components/cart/cart-provider"
import { cn } from "@/lib/utils"

function getInstallmentHint(price: number): string | null {
  if (price < 400) return null
  if (price < 800) {
    const per = price / 4
    return `Pay in 4 installments of ${formatPrice(per)} — weekly or monthly`
  }
  const per = price / 6
  return `Pay in 6 installments of ${formatPrice(per)} — weekly or monthly`
}

export function ProductDetail({ product }: { product: Product }) {
  const { addLine } = useCart()
  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  // Build all images array: start with main_image then rest
  const allImages = [
    ...(product.main_image ? [product.main_image] : []),
    ...product.images.filter(img => img !== product.main_image),
  ].filter(Boolean)

  const installmentHint = getInstallmentHint(product.price)

  const salePercent =
    product.original_price && product.original_price > product.price
      ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
      : null

  const handleAdd = () => {
    addLine({
      handle:   product.handle,
      title:    product.title,
      price:    product.price,
      image:    allImages[0] ?? "",
      size:     product.size_info ?? "",
      quantity: qty,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2200)
  }

  // Build attributes list from new schema fields
  const attrs: { label: string; value: string }[] = []
  if (product.materials)  attrs.push({ label: "Materials",  value: product.materials  })
  if (product.gemstone)   attrs.push({ label: "Gemstone",   value: product.gemstone   })
  if (product.gem_color)  attrs.push({ label: "Gem Color",  value: product.gem_color  })
  if (product.size_info)  attrs.push({ label: "Size",       value: product.size_info  })
  if (product.style_info) attrs.push({ label: "Style",      value: product.style_info })

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">

        {/* ── Gallery ── */}
        <div className="flex flex-col-reverse gap-4 sm:flex-row">
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto sm:flex-col sm:overflow-x-visible">
              {allImages.slice(0, 8).map((img, i) => (
                <button
                  key={img + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "size-16 shrink-0 overflow-hidden rounded-sm bg-muted transition-all sm:size-[72px]",
                    i === activeImage
                      ? "ring-2 ring-primary ring-offset-1"
                      : "opacity-60 hover:opacity-100"
                  )}
                  aria-label={`View image ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="size-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}

          {/* Main image */}
          <div className="flex-1 overflow-hidden rounded-sm bg-muted relative">
            {salePercent && (
              <span className="absolute left-3 top-3 z-10 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white shadow">
                -{salePercent}% OFF
              </span>
            )}
            {product.free_shipping && (
              <span className="absolute right-3 top-3 z-10 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow">
                Free Shipping
              </span>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={allImages[activeImage] || "/placeholder.svg"}
              alt={product.title}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>

        {/* ── Info ── */}
        <div className="lg:pl-8">
          {/* Breadcrumb category */}
          <p className="mb-2 text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            {product.category?.replace(/-/g, " ")}
          </p>

          <h1 className="font-serif text-2xl font-medium leading-tight text-balance lg:text-3xl">
            {product.title}
          </h1>

          {/* Seller */}
          {product.seller_name && (
            <p className="mt-1 text-sm text-muted-foreground">
              by{" "}
              {product.seller_url ? (
                <a
                  href={product.seller_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {product.seller_name}
                </a>
              ) : (
                <span className="text-accent">{product.seller_name}</span>
              )}
            </p>
          )}

          {/* Rating */}
          {product.rating && product.review_count ? (
            <div className="mt-2 flex items-center gap-1.5">
              {[1,2,3,4,5].map(s => (
                <Star
                  key={s}
                  className={cn("size-3.5", s <= Math.round(product.rating!) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")}
                />
              ))}
              <span className="text-xs text-muted-foreground">
                {product.rating.toFixed(1)} ({product.review_count} reviews)
              </span>
            </div>
          ) : null}

          {/* Price */}
          <div className="mt-5 flex items-baseline gap-3">
            <p className="font-serif text-2xl font-semibold">{formatPrice(product.price)}</p>
            {product.original_price && product.original_price > product.price && (
              <p className="text-base text-muted-foreground line-through">
                {formatPrice(product.original_price)}
              </p>
            )}
          </div>

          {/* Installment hint */}
          {installmentHint ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-md bg-accent/10 px-3.5 py-2">
              <svg className="size-3.5 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
              <p className="text-[12px] font-medium text-accent">{installmentHint}</p>
            </div>
          ) : (
            <p className="mt-3 text-[12px] text-muted-foreground">
              Orders $400+ unlock flexible payment plans.
            </p>
          )}

          <div className="my-6 border-t border-border" />

          {/* Attributes */}
          {attrs.length > 0 && (
            <dl className="mb-6 space-y-2">
              {attrs.map(({ label, value }) => (
                <div key={label} className="flex gap-2 text-[13px]">
                  <dt className="w-24 shrink-0 text-muted-foreground">{label}:</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <p className="mb-3 text-[12px] text-muted-foreground">Quantity</p>
            <div className="flex w-fit items-center rounded-sm border border-border">
              <button
                type="button"
                className="px-4 py-3 hover:bg-secondary transition-colors"
                aria-label="Decrease quantity"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-4" />
              </button>
              <span className="w-12 text-center text-sm font-medium">{qty}</span>
              <button
                type="button"
                className="px-4 py-3 hover:bg-secondary transition-colors"
                aria-label="Increase quantity"
                onClick={() => setQty((q) => q + 1)}
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleAdd}
              className={cn(
                "flex w-full items-center justify-center gap-2 py-4 text-[12px] font-semibold uppercase tracking-[0.2em] transition-all shadow-sm",
                added
                  ? "bg-green-600 text-white"
                  : "bg-primary text-primary-foreground hover:opacity-85"
              )}
            >
              {added ? (
                <><Check className="size-4" /> Added to Bag</>
              ) : (
                <><ShoppingBag className="size-4" /> Add to Bag</>
              )}
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="w-full border-2 border-primary py-4 text-[12px] font-semibold uppercase tracking-[0.2em] text-primary transition-all hover:bg-primary hover:text-primary-foreground"
            >
              Buy It Now
            </button>
          </div>

          {/* Trust signals */}
          <div className="mt-6 flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 size-4 shrink-0 text-green-600" />
            <div>
              <p className="font-medium">Available &amp; Ready to Ship</p>
              <p className="text-[12px] text-muted-foreground">Usually dispatched within 2–4 business days</p>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8 border-t border-border pt-6">
              <h2 className="mb-3 font-serif text-lg font-medium">About This Piece</h2>
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-muted-foreground">
                {product.description.slice(0, 800)}
                {product.description.length > 800 ? "…" : ""}
              </p>
            </div>
          )}

          {/* View original listing */}
          {product.etsy_url && (
            <div className="mt-4">
              <a
                href={product.etsy_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-accent transition-colors"
              >
                <ExternalLink className="size-3.5" />
                View original listing
              </a>
            </div>
          )}

          {/* Contact strip */}
          <div className="mt-8 rounded-lg bg-secondary px-4 py-4 text-[12px] text-muted-foreground">
            <p className="font-medium text-foreground mb-1.5">Questions about this item?</p>
            <div className="flex flex-wrap gap-4">
              <a
                href="https://wa.me/17153500002"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[#25d366] font-medium hover:underline"
              >
                <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp: +1 (715) 350-0002
              </a>
              <a
                href="mailto:orders.nativemadeaccessories@gmail.com"
                className="inline-flex items-center gap-1.5 text-accent font-medium hover:underline"
              >
                Email Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
