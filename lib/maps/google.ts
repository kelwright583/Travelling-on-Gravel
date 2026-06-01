import { setOptions } from '@googlemaps/js-api-loader'

export function initMapsLoader(): void {
  setOptions({
    key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? '',
    v: 'weekly',
    libraries: ['places', 'marker'],
  })
}

/** Brand-matching dark map style */
export const BRAND_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#15150f' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#b9a77b' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#15150f' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#21211a' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#3b4329' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3b4329' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1008' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1a1f10' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#3b4329' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1a1f10' }] },
]

export interface MapPin {
  id: string
  label: string
  lat: number
  lng: number
  category: string | null
  country: string | null
  note: string | null
  related_post_id: string | null
}
