'use client'

import { useEffect, useRef, useState } from 'react'
import { importLibrary } from '@googlemaps/js-api-loader'
import { initMapsLoader } from '@/lib/maps/google'
import { Search, Navigation2, MapPin, X } from 'lucide-react'

export interface LocationValue {
  lat: number
  lng: number
  name: string
}

interface LocationPickerProps {
  /** Initial value — populated when editing an existing record */
  defaultLat?: number | null
  defaultLng?: number | null
  defaultName?: string | null
  /** Called whenever the location changes */
  onChange: (value: LocationValue | null) => void
  placeholder?: string
}

/**
 * Compact location picker — Places Autocomplete + "Use my location" button.
 * No embedded map; suitable for modals and tight form layouts.
 * The parent is responsible for rendering hidden inputs if needed.
 */
export function LocationPicker({
  defaultLat,
  defaultLng,
  defaultName,
  onChange,
  placeholder = 'Search for a place…',
}: LocationPickerProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [value, setValue] = useState<LocationValue | null>(
    defaultLat != null && defaultLng != null
      ? { lat: defaultLat, lng: defaultLng, name: defaultName ?? '' }
      : null,
  )
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const geocoderRef = useRef<google.maps.Geocoder | null>(null)

  useEffect(() => {
    initMapsLoader()
    let cancelled = false

    async function init() {
      const [geocodingLib, placesLib] = await Promise.all([
        importLibrary('geocoding') as Promise<google.maps.GeocodingLibrary>,
        importLibrary('places') as Promise<google.maps.PlacesLibrary>,
      ])

      if (cancelled) return

      const { Geocoder } = geocodingLib
      const { Autocomplete } = placesLib
      geocoderRef.current = new Geocoder()

      if (searchInputRef.current) {
        const ac = new Autocomplete(searchInputRef.current, {
          fields: ['geometry', 'name', 'formatted_address'],
        })
        ac.addListener('place_changed', () => {
          const place = ac.getPlace()
          if (!place.geometry?.location) return
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          const name = place.name ?? place.formatted_address ?? ''
          const next = { lat, lng, name }
          setValue(next)
          onChange(next)
          // Keep input text as place name
          if (searchInputRef.current) searchInputRef.current.value = name
        })
      }

      setReady(true)
    }

    init().catch(() => { if (!cancelled) setReady(true) })
    return () => { cancelled = true }
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
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setGeoLoading(false)

        if (geocoderRef.current) {
          geocoderRef.current.geocode({ location: { lat, lng } }, (results, status) => {
            const name =
              status === 'OK' && results?.length
                ? (results[0].formatted_address ?? '')
                : `${lat.toFixed(5)}, ${lng.toFixed(5)}`
            const next = { lat, lng, name }
            setValue(next)
            onChange(next)
            if (searchInputRef.current) searchInputRef.current.value = name
          })
        } else {
          const next = { lat, lng, name: `${lat.toFixed(5)}, ${lng.toFixed(5)}` }
          setValue(next)
          onChange(next)
        }
      },
      () => {
        setGeoLoading(false)
        setGeoError('Location access denied. Enable location in browser settings.')
      },
      { timeout: 10000 },
    )
  }

  function handleClear() {
    setValue(null)
    onChange(null)
    if (searchInputRef.current) searchInputRef.current.value = ''
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-khaki-deep" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={ready ? placeholder : 'Loading maps…'}
            defaultValue={defaultName ?? ''}
            autoComplete="off"
            disabled={!ready}
            className="w-full rounded border border-line bg-ink py-2 pl-9 pr-3 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none disabled:opacity-50"
          />
        </div>
        <button
          type="button"
          onClick={handleMyLocation}
          disabled={!ready || geoLoading}
          title="Use my current location"
          className="flex items-center gap-1.5 rounded border border-line px-3 py-2 text-xs font-600 text-khaki transition-colors hover:border-accent hover:text-bone disabled:opacity-50"
        >
          <Navigation2 size={13} className={geoLoading ? 'animate-pulse text-accent' : ''} />
          <span className="hidden sm:inline">{geoLoading ? 'Locating…' : 'My location'}</span>
        </button>
      </div>

      {/* Confirmed location strip */}
      {value && (
        <div className="flex items-center justify-between rounded border border-accent/30 bg-accent/5 px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={13} className="shrink-0 text-accent" />
            <span className="truncate text-xs text-bone">{value.name || `${value.lat.toFixed(5)}, ${value.lng.toFixed(5)}`}</span>
            <span className="shrink-0 font-mono text-[10px] text-khaki-deep">
              {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
            </span>
          </div>
          <button type="button" onClick={handleClear} className="ml-2 shrink-0 text-khaki-deep hover:text-red-400 transition-colors">
            <X size={13} />
          </button>
        </div>
      )}

      {geoError && <p className="text-xs text-red-400">{geoError}</p>}
    </div>
  )
}
