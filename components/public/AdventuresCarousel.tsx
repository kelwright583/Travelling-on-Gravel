'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Database } from '@/db/types'
import { t } from '@/lib/i18n/types'
import { cn } from '@/lib/utils'

type Adventure = Database['public']['Tables']['adventures']['Row']

interface AdventuresCarouselProps {
  adventures: Adventure[]
}

const AUTOPLAY_MS = 5000

export function AdventuresCarousel({ adventures }: AdventuresCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartX = useRef(0)
  const count = adventures.length

  const go = useCallback(
    (index: number) => {
      setCurrent(((index % count) + count) % count)
    },
    [count],
  )

  const next = useCallback(() => go(current + 1), [current, go])
  const prev = useCallback(() => go(current - 1), [current, go])

  // Autoplay
  useEffect(() => {
    if (paused || count < 2) return
    timerRef.current = setTimeout(next, AUTOPLAY_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [current, paused, next, count])

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) {
      if (dx < 0) next(); else prev()
    }
  }

  if (count === 0) return null

  return (
    <section aria-label="Featured Adventures" className="bg-ink py-20">
      <div className="mx-auto max-w-[1240px] px-6">
        {/* Section header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-700 uppercase tracking-widest text-accent">
              Featured
            </p>
            <h2 className="font-display text-4xl font-900 uppercase leading-none tracking-tight text-bone md:text-5xl">
              Adventures
            </h2>
          </div>
          <Link
            href="/adventures"
            className="text-xs font-700 uppercase tracking-widest text-khaki transition-colors hover:text-bone"
          >
            All Adventures →
          </Link>
        </div>

        {/* Carousel track — exactly one slide visible via overflow-hidden + translateX */}
        <div
          className="relative overflow-hidden rounded-lg"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex transition-transform duration-500 ease-in-out will-change-transform"
            style={{ transform: `translateX(-${current * 100}%)` }}
            aria-live="polite"
          >
            {adventures.map((adv, i) => (
              <article
                key={adv.id}
                className="relative min-w-full"
                aria-hidden={i !== current}
                aria-label={t(adv.title, 'en')}
              >
                {/* Image */}
                <div className="duotone relative aspect-[16/9] w-full bg-ink-soft md:aspect-[21/9]">
                  {adv.cover_image ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${adv.cover_image}`}
                      alt={t(adv.title, 'en')}
                      fill
                      className="object-cover"
                      priority={i === 0}
                      sizes="(max-width: 900px) 100vw, 1240px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-olive to-ink" />
                  )}
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to top, var(--ink) 0%, transparent 60%)',
                    }}
                  />
                </div>

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  {adv.tag && (
                    <span className="mb-3 inline-block rounded border border-accent px-2 py-0.5 text-[10px] font-700 uppercase tracking-widest text-accent">
                      {adv.tag}
                    </span>
                  )}
                  <p className="mb-1 text-xs font-600 uppercase tracking-widest text-khaki">
                    {adv.location ?? adv.country}
                  </p>
                  <h3 className="font-display mb-3 text-3xl font-900 uppercase leading-tight text-bone md:text-5xl">
                    {t(adv.title, 'en')}
                  </h3>
                  <p className="mb-5 max-w-xl text-sm leading-relaxed text-khaki line-clamp-2">
                    {t(adv.excerpt, 'en')}
                  </p>
                  <Link
                    href={`/adventures/${adv.slug}`}
                    className="inline-block rounded border border-bone px-5 py-2 text-xs font-700 uppercase tracking-widest text-bone transition-colors hover:bg-bone hover:text-ink"
                    tabIndex={i !== current ? -1 : 0}
                  >
                    Read Report →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Arrow controls */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous adventure"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-line bg-ink/70 p-2 text-bone backdrop-blur-sm transition-colors hover:bg-ink"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next adventure"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-line bg-ink/70 p-2 text-bone backdrop-blur-sm transition-colors hover:bg-ink"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Dot indicators */}
        {count > 1 && (
          <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label="Slide indicators">
            {adventures.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === current}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => { setPaused(true); go(i) }}
                className={cn(
                  'h-1 rounded-full transition-all duration-300',
                  i === current ? 'w-8 bg-accent' : 'w-4 bg-line hover:bg-khaki-deep',
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
