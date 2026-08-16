"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"
import type { CartLine } from "@/lib/types"

interface CartContextValue {
  lines: CartLine[]
  count: number
  subtotal: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addLine: (line: CartLine) => void
  removeLine: (handle: string, size: string) => void
  updateQuantity: (handle: string, size: string, quantity: number) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const addLine = useCallback((line: CartLine) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.handle === line.handle && l.size === line.size)
      if (existing) {
        return prev.map((l) =>
          l.handle === line.handle && l.size === line.size
            ? { ...l, quantity: l.quantity + line.quantity }
            : l,
        )
      }
      return [...prev, line]
    })
    setIsOpen(true)
  }, [])

  const removeLine = useCallback((handle: string, size: string) => {
    setLines((prev) => prev.filter((l) => !(l.handle === handle && l.size === size)))
  }, [])

  const updateQuantity = useCallback((handle: string, size: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((l) => (l.handle === handle && l.size === size ? { ...l, quantity } : l))
        .filter((l) => l.quantity > 0),
    )
  }, [])

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, l) => sum + l.quantity, 0)
    const subtotal = lines.reduce((sum, l) => sum + l.quantity * l.price, 0)
    return { lines, count, subtotal, isOpen, openCart, closeCart, addLine, removeLine, updateQuantity }
  }, [lines, isOpen, openCart, closeCart, addLine, removeLine, updateQuantity])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
