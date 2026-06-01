import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import { buildCssVars } from '@/lib/theme/tokens'
import './globals.css'

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  display: 'swap',
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Travelling on Gravel',
    template: '%s | Travelling on Gravel',
  },
  description: 'Overland Africa travel — less glamping, more gravel.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // TODO (Phase 8): read site_settings.theme from DB and pass overrides here.
  const cssVars = buildCssVars()

  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${inter.variable} h-full`}
      // Inline style prevents FOUC on every page load — no client JS needed.
      style={{ ['--theme-injected' as string]: '1' }}
    >
      <head>
        {/* Inject brand CSS variables server-side to avoid FOUC */}
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body className="flex min-h-full flex-col antialiased">{children}</body>
    </html>
  )
}
