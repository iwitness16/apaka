import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/cart/cart-provider'
import { SiteHeader } from '@/components/layout/site-header'
import { SiteFooter } from '@/components/layout/site-footer'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { WhatsAppButton } from '@/components/layout/whatsapp-button'

// Using system-proven Google Fonts — mapped to the new NMA variable names
const dmSans = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const playfair = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Native Made Accessories — Handcrafted & Artisan Jewelry',
  description:
    'Discover handcrafted Native-inspired accessories, genuine sterling turquoise jewelry, curated apparel and statement pieces. Free-spirited style rooted in tradition.',
  keywords: ['native accessories', 'turquoise jewelry', 'sterling silver', 'handcrafted jewelry', 'western accessories'],
  generator: 'next.js',
  icons: {
    icon: [
      { url: '/images/logo.jpg', type: 'image/jpeg' },
    ],
    apple: '/images/logo.jpg',
    shortcut: '/images/logo.jpg',
  },
  openGraph: {
    title: 'Native Made Accessories',
    description: 'Handcrafted sterling jewelry & artisan accessories.',
    siteName: 'Native Made Accessories',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#1e1610',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${dmSans.variable} ${playfair.variable}`}>
      <body className="antialiased">
        <CartProvider>
          <SiteHeader />
          <main className="min-h-screen">{children}</main>
          <SiteFooter />
          <CartDrawer />
          <WhatsAppButton />
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
