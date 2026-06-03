'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Upload, X, Check, ChevronDown, ChevronUp } from 'lucide-react'
import { Dropzone } from './Dropzone'
import { MediaLibrary } from './MediaLibrary'

interface Asset {
  id: string
  storage_path: string
  width: number | null
  height: number | null
  created_at: string | null
}

function assetUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`
}

interface PostCoverPickerProps {
  name: string
  defaultValue?: string | null
  label?: string
}

export function PostCoverPicker({
  name,
  defaultValue,
  label = 'Cover Photo',
}: PostCoverPickerProps) {
  const [cover, setCover] = useState<string | null>(defaultValue ?? null)
  const [sessionUploads, setSessionUploads] = useState<string[]>([])
  const [showUpload, setShowUpload] = useState(false)
  const [libraryOpen, setLibraryOpen] = useState(false)
  const [assets, setAssets] = useState<Asset[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const fetchedRef = useRef(false)

  // Lazy-load assets when library opens
  useEffect(() => {
    if (!libraryOpen || fetchedRef.current) return
    fetchedRef.current = true
    setLoadingAssets(true)
    fetch('/api/media/assets')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { assets: Asset[] } | null) => {
        if (data) setAssets(data.assets)
        setLoadingAssets(false)
      })
      .catch(() => setLoadingAssets(false))
  }, [libraryOpen])

  async function refreshAssets() {
    fetchedRef.current = false
    setLoadingAssets(true)
    try {
      const res = await fetch('/api/media/assets')
      if (res.ok) {
        const data = (await res.json()) as { assets: Asset[] }
        setAssets(data.assets)
      }
    } finally {
      setLoadingAssets(false)
    }
  }

  function handleUploaded(storagePath: string) {
    setSessionUploads((prev) =>
      prev.includes(storagePath) ? prev : [storagePath, ...prev],
    )
    // Auto-select as cover if nothing is set yet
    if (!cover) setCover(storagePath)
  }

  function handleLibrarySelect(storagePath: string) {
    setCover(storagePath)
    setLibraryOpen(false)
  }

  return (
    <>
      {/* Hidden field submitted with the form */}
      <input type="hidden" name={name} value={cover ?? ''} />

      <div className="space-y-3">
        <span className="text-xs font-700 uppercase tracking-widest text-khaki-deep">
          {label}
        </span>

        {/* ── Cover preview (16:9) ── */}
        <div
          className="relative w-full overflow-hidden rounded-lg border border-line bg-ink-soft"
          style={{ aspectRatio: '16 / 9' }}
        >
          {cover ? (
            <>
              <Image
                src={assetUrl(cover)}
                alt="Cover photo"
                fill
                sizes="(max-width: 640px) 100vw, 672px"
                className="object-cover"
              />
              <div className="absolute bottom-2 left-3 rounded bg-ink/70 px-2 py-0.5 text-[10px] font-600 uppercase tracking-widest text-bone backdrop-blur-sm">
                Cover photo
              </div>
              <button
                type="button"
                onClick={() => setCover(null)}
                title="Remove cover photo"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-bone backdrop-blur-sm transition-colors hover:bg-red-500"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-1.5 text-center">
              <p className="text-xs text-khaki-deep">No cover photo selected</p>
              <p className="text-[10px] text-khaki-deep/60">
                Upload images below or choose from library
              </p>
            </div>
          )}
        </div>

        {/* ── Session uploads grid ── */}
        {sessionUploads.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] font-600 uppercase tracking-widest text-khaki-deep">
              Uploaded this session — click any to set as cover
            </p>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
              {sessionUploads.map((path) => {
                const isActive = cover === path
                return (
                  <button
                    key={path}
                    type="button"
                    onClick={() => setCover(path)}
                    title="Set as cover photo"
                    className={`relative aspect-square overflow-hidden rounded border transition-all ${
                      isActive
                        ? 'border-accent ring-2 ring-accent ring-offset-1 ring-offset-ink'
                        : 'border-line hover:border-accent/60'
                    }`}
                  >
                    <Image
                      src={assetUrl(path)}
                      alt=""
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-accent/20">
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-accent shadow">
                          <Check size={11} className="text-bone" />
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Upload section (collapsible) ── */}
        <div className="overflow-hidden rounded border border-line">
          <button
            type="button"
            onClick={() => setShowUpload((o) => !o)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-600 uppercase tracking-widest text-khaki-deep transition-colors hover:text-bone"
          >
            <Upload size={13} strokeWidth={2} />
            Upload images
            {showUpload ? (
              <ChevronUp size={13} className="ml-auto" />
            ) : (
              <ChevronDown size={13} className="ml-auto" />
            )}
          </button>
          {showUpload && (
            <div className="border-t border-line p-4">
              <Dropzone onUploaded={handleUploaded} />
            </div>
          )}
        </div>

        {/* ── Browse library ── */}
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="text-xs font-600 uppercase tracking-widest text-khaki-deep transition-colors hover:text-bone"
        >
          Browse media library →
        </button>
      </div>

      {/* ── Library modal ── */}
      {libraryOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLibraryOpen(false)
          }}
        >
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-line bg-ink-soft">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <h2 className="font-display text-sm font-700 uppercase tracking-widest text-bone">
                Choose Cover Photo
              </h2>
              <button
                type="button"
                onClick={() => setLibraryOpen(false)}
                className="text-khaki-deep transition-colors hover:text-bone"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <Dropzone
                onUploaded={(path) => {
                  handleUploaded(path)
                  refreshAssets()
                }}
              />
              {loadingAssets ? (
                <p className="text-center text-xs text-khaki-deep">Loading…</p>
              ) : (
                <MediaLibrary
                  assets={assets}
                  onRefresh={refreshAssets}
                  selectable
                  selected={cover}
                  onSelect={handleLibrarySelect}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
