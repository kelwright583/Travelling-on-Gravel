'use client'

import dynamic from 'next/dynamic'
import type { MapPin } from '@/lib/maps/google'

const AdminPinsMap = dynamic(
  () => import('@/components/admin/AdminPinsMap').then((m) => m.AdminPinsMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center rounded-lg border border-line bg-ink" style={{ height: 320 }}>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      </div>
    ),
  },
)

export function AdminPinsMapClient({ pins }: { pins: MapPin[] }) {
  return <AdminPinsMap pins={pins} />
}
