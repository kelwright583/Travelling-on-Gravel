import type { Metadata } from 'next'
import { MapPin } from 'lucide-react'

export const metadata: Metadata = {
  title: 'The Gravel Map',
  description: 'Interactive map of camps, roads, and scenics across overland Africa.',
}

export default function MapPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 pt-24 text-center">
      <MapPin size={48} className="mb-6 text-accent" />
      <h1 className="font-display mb-4 text-4xl font-900 uppercase leading-tight text-bone">
        The Gravel Map
      </h1>
      <p className="max-w-sm text-sm text-khaki">
        Interactive Google Maps integration coming in Phase 7. Drop pins, filter by category,
        and link camps to dispatches.
      </p>
    </div>
  )
}
