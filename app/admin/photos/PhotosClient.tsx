'use client'

import { useState } from 'react'
import { Dropzone } from '@/components/admin/Dropzone'
import { MediaLibrary } from '@/components/admin/MediaLibrary'

interface Asset {
  id: string
  storage_path: string
  width: number | null
  height: number | null
  created_at: string | null
}

export function PhotosClient({ initialAssets }: { initialAssets: Asset[] }) {
  const [assets, setAssets] = useState(initialAssets)

  async function refresh() {
    try {
      const res = await fetch('/api/media/assets')
      if (res.ok) {
        const data = await res.json() as { assets: Asset[] }
        setAssets(data.assets)
      }
    } catch {
      // silently fail — stale list is acceptable
    }
  }

  function handleUploaded() {
    refresh()
  }

  return (
    <div className="space-y-8">
      <Dropzone onUploaded={handleUploaded} />
      <div>
        <h2 className="font-display mb-4 text-xs font-700 uppercase tracking-widest text-khaki-deep">
          Library ({assets.length})
        </h2>
        <MediaLibrary assets={assets} onRefresh={refresh} />
      </div>
    </div>
  )
}
