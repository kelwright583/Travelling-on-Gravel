import { Link } from '@/i18n/navigation'
import { MapPin } from 'lucide-react'

interface MapPlaceholderProps {
  pinCount: number
}

export function MapPlaceholder({ pinCount }: MapPlaceholderProps) {
  return (
    <section aria-label="Gravel Map" className="bg-olive py-20">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="mb-8">
          <p className="mb-2 text-xs font-700 uppercase tracking-widest text-accent">
            Where we&apos;ve been
          </p>
          <h2 className="font-display text-4xl font-900 uppercase leading-none tracking-tight text-bone md:text-5xl">
            The Gravel Map
          </h2>
        </div>

        {/* Placeholder until Phase 7 (Google Maps integration) */}
        <Link
          href="/map"
          className="group flex aspect-[21/9] items-center justify-center rounded-lg border border-line/40 bg-ink/30 transition-colors hover:border-accent/40"
        >
          <div className="text-center">
            <MapPin
              size={40}
              className="mx-auto mb-4 text-accent transition-transform group-hover:scale-110"
            />
            <p className="font-display mb-1 text-2xl font-900 uppercase tracking-tight text-bone">
              {pinCount} Places
            </p>
            <p className="text-xs text-khaki">Camps, repairs, scenics, and starts</p>
            <p className="mt-4 text-xs font-700 uppercase tracking-widest text-accent">
              Open Full Map →
            </p>
          </div>
        </Link>
      </div>
    </section>
  )
}
