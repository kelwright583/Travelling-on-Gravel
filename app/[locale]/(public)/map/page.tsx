import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { GravelMap } from '@/components/public/GravelMap'
import type { MapPin } from '@/lib/maps/google'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'The Gravel Map',
  description: 'Interactive map of camps, roads, and scenics across overland Africa.',
}

export default async function MapPage() {
  const supabase = await createClient()
  const { data: pins } = await supabase
    .from('map_pins')
    .select('id, label, lat, lng, category, country, note, related_post_id')

  const mapPins: MapPin[] = (pins ?? []).map((p) => ({
    id: p.id,
    label: p.label,
    lat: p.lat,
    lng: p.lng,
    category: p.category,
    country: p.country,
    note: p.note ? String((p.note as Record<string, unknown>)['en'] ?? '') : null,
    related_post_id: p.related_post_id,
  }))

  return (
    <div className="flex flex-col" style={{ height: '100dvh', paddingTop: '64px' }}>
      {/* Header strip */}
      <div className="border-b border-line bg-ink px-6 py-3">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between">
          <div>
            <p className="text-[10px] font-700 uppercase tracking-widest text-accent">
              Overland Africa
            </p>
            <h1 className="font-display text-lg font-900 uppercase leading-tight text-bone">
              The Gravel Map
            </h1>
          </div>
          <p className="text-xs text-khaki-deep">
            {mapPins.length} pin{mapPins.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Map fills remaining viewport */}
      <div className="flex-1">
        <GravelMap pins={mapPins} />
      </div>
    </div>
  )
}
