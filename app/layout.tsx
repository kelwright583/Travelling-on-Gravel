import type { Metadata, Viewport } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import { unstable_cache } from 'next/cache'
import { buildCssVars, type ThemeOverrides } from '@/lib/theme/tokens'
import { createServiceClient } from '@/lib/supabase/server'
import { SocialFabs } from '@/components/public/SocialFabs'
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
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gravel',
  },
}

// Cache theme at the CDN/ISR layer — revalidated when admin saves theme.
const getCachedTheme = unstable_cache(
  async (): Promise<ThemeOverrides> => {
    try {
      const supabase = await createServiceClient()
      const { data } = await supabase
        .from('site_settings')
        .select('theme')
        .single()
      return (data?.theme as ThemeOverrides) ?? {}
    } catch {
      return {}
    }
  },
  ['site-theme'],
  { revalidate: 3600, tags: ['site-theme'] },
)

export const viewport: Viewport = {
  themeColor: '#15150F',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const themeOverrides = await getCachedTheme()
  const cssVars = buildCssVars(themeOverrides)

  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${inter.variable} h-full`}
    >
      <head>
        {/* Inject resolved brand CSS variables server-side to prevent FOUC */}
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body className="flex min-h-full flex-col antialiased">
        {children}
        <SocialFabs />
      </body>
    </html>
  )
}
