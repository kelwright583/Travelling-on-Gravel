'use server'

import { createClient } from '@/lib/supabase/server'

export interface UploadedAsset {
  id: string
  storage_path: string
  width: number | null
  height: number | null
}

export async function recordUpload(
  storagePath: string,
  width: number | null,
  height: number | null,
): Promise<{ data: UploadedAsset | null; error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'Unauthorized' }

  const { data, error } = await supabase
    .from('media_assets')
    .insert({
      storage_path: storagePath,
      uploaded_by: user.id,
      width: width ?? null,
      height: height ?? null,
    })
    .select('id, storage_path, width, height')
    .single()

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function deleteAsset(id: string, storagePath: string): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase.storage.from('media').remove([storagePath])
  await supabase.from('media_assets').delete().eq('id', id)
}
