'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Dropzone } from './Dropzone'
import { MediaLibrary } from './MediaLibrary'

interface Asset {
  id: string
  storage_path: string
  width: number | null
  height: number | null
  created_at: string | null
}

interface MediaPickerProps {
  name: string
  defaultValue?: string | null
  label?: string
}

function assetUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`
}

export function MediaPicker({
  name,
  defaultValue,
  label = 'Cover Image',
}: MediaPickerProps) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(defaultValue ?? null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(false)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!open) return
    if (fetchedRef.current) return
    fetchedRef.current = true

    // Load assets asynchronously — setState only in callbacks, not synchronously
    const controller = new AbortController()
    fetch('/api/media/assets', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { assets: Asset[] } | null) => {
        if (data) setAssets(data.assets)
        setLoading(false)
      })
      .catch(() => setLoading(false))

    setLoading(true)

    return () => controller.abort()
  }, [open])

  async function loadAssets() {
    fetchedRef.current = false
    setLoading(true)
    try {
      const res = await fetch('/api/media/assets')
      if (res.ok) {
        const data = (await res.json()) as { assets: Asset[] }
        setAssets(data.assets)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleSelect(path: string) {
    setSelected(path)
    setOpen(false)
  }

  function handleUploaded(storagePath: string) {
    setSelected(storagePath)
    loadAssets()
  }

  return (
    <>
      <input type="hidden" name={name} value={selected ?? ''} />

      <div className="flex flex-col gap-2">
        <span className="text-xs font-700 uppercase tracking-widest text-khaki-deep">
          {label}
        </span>

        <div className="flex items-start gap-4">
          {selected ? (
            <div className="relative h-24 w-40 overflow-hidden rounded border border-line bg-ink-soft">
              <Image
                src={assetUrl(selected)}
                alt="Cover image preview"
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
          ) : (
            <div className="flex h-24 w-40 items-center justify-center rounded border border-dashed border-line bg-ink-soft text-xs text-khaki-deep">
              No image
            </div>
          )}

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="rounded border border-accent px-3 py-1.5 text-xs font-700 uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-bone"
            >
              {selected ? 'Change Image' : 'Select Image'}
            </button>
            {selected && (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-xs text-khaki-deep hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false)
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-line bg-ink-soft">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="font-display text-sm font-700 uppercase tracking-widest text-bone">
                Select Image
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-khaki-deep hover:text-bone transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 p-6">
              <Dropzone onUploaded={handleUploaded} />

              {loading ? (
                <p className="text-center text-xs text-khaki-deep">Loading…</p>
              ) : (
                <MediaLibrary
                  assets={assets}
                  onRefresh={loadAssets}
                  selectable
                  selected={selected}
                  onSelect={handleSelect}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
