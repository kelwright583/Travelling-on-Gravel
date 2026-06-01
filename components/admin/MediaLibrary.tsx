'use client'

import { useTransition } from 'react'
import Image from 'next/image'
import { Trash2, Check } from 'lucide-react'
import { deleteAsset } from '@/app/admin/photos/actions'
import { cn } from '@/lib/utils'

interface Asset {
  id: string
  storage_path: string
  width: number | null
  height: number | null
  created_at: string | null
}

interface MediaLibraryProps {
  assets: Asset[]
  onRefresh?: () => void
  selectable?: boolean
  selected?: string | null
  onSelect?: (storagePath: string) => void
}

function assetUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`
}

export function MediaLibrary({
  assets,
  onRefresh,
  selectable,
  selected,
  onSelect,
}: MediaLibraryProps) {
  const [isPending, startTransition] = useTransition()

  function handleDelete(asset: Asset) {
    if (!confirm('Delete this image permanently?')) return
    startTransition(async () => {
      await deleteAsset(asset.id, asset.storage_path)
      onRefresh?.()
    })
  }

  if (assets.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-khaki-deep">
        No images yet. Upload some above.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      {assets.map((asset) => {
        const isSelected = selected === asset.storage_path
        return (
          <div
            key={asset.id}
            className={cn(
              'group relative aspect-square overflow-hidden rounded border transition-colors',
              selectable ? 'cursor-pointer' : '',
              isSelected ? 'border-accent ring-2 ring-accent' : 'border-line',
            )}
            onClick={() => selectable && onSelect?.(asset.storage_path)}
          >
            <Image
              src={assetUrl(asset.storage_path)}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
            />

            {isSelected && (
              <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent">
                <Check size={11} className="text-bone" />
              </div>
            )}

            {!selectable && (
              <button
                type="button"
                onClick={() => handleDelete(asset)}
                disabled={isPending}
                aria-label="Delete image"
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink/80 text-bone opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500 disabled:cursor-not-allowed"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
