'use client'

import { Link } from '@/i18n/navigation'
import { useEffect, useRef } from 'react'
import type { Database } from '@/db/types'
import { t } from '@/lib/i18n/types'

type SiteSettings = Database['public']['Tables']['site_settings']['Row']

interface HeroProps {
  settings: SiteSettings
}

export function Hero({ settings }: HeroProps) {
  const bgRef = useRef<HTMLDivElement>(null)

  // Parallax scroll
  useEffect(() => {
    const el = bgRef.current
    if (!el) return
    const handler = () => {
      const y = window.scrollY * 0.35
      el.style.transform = `translateY(${y}px)`
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const line1 = t(settings.hero_line1, 'en')
  const line2 = t(settings.hero_line2, 'en')
  const subtitle = t(settings.hero_subtitle, 'en')
  const location = settings.hero_location ?? ''
  const coords = settings.hero_coords ?? ''

  return (
    <section
      className="grain relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center"
      aria-label="Hero"
    >
      {/* Parallax duotone background */}
      <div
        ref={bgRef}
        className="absolute inset-0 will-change-transform"
        aria-hidden="true"
      >
        {/* Topo SVG layer */}
        <div className="topo-bg absolute inset-0 opacity-40" />

        {/* Hazard stripe top accent */}
        <div className="hazard absolute top-0 left-0 right-0" />

        {/* Radial vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 30%, var(--ink) 85%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[900px]">
        {/* Eyebrow */}
        {(location || coords) && (
          <p
            className="hero-reveal mb-6 text-xs font-600 uppercase tracking-[0.3em] text-accent"
            style={{ '--delay': '0ms' } as React.CSSProperties}
          >
            {location}
            {coords && <span className="ml-4 text-khaki-deep">{coords}</span>}
          </p>
        )}

        {/* Headline */}
        <h1
          className="hero-reveal font-display mb-6 text-[clamp(3rem,10vw,8rem)] font-900 uppercase leading-[0.95] tracking-tight"
          style={{ '--delay': '100ms' } as React.CSSProperties}
        >
          <span className="block text-bone">{line1 || 'LESS GLAMPING.'}</span>
          <span className="block text-accent">{line2 || 'MORE GRAVEL.'}</span>
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p
            className="hero-reveal mx-auto mb-10 max-w-md text-sm leading-relaxed text-khaki"
            style={{ '--delay': '200ms' } as React.CSSProperties}
          >
            {subtitle}
          </p>
        )}

        {/* CTAs */}
        <div
          className="hero-reveal flex flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ '--delay': '300ms' } as React.CSSProperties}
        >
          <Link
            href="/dispatches"
            className="inline-block rounded border border-accent bg-accent px-8 py-3 text-xs font-700 uppercase tracking-widest text-bone transition-colors hover:bg-accent-soft"
          >
            Read Dispatches
          </Link>
          <Link
            href="/#newsletter"
            className="inline-block rounded border border-line px-8 py-3 text-xs font-700 uppercase tracking-widest text-bone transition-colors hover:border-bone"
          >
            Subscribe
          </Link>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        className="hero-reveal absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{ '--delay': '500ms' } as React.CSSProperties}
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-600 uppercase tracking-[0.3em] text-khaki-deep">
            Scroll
          </span>
          <div className="h-8 w-px animate-pulse bg-gradient-to-b from-khaki-deep to-transparent" />
        </div>
      </div>
    </section>
  )
}
