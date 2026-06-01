'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, X, Check, Loader } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { recordUpload } from '@/app/admin/photos/actions'
import { cn } from '@/lib/utils'

interface DropzoneProps {
  onUploaded?: (storagePath: string, assetId: string) => void
}

interface FileUploadState {
  file: File
  id: string
  status: 'compressing' | 'uploading' | 'done' | 'error'
  progress: number
  error?: string
  storagePath?: string
}

async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 1.5,
    maxWidthOrHeight: 2500,
    useWebWorker: true,
    fileType: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
  })
}

async function getSignedUploadUrl(
  filename: string,
  contentType: string,
): Promise<{ signedUrl: string; path: string } | null> {
  try {
    const res = await fetch('/api/media/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, contentType }),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      resolve(null)
      URL.revokeObjectURL(url)
    }
    img.src = url
  })
}

export function Dropzone({ onUploaded }: DropzoneProps) {
  const [uploads, setUploads] = useState<FileUploadState[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFiles = useCallback(
    async (files: File[]) => {
      const imageFiles = files.filter((f) => f.type.startsWith('image/'))
      if (!imageFiles.length) return

      const newUploads: FileUploadState[] = imageFiles.map((file) => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        status: 'compressing',
        progress: 0,
      }))

      setUploads((prev) => [...prev, ...newUploads])

      for (const upload of newUploads) {
        const updateUpload = (patch: Partial<FileUploadState>) =>
          setUploads((prev) =>
            prev.map((u) => (u.id === upload.id ? { ...u, ...patch } : u)),
          )

        try {
          // 1. Compress
          const compressed = await compressImage(upload.file)
          updateUpload({ status: 'uploading', progress: 20 })

          // 2. Get signed URL
          const urlData = await getSignedUploadUrl(upload.file.name, compressed.type)
          if (!urlData) throw new Error('Failed to get upload URL')
          updateUpload({ progress: 40 })

          // 3. Upload to Supabase Storage via signed URL
          const uploadRes = await fetch(urlData.signedUrl, {
            method: 'PUT',
            headers: { 'Content-Type': compressed.type },
            body: compressed,
          })
          if (!uploadRes.ok) throw new Error('Storage upload failed')
          updateUpload({ progress: 75 })

          // 4. Read dimensions
          const dims = await getImageDimensions(compressed)

          // 5. Record in media_assets
          const { data: asset, error } = await recordUpload(
            urlData.path,
            dims?.width ?? null,
            dims?.height ?? null,
          )
          if (error || !asset) throw new Error(error ?? 'Failed to record asset')

          updateUpload({ status: 'done', progress: 100, storagePath: asset.storage_path })
          onUploaded?.(asset.storage_path, asset.id)
        } catch (err) {
          updateUpload({
            status: 'error',
            error: err instanceof Error ? err.message : 'Upload failed',
          })
        }
      }
    },
    [onUploaded],
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      processFiles(Array.from(e.dataTransfer.files))
    },
    [processFiles],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(Array.from(e.target.files))
      e.target.value = ''
    },
    [processFiles],
  )

  return (
    <div className="space-y-4">
      {/* Drop target */}
      <button
        type="button"
        className={cn(
          'flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed py-12 text-center transition-colors',
          dragging
            ? 'border-accent bg-accent/5 text-accent'
            : 'border-line bg-ink-soft text-khaki-deep hover:border-accent/50 hover:text-khaki',
        )}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        aria-label="Click or drag images to upload"
      >
        <Upload size={32} />
        <div>
          <p className="text-sm font-600">Drop images here or click to browse</p>
          <p className="mt-1 text-xs">JPG, PNG, WEBP · Max 5 MB · Auto-compressed to 2500px / 1.5 MB</p>
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        onChange={handleChange}
      />

      {/* Upload progress list */}
      {uploads.length > 0 && (
        <ul className="space-y-2">
          {uploads.map((u) => (
            <li
              key={u.id}
              className="flex items-center gap-3 rounded border border-line bg-ink-soft px-4 py-3 text-sm"
            >
              <span className="flex-1 truncate text-bone">{u.file.name}</span>
              {u.status === 'compressing' && (
                <span className="flex items-center gap-1.5 text-xs text-khaki-deep">
                  <Loader size={12} className="animate-spin" /> Compressing…
                </span>
              )}
              {u.status === 'uploading' && (
                <span className="flex items-center gap-1.5 text-xs text-khaki-deep">
                  <Loader size={12} className="animate-spin" /> {u.progress}%
                </span>
              )}
              {u.status === 'done' && (
                <span className="flex items-center gap-1.5 text-xs text-green-400">
                  <Check size={12} /> Done
                </span>
              )}
              {u.status === 'error' && (
                <span className="flex items-center gap-1.5 text-xs text-red-400">
                  <X size={12} /> {u.error}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
