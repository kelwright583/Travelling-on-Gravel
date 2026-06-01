import { Image as ImageIcon } from 'lucide-react'

export const metadata = { title: 'Photos | Base Camp' }

export default function PhotosPage() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <ImageIcon size={40} className="mb-4 text-khaki-deep" aria-hidden="true" />
      <h1 className="font-display mb-2 text-xl font-800 uppercase tracking-tight text-bone">
        Photos / Media
      </h1>
      <p className="max-w-sm text-sm text-khaki">
        Drag-and-drop media library with Storage integration coming in Phase 6.
      </p>
    </div>
  )
}
