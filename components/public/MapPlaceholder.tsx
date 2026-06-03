'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Link } from '@/i18n/navigation'
import { MapPin as MapPinIcon } from 'lucide-react'
import type { MapPin } from '@/lib/maps/google'

interface MapPlaceholderProps {
  pins: MapPin[]
}

const GravelMap = dynamic(
  () => import('@/components/public/GravelMap').then((m) => m.GravelMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-ink">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    ),
  },
)

export function MapPlaceholder({ pins }: MapPlaceholderProps) {
  return (
    <section aria-label="Gravel Map" className="scroll-reveal bg-olive py-20">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="scroll-reveal mb-8 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-700 uppercase tracking-widest text-accent">
              Where we&apos;ve been
            </p>
            <h2 className="font-display text-4xl font-900 uppercase leading-none tracking-tight text-bone md:text-5xl">
              The Gravel Map
            </h2>
          </div>
          <Link
            href="/map"
            className="text-xs font-700 uppercase tracking-widest text-khaki transition-colors hover:text-bone"
          >
            Full Map →
          </Link>
        </div>

        {/* Map container with "open full map" overlay */}
        <div className="scroll-reveal relative overflow-hidden rounded-lg border border-line/30" style={{ '--reveal-delay': '100ms' } as React.CSSProperties}>
          <div style={{ height: 440 }}>
            <GravelMap pins={pins} initialLat={-15} initialLng={25} initialZoom={4} />
          </div>

          {/* Bottom bar overlay */}
          <Link
            href="/map"
            className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-ink/90 to-transparent px-6 py-5 transition-opacity hover:from-ink/95"
          >
            <div className="flex items-center gap-2">
              <MapPinIcon size={14} className="text-accent" />
              <span className="text-xs font-700 uppercase tracking-widest text-bone">
                {pins.length} place{pins.length !== 1 ? 's' : ''} mapped
              </span>
            </div>
            <span className="rounded border border-bone/40 px-3 py-1.5 text-[10px] font-700 uppercase tracking-widest text-bone transition-colors hover:border-bone">
              Open Full Map →
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
