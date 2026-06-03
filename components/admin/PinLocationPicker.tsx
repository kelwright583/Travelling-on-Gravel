'use client'

import { useEffect, useRef, useState } from 'react'
import { importLibrary } from '@googlemaps/js-api-loader'
import { initMapsLoader, BRAND_MAP_STYLE } from '@/lib/maps/google'
import { Search, Navigation2, MapPin } from 'lucide-react'

interface PinLocationPickerProps {
  initialLat?: number | null
  initialLng?: number | null
  onLocationChange: (lat: number, lng: number, country: string | null) => void
}

export function PinLocationPicker({ initialLat, initialLng, onLocationChange }: PinLocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)
  const placeMarkerRef = useRef<((latLng: google.maps.LatLng) => void) | null>(null)

  const initialCoords =
    initialLat != null && initialLng != null ? { lat: initialLat, lng: initialLng } : null

  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(initialCoords)
  const [loading, setLoading] = useState(true)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)

  useEffect(() => {
    if (!mapRef.current) return
    initMapsLoader()

    let cancelled = false

    async function init() {
      const [{ Map }, markerLib, geocodingLib, placesLib] = await Promise.all([
        importLibrary('maps'),
        importLibrary('marker') as Promise<google.maps.MarkerLibrary>,
        importLibrary('geocoding') as Promise<google.maps.GeocodingLibrary>,
        importLibrary('places') as Promise<google.maps.PlacesLibrary>,
      ])

      if (cancelled || !mapRef.current) return

      const { Marker } = markerLib
      const { Geocoder } = geocodingLib
      const { Autocomplete } = placesLib

      const center = initialCoords ?? { lat: -15, lng: 25 }
      const map = new Map(mapRef.current, {
        center,
        zoom: initialCoords ? 13 : 4,
        styles: BRAND_MAP_STYLE,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })
      mapInstanceRef.current = map

      const geocoder = new Geocoder()
      geocoderRef.current = geocoder

      function reverseGeocode(lat: number, lng: number) {
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status !== 'OK' || !results?.length) {
            onLocationChange(lat, lng, null)
            return
          }
          const countryComp = results[0]?.address_components?.find((c) =>
            c.types.includes('country'),
          )
          onLocationChange(lat, lng, countryComp?.long_name ?? null)
        })
      }

      function markerIcon() {
        return {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#D75E2C',
          fillOpacity: 1,
          strokeColor: '#EFEAD9',
          strokeWeight: 2,
          scale: 11,
        }
      }

      function placeMarker(latLng: google.maps.LatLng) {
        const c = { lat: latLng.lat(), lng: latLng.lng() }
        setCoords(c)
        reverseGeocode(c.lat, c.lng)

        if (markerRef.current) {
          markerRef.current.setPosition(latLng)
        } else {
          const m = new Marker({
            position: latLng,
            map,
            draggable: true,
            icon: markerIcon(),
            animation: google.maps.Animation.DROP,
          })
          m.addListener('dragend', () => {
            const pos = m.getPosition()
            if (!pos) return
            setCoords({ lat: pos.lat(), lng: pos.lng() })
            reverseGeocode(pos.lat(), pos.lng())
          })
          markerRef.current = m
        }
      }

      placeMarkerRef.current = placeMarker

      // Drop initial marker
      if (initialCoords) {
        placeMarker(new google.maps.LatLng(initialCoords.lat, initialCoords.lng))
      }

      // Click map to drop pin
      map.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) placeMarker(e.latLng)
      })

      // Places Autocomplete
      if (searchInputRef.current) {
        const ac = new Autocomplete(searchInputRef.current, {
          fields: ['geometry', 'address_components', 'name'],
        })
        ac.addListener('place_changed', () => {
          const place = ac.getPlace()
          if (!place.geometry?.location) return
          map.panTo(place.geometry.location)
          map.setZoom(13)
          placeMarker(place.geometry.location)
        })
      }

      setLoading(false)
    }

    init().catch(() => {
      if (!cancelled) setLoading(false)
    })

    return () => {
      cancelled = true
      markerRef.current?.setMap(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleMyLocation() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported by this browser.')
      return
    }
    setGeoLoading(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false)
        const latLng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)
        mapInstanceRef.current?.panTo(latLng)
        mapInstanceRef.current?.setZoom(14)
        placeMarkerRef.current?.(latLng)
      },
      () => {
        setGeoLoading(false)
        setGeoError('Location access denied. Enable location in your browser settings.')
      },
      { timeout: 10000 },
    )
  }

  return (
    <div className="space-y-3">
      {/* Search + My Location */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-khaki-deep"
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search for a place, address, or camp…"
            autoComplete="off"
            className="w-full rounded border border-line bg-ink py-2 pl-9 pr-3 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={handleMyLocation}
          disabled={geoLoading}
          className="flex items-center gap-2 rounded border border-line px-3 py-2 text-xs font-600 text-khaki transition-colors hover:border-accent hover:text-bone disabled:opacity-50"
        >
          <Navigation2 size={14} className={geoLoading ? 'animate-pulse text-accent' : ''} />
          {geoLoading ? 'Locating…' : 'My Location'}
        </button>
      </div>

      {/* Map */}
      <div className="relative overflow-hidden rounded-lg border border-line" style={{ height: 340 }}>
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-ink">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
            <p className="text-xs text-khaki-deep">Loading map…</p>
          </div>
        )}
        <div ref={mapRef} className="h-full w-full" />
        {!loading && !coords && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="rounded-lg bg-ink/80 px-4 py-3 text-center backdrop-blur-sm">
              <MapPin size={18} className="mx-auto mb-1.5 text-accent" />
              <p className="text-xs text-bone">Search above or click the map to drop a pin</p>
            </div>
          </div>
        )}
      </div>

      {/* Coords readout */}
      {coords ? (
        <p className="font-mono text-[11px] text-khaki-deep">
          {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
          <span className="ml-2 normal-case italic">— drag the pin to fine-tune</span>
        </p>
      ) : (
        <p className="text-[11px] text-khaki-deep">No location set</p>
      )}

      {geoError && <p className="text-xs text-red-400">{geoError}</p>}
    </div>
  )
}
