import { createClient } from '@/lib/supabase/server'
import { PhotosClient } from './PhotosClient'

export const metadata = { title: 'Photos | Base Camp' }

export default async function PhotosPage() {
  const supabase = await createClient()
  const { data: assets } = await supabase
    .from('media_assets')
    .select('id, storage_path, width, height, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  return (
    <div>
      <div className="mb-8">
        <p className="mb-1 text-xs font-700 uppercase tracking-widest text-accent">Base Camp</p>
        <h1 className="font-display text-2xl font-800 uppercase tracking-tight text-bone">
          Photos
        </h1>
        <p className="mt-1 text-sm text-khaki">
          Upload images to the media library. Use them as covers for dispatches and adventures.
        </p>
      </div>
      <PhotosClient initialAssets={assets ?? []} />
    </div>
  )
}
