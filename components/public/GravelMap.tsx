'use client'

import { useEffect, useRef, useState } from 'react'
import { importLibrary } from '@googlemaps/js-api-loader'
import { initMapsLoader, BRAND_MAP_STYLE, type MapPin } from '@/lib/maps/google'

interface GravelMapProps {
  pins: MapPin[]
  initialLat?: number
  initialLng?: number
  initialZoom?: number
}

interface PopoverState {
  pin: MapPin
  x: number
  y: number
}

export function GravelMap({
  pins,
  initialLat = -10,
  initialLng = 25,
  initialZoom = 4,
}: GravelMapProps) {
  const hasApiKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY)
  const mapRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const [popover, setPopover] = useState<PopoverState | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(hasApiKey)

  useEffect(() => {
    if (!hasApiKey || !mapRef.current) return

    initMapsLoader()

    let cancelled = false
    importLibrary('maps')
      .then(({ Map }) => {
        if (cancelled || !mapRef.current) return
        const map = new Map(mapRef.current, {
          center: { lat: initialLat, lng: initialLng },
          zoom: initialZoom,
          styles: BRAND_MAP_STYLE,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })
        setLoading(false)

        for (const pin of pins) {
          const marker = new google.maps.Marker({
            position: { lat: pin.lat, lng: pin.lng },
            map,
            title: pin.label,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: '#EA5B12',
              fillOpacity: 1,
              strokeColor: '#F8E8D8',
              strokeWeight: 1.5,
              scale: 8,
            },
          })

          marker.addListener('click', () => {
            const projection = map.getProjection()
            const zoom = map.getZoom()
            const bounds = map.getBounds()
            if (!projection || zoom === undefined || !bounds || !mapRef.current) return
            const point = projection.fromLatLngToPoint(new google.maps.LatLng(pin.lat, pin.lng))
            const sw = projection.fromLatLngToPoint(bounds.getSouthWest())
            if (!point || !sw) return
            const scale = Math.pow(2, zoom)
            setPopover({
              pin,
              x: (point.x - sw.x) * scale,
              y: (point.y - sw.y) * scale,
            })
          })

          markersRef.current.push(marker)
        }

        map.addListener('click', () => setPopover(null))
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError('Google Maps failed to load. Check your API key.')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
      markersRef.current.forEach((m) => m.setMap(null))
      markersRef.current = []
    }
  // Pins come from server render and are stable — intentionally mount-only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const errorMsg = !hasApiKey
    ? 'NEXT_PUBLIC_GOOGLE_MAPS_KEY is not configured.'
    : loadError

  if (errorMsg) {
    return (
      <div className="flex h-full items-center justify-center bg-ink-soft text-center">
        <div className="max-w-sm p-8">
          <p className="mb-2 text-sm font-600 text-bone">{errorMsg}</p>
          <p className="text-xs text-khaki-deep">
            Add <code className="font-mono">NEXT_PUBLIC_GOOGLE_MAPS_KEY</code> to your environment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
        </div>
      )}

      <div ref={mapRef} className="h-full w-full" />

      {popover && (
        <div
          className="pointer-events-none absolute z-20"
          style={{ left: popover.x, top: popover.y, transform: 'translate(-50%, -100%)' }}
        >
          <div className="pointer-events-auto mb-2 max-w-xs rounded-lg border border-line bg-ink-soft p-4 shadow-xl">
            <button
              type="button"
              onClick={() => setPopover(null)}
              className="absolute right-2 top-2 text-xs text-khaki-deep hover:text-bone transition-colors"
              aria-label="Close"
            >
              ✕
            </button>
            {popover.pin.category && (
              <span className="mb-2 inline-block rounded border border-accent px-2 py-0.5 text-[10px] font-700 uppercase tracking-widest text-accent">
                {popover.pin.category}
              </span>
            )}
            <p className="font-display text-sm font-800 uppercase text-bone">{popover.pin.label}</p>
            {popover.pin.country && (
              <p className="mt-0.5 text-[10px] font-600 uppercase tracking-widest text-khaki-deep">
                {popover.pin.country}
              </p>
            )}
            {popover.pin.note && (
              <p className="mt-2 text-xs leading-relaxed text-khaki">{popover.pin.note}</p>
            )}
            {popover.pin.related_post_id && (
              <a
                href={`/dispatches/${popover.pin.related_post_id}`}
                className="mt-3 inline-block text-xs font-600 uppercase tracking-widest text-accent hover:text-accent-soft transition-colors"
              >
                Read dispatch →
              </a>
            )}
          </div>
          <div className="mx-auto h-0 w-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-ink-soft" />
        </div>
      )}
    </div>
  )
}
