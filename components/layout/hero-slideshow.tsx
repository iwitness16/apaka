"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const SLIDES = [
  {
    src: "/images/hero.jpg",
    alt: "Native Made Accessories — handcrafted sterling jewelry & artisan style",
  },
  {
    src: "/images/hero2.jpg",
    alt: "Genuine turquoise jewelry & curated accessories",
  },
]

// Each slide stays visible for 5 seconds; cross-fade takes 1.4 s (matches CSS animation)
const INTERVAL_MS = 5000

export function HeroSlideshow() {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState<number | null>(null)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => {
        const next = (c + 1) % SLIDES.length
        setPrev(c)
        setTransitioning(true)
        return next
      })
    }, INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  // Clear the "prev" slide after the fade completes
  useEffect(() => {
    if (!transitioning) return
    const t = setTimeout(() => {
      setPrev(null)
      setTransitioning(false)
    }, 1500)
    return () => clearTimeout(t)
  }, [transitioning, current])

  return (
    <section className="relative flex h-[68vh] min-h-[480px] items-end justify-center overflow-hidden lg:h-[78vh] lg:min-h-[560px]">
      {/* Slide stack */}
      {SLIDES.map((slide, i) => {
        const isCurrent = i === current
        const isPrev = i === prev

        if (!isCurrent && !isPrev) return null

        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            className={cn(
              "absolute inset-0 size-full object-cover",
              isCurrent && transitioning && "hero-slide-enter",
              isCurrent && !transitioning && "opacity-100",
              isPrev && "hero-slide-exit",
            )}
            style={{ zIndex: isCurrent ? 2 : 1 }}
            draggable={false}
          />
        )
      })}

      {/* Gradient overlay — bottom-heavy for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          zIndex: 3,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.04) 100%)",
        }}
      />

      {/* Hero content */}
      <div className="relative pb-14 text-center px-4" style={{ zIndex: 4 }}>
        <p className="font-serif text-[11px] uppercase tracking-[0.35em] text-white/70 mb-3">
          Handcrafted &middot; Native-Inspired &middot; Sterling Silver
        </p>
        <h1 className="font-serif text-3xl italic font-medium text-white text-balance drop-shadow-lg lg:text-5xl xl:text-6xl max-w-2xl mx-auto leading-tight">
          Wear the Art of Our Ancestors
        </h1>
        <p className="mt-4 text-sm text-white/75 font-light tracking-wide max-w-md mx-auto hidden sm:block">
          Genuine turquoise jewelry & artisan accessories, made with intention.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/new-arrivals"
            className="inline-block bg-white px-9 py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground transition-all hover:bg-accent hover:text-white shadow-lg"
          >
            Shop New Arrivals
          </Link>
          <Link
            href="/category/turquoise-jewelry"
            className="inline-block border border-white/70 px-9 py-3.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white transition-all hover:bg-white/10"
          >
            Turquoise Jewelry
          </Link>
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2" style={{ zIndex: 4 }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => {
              setPrev(current)
              setCurrent(i)
              setTransitioning(true)
            }}
            className={cn(
              "h-1.5 rounded-full transition-all duration-500",
              i === current ? "bg-white w-8" : "bg-white/40 w-1.5 hover:bg-white/70",
            )}
          />
        ))}
      </div>
    </section>
  )
}
