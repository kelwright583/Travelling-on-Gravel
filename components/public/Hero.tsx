'use client'

import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { useEffect, useRef } from 'react'
import type { Database } from '@/db/types'
import { t } from '@/lib/i18n/types'

type SiteSettings = Database['public']['Tables']['site_settings']['Row']

interface HeroProps {
  settings: SiteSettings | null
}

export function Hero({ settings }: HeroProps) {
  const bgRef = useRef<HTMLDivElement>(null)

  // Parallax scroll — disabled when prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) return
    const el = bgRef.current
    if (!el) return
    const handler = () => {
      const y = window.scrollY * 0.35
      el.style.transform = `translateY(${y}px)`
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const line1 = settings ? t(settings.hero_line1, 'en') : ''
  const line2 = settings ? t(settings.hero_line2, 'en') : ''
  const location = settings?.hero_location ?? ''
  const coords = settings?.hero_coords ?? ''
  const heroImage = settings?.hero_image ?? null

  // hero_duotone can be stored in settings.theme jsonb
  const themeMeta = settings?.theme as Record<string, unknown> | null
  const duotone = themeMeta?.hero_duotone !== false // default true

  // Text colours from hero_colors jsonb (with fallbacks)
  const rawColors = settings?.hero_colors as Record<string, unknown> | null
  const colors = {
    eyebrow: typeof rawColors?.eyebrow === 'string' ? rawColors.eyebrow : '#D75E2C',
    line1: typeof rawColors?.line1 === 'string' ? rawColors.line1 : '#EFEAD9',
    line2: typeof rawColors?.line2 === 'string' ? rawColors.line2 : '#D75E2C',
    subtitle: typeof rawColors?.subtitle === 'string' ? rawColors.subtitle : '#B9A77B',
    overlay: typeof rawColors?.overlay === 'number' ? rawColors.overlay : 40,
  }

  // No settings at all — show branded setup state
  if (!settings) {
    return (
      <section
        className="grain relative flex min-h-[100svh] flex-col items-center justify-center bg-ink px-6 text-center"
        aria-label="Hero"
      >
        <div className="topo-bg absolute inset-0 opacity-20" aria-hidden="true" />
        <div className="relative z-10">
          <p className="font-display text-sm font-800 uppercase tracking-widest text-bone">
            Travelling on Gravel
          </p>
          <p className="mt-2 text-xs text-khaki-deep">Setting up camp&hellip;</p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="grain relative flex min-h-[100svh] flex-col overflow-hidden bg-ink"
      aria-label="Hero"
    >
      {/* Full-bleed background image with parallax wrapper */}
      <div
        ref={bgRef}
        className="absolute inset-0 scale-110 will-change-transform"
        aria-hidden="true"
      >
        {heroImage ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${heroImage}`}
            alt=""
            fill
            priority
            sizes="100vw"
            className={`object-cover${duotone ? ' grayscale' : ''}`}
          />
        ) : (
          // TODO: replace public/hero-default.jpg with Rupert's photography
          <Image
            src="/hero-default.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className={`object-cover${duotone ? ' grayscale' : ''}`}
          />
        )}

        {/* Duotone colour blend */}
        {duotone && (
          <div
            className="absolute inset-0 mix-blend-color"
            style={{ backgroundColor: 'var(--olive)' }}
          />
        )}

        {/* Topo SVG layer */}
        <div className="topo-bg absolute inset-0 opacity-30" />

        {/* Hazard stripe top accent */}
        <div className="hazard absolute top-0 left-0 right-0" />

        {/* Bottom-weighted legibility scrim */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, #15150F 0%, color-mix(in srgb, #15150F 85%, transparent) 30%, transparent 75%)',
          }}
        />
        {/* Configurable darkening overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: '#15150F', opacity: (colors.overlay / 100) * 0.75 }}
        />
        {/* Side vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 20% 80%, transparent 40%, color-mix(in srgb, #15150F 60%, transparent) 100%)',
          }}
        />
      </div>

      {/* Content — bottom-left editorial layout */}
      <div className="relative z-10 mt-auto px-6 pb-16 md:px-12 lg:px-20">
        <div className="max-w-[800px]">
          {/* Eyebrow */}
          {(location || coords) && (
            <p
              className="hero-reveal mb-5 text-xs font-600 uppercase tracking-[0.3em]"
              style={{ '--delay': '0ms', color: colors.eyebrow } as React.CSSProperties}
            >
              {location}
              {coords && <span className="ml-4 opacity-60">{coords}</span>}
            </p>
          )}

          {/* Headline */}
          {(line1 || line2) && (
            <h1 className="font-display mb-6 text-[clamp(3rem,9vw,7.5rem)] font-900 uppercase leading-[0.9] tracking-tight">
              {line1 && (() => {
                const words = line1.split(' ')
                return (
                  <span className="block" style={{ color: colors.line1 }}>
                    {words.map((word, i) => (
                      <span key={i} className="hero-word">
                        <span
                          className="hero-word-inner"
                          style={{ '--word-delay': `${100 + i * 80}ms` } as React.CSSProperties}
                        >
                          {word}
                        </span>
                        {i < words.length - 1 && '\u00A0'}
                      </span>
                    ))}
                  </span>
                )
              })()}
              {line2 && (() => {
                const words = line2.split(' ')
                return (
                  <span className="block" style={{ color: colors.line2 }}>
                    {words.map((word, i) => (
                      <span key={i} className="hero-word">
                        <span
                          className="hero-word-inner"
                          style={{ '--word-delay': `${300 + i * 80}ms` } as React.CSSProperties}
                        >
                          {word}
                        </span>
                        {i < words.length - 1 && '\u00A0'}
                      </span>
                    ))}
                  </span>
                )
              })()}
            </h1>
          )}

          {/* CTAs */}
          <div
            className="hero-reveal flex flex-wrap gap-3"
            style={{ '--delay': '250ms' } as React.CSSProperties}
          >
            <Link
              href="/films"
              className="inline-block rounded border border-accent bg-accent px-7 py-3 text-xs font-700 uppercase tracking-widest text-bone transition-colors hover:bg-accent-soft"
            >
              Watch the latest run
            </Link>
            <Link
              href="/field-work"
              className="inline-block rounded border border-line px-7 py-3 text-xs font-700 uppercase tracking-widest text-bone transition-colors hover:border-bone"
            >
              Read the field notes
            </Link>
          </div>
        </div>
      </div>

      {/* Coordinates badge — bottom-right, hidden on mobile */}
      {coords && (
        <div
          className="hero-reveal absolute right-6 bottom-8 hidden md:block"
          style={{ '--delay': '400ms' } as React.CSSProperties}
          aria-hidden="true"
        >
          <p className="font-mono text-[10px] tracking-widest" style={{ color: colors.eyebrow, opacity: 0.6 }}>{coords}</p>
        </div>
      )}

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
