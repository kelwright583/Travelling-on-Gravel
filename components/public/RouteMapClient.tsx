'use client'

import dynamic from 'next/dynamic'

const RouteMap = dynamic(
  () => import('@/components/admin/AdventureMap').then((m) => m.AdventureMap),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse rounded-lg bg-ink-soft" /> },
)

export { RouteMap }
