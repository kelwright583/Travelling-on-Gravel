'use client'

import Image from 'next/image'
import React, { useState } from 'react'
import { X, Play } from 'lucide-react'
import type { Database } from '@/db/types'
import { t } from '@/lib/i18n/types'

type Film = Database['public']['Tables']['films']['Row']

interface FilmsStripProps {
  films: Film[]
}

function FilmModal({ film, onClose }: { film: Film; onClose: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t(film.title, 'en')}
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute -top-10 right-0 text-khaki hover:text-bone"
        >
          <X size={24} />
        </button>
        <div className="relative aspect-video overflow-hidden rounded-lg bg-ink">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${film.youtube_id}?autoplay=1&rel=0`}
            title={t(film.title, 'en')}
            allow="autoplay; fullscreen"
            className="absolute inset-0 h-full w-full"
          />
        </div>
        <p className="font-display mt-3 text-sm font-700 uppercase tracking-wide text-bone">
          {t(film.title, 'en')}
        </p>
      </div>
    </div>
  )
}

export function FilmsStrip({ films }: FilmsStripProps) {
  const [active, setActive] = useState<Film | null>(null)

  if (films.length === 0) return null

  return (
    <>
      <section aria-label="The Gravel Files" className="bg-ink py-20">
        <div className="mx-auto max-w-[1240px] px-6">
          {/* Header */}
          <div className="scroll-reveal mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-xs font-700 uppercase tracking-widest text-accent">
                On screen
              </p>
              <h2 className="font-display text-4xl font-900 uppercase leading-none tracking-tight text-bone md:text-5xl">
                The Gravel Files
              </h2>
            </div>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-700 uppercase tracking-widest text-khaki transition-colors hover:text-bone"
            >
              YouTube Channel →
            </a>
          </div>

          {/* Film grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {films.map((film, i) => {
              const thumb =
                film.thumbnail ??
                `https://img.youtube.com/vi/${film.youtube_id}/maxresdefault.jpg`
              return (
                <button
                  key={film.id}
                  type="button"
                  onClick={() => setActive(film)}
                  className="scroll-reveal group relative overflow-hidden rounded-lg border border-line bg-ink-soft text-left transition-colors hover:border-accent/40"
                  aria-label={`Play ${t(film.title, 'en')}`}
                  style={{ '--reveal-delay': `${i * 90}ms` } as React.CSSProperties}
                >
                  {/* Thumbnail */}
                  <div className="duotone relative aspect-video">
                    <Image
                      src={thumb}
                      alt={t(film.title, 'en')}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 400px"
                    />
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="rounded-full border-2 border-bone bg-accent/80 p-3">
                        <Play size={20} fill="currentColor" className="text-bone" />
                      </div>
                    </div>
                    {/* Duration badge */}
                    {film.duration && (
                      <span className="absolute bottom-2 right-2 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] font-700 text-bone">
                        {film.duration}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div className="p-4">
                    <p className="font-display text-sm font-800 uppercase leading-tight text-bone">
                      {t(film.title, 'en')}
                    </p>
                    {film.description && (
                      <p className="mt-1 text-xs leading-relaxed text-khaki line-clamp-2">
                        {t(film.description, 'en')}
                      </p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Lightbox modal */}
      {active && <FilmModal film={active} onClose={() => setActive(null)} />}
    </>
  )
}
