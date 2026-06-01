import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import withSerwistInit from '@serwist/next'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  // Only active in production — dev uses Turbopack which doesn't support Serwist
  disable: process.env.NODE_ENV !== 'production',
  // Exclude admin and API routes from the precache manifest
  exclude: [/\/admin\//, /\/api\//, /\/_next\/static\/chunks\/app\/admin/, /\/_next\/static\/chunks\/app\/api/],
})

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Supabase Storage
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // YouTube thumbnails
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
    ],
  },
}

export default withSerwist(withNextIntl(nextConfig))
