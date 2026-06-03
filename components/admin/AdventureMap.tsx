'use client'

import { useEffect, useRef } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

export const ENTRY_TYPE_META: Record<string, { label: string; color: string; letter: string }> = {
  checkin: { label: 'Check-in', color: '#8B9A5A', letter: 'C' },
  fuel: { label: 'Fuel', color: '#EAB308', letter: 'F' },
  breakdown: { label: 'Breakdown', color: '#EF4444', letter: '!' },
  repair: { label: 'Repair', color: '#F97316', letter: 'R' },
  tyre: { label: 'Tyre', color: '#F59E0B', letter: 'T' },
  restaurant: { label: 'Restaurant', color: '#22C55E', letter: 'E' },
  find: { label: 'Cool Find', color: '#A855F7', letter: '\u2605' },
  camp: { label: 'Camp', color: '#14B8A6', letter: '\u2302' },
  note: { label: 'Note', color: '#6B7280', letter: 'N' },
}

export interface EntryMarker {
  id: string
  type: string
  lat: number
  lng: number
  title?: string | null
}

interface AdventureMapProps {
  entries: EntryMarker[]
  onMapClick?: (lat: number, lng: number) => void
  onMarkerClick?: (id: string) => void
  defaultLat?: number | null
  defaultLng?: number | null
}

function makePinSvg(color: string, letter: string) {
  return (
    'data:image/svg+xml;charset=UTF-8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
        <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z" fill="${color}" stroke="#fff" stroke-width="2"/>
        <text x="14" y="19" text-anchor="middle" fill="white" font-size="11" font-weight="bold" font-family="sans-serif">${letter}</text>
      </svg>`,
    )
  )
}

const MAP_STYLES = [
  { elementType: 'geometry', stylers: [{ color: '#1e2211' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8B9A5A' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1107' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#3a4020' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c3318' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#6b7a3a' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d2137' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

export function AdventureMap({
  entries,
  onMapClick,
  onMarkerClick,
  defaultLat,
  defaultLng,
}: AdventureMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const initializedRef = useRef(false)

  // Init map once
  useEffect(() => {
    if (initializedRef.current || !containerRef.current) return
    initializedRef.current = true

    setOptions({
      key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!,
      v: 'weekly',
    })

    async function init() {
      const { Map } = await importLibrary('maps')
      const { Marker } = (await importLibrary('marker')) as google.maps.MarkerLibrary
      if (!containerRef.current) return

      const withPos = entries.filter((e) => e.lat && e.lng)
      const center =
        withPos.length > 0
          ? { lat: withPos[0].lat, lng: withPos[0].lng }
          : { lat: defaultLat ?? -22, lng: defaultLng ?? 18 }

      const map = new Map(containerRef.current, {
        center,
        zoom: withPos.length > 0 ? 7 : 5,
        mapTypeId: 'terrain',
        styles: MAP_STYLES as google.maps.MapTypeStyle[],
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      })
      mapRef.current = map

      if (onMapClick) {
        map.addListener('click', (e: google.maps.MapMouseEvent) => {
          if (e.latLng) onMapClick(e.latLng.lat(), e.latLng.lng())
        })
      }

      renderMarkersWithClass(map, Marker)
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers when entries change
  useEffect(() => {
    if (!mapRef.current) return
    // Need Marker class — re-import (cached, instant)
    importLibrary('marker').then((lib) => {
      const { Marker } = lib as google.maps.MarkerLibrary
      renderMarkersWithClass(mapRef.current!, Marker)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, onMarkerClick])

  function renderMarkersWithClass(map: google.maps.Map, MarkerClass: typeof google.maps.Marker) {
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []

    const withPos = entries.filter((e) => e.lat && e.lng)
    withPos.forEach((entry) => {
      const meta = ENTRY_TYPE_META[entry.type] ?? ENTRY_TYPE_META.note
      const marker = new MarkerClass({
        position: { lat: entry.lat, lng: entry.lng },
        map,
        title: entry.title ?? meta.label,
        icon: {
          url: makePinSvg(meta.color, meta.letter),
          scaledSize: new google.maps.Size(28, 36),
          anchor: new google.maps.Point(14, 36),
        },
      })
      if (onMarkerClick) {
        marker.addListener('click', () => onMarkerClick(entry.id))
      }
      markersRef.current.push(marker)
    })

    if (withPos.length > 1 && mapRef.current) {
      const bounds = new google.maps.LatLngBounds()
      withPos.forEach((e) => bounds.extend({ lat: e.lat, lng: e.lng }))
      mapRef.current.fitBounds(bounds, 48)
    }
  }

  return <div ref={containerRef} className="h-full w-full rounded-lg" />
}
