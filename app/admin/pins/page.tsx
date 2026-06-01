import { MapPin } from 'lucide-react'

export const metadata = { title: 'Map Pins | Base Camp' }

export default function PinsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <MapPin size={40} className="mb-4 text-khaki-deep" />
      <h1 className="font-display mb-2 text-xl font-800 uppercase tracking-tight text-bone">
        Map Pins
      </h1>
      <p className="max-w-sm text-sm text-khaki">
        Interactive Google Maps pin manager with Places search and clustering coming in Phase 7.
      </p>
    </div>
  )
}
