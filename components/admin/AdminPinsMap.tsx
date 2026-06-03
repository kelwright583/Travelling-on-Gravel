'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { importLibrary } from '@googlemaps/js-api-loader'
import { initMapsLoader, BRAND_MAP_STYLE, type MapPin } from '@/lib/maps/google'

interface AdminPinsMapProps {
  pins: MapPin[]
}

const CATEGORY_COLORS: Record<string, string> = {
  Camp: '#3B4329',
  Border: '#8E7C50',
  Fuel: '#D4A017',
  Water: '#4A90D9',
  Scenic: '#7A9E3E',
  Mechanic: '#E05A00',
  Restaurant: '#9B3D8C',
  Find: '#B9A77B',
  Other: '#535C3A',
}

export function AdminPinsMap({ pins }: AdminPinsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (!mapRef.current || pins.length === 0) return
    initMapsLoader()

    let cancelled = false

    async function init() {
      const [{ Map }, markerLib] = await Promise.all([
        importLibrary('maps'),
        importLibrary('marker') as Promise<google.maps.MarkerLibrary>,
      ])
      if (cancelled || !mapRef.current) return

      const { Marker } = markerLib

      const bounds = new google.maps.LatLngBounds()
      pins.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }))

      const map = new Map(mapRef.current, {
        styles: BRAND_MAP_STYLE,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
      })
      map.fitBounds(bounds, 60)

      for (const pin of pins) {
        const color = CATEGORY_COLORS[pin.category ?? ''] ?? '#D75E2C'
        const marker = new Marker({
          position: { lat: pin.lat, lng: pin.lng },
          map,
          title: pin.label,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '#EFEAD9',
            strokeWeight: 1.5,
            scale: 8,
          },
        })
        marker.addListener('click', () => {
          router.push(`/admin/pins/${pin.id}`)
        })
      }
    }

    init().catch(console.error)
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="overflow-hidden rounded-lg border border-line" style={{ height: 320 }}>
      <div ref={mapRef} className="h-full w-full" />
    </div>
  )
}
