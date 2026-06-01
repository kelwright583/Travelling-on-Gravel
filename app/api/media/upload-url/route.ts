import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  let body: { filename: string; contentType: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  const { filename, contentType } = body
  if (!filename || !contentType) {
    return Response.json({ message: 'filename and contentType are required' }, { status: 400 })
  }

  // Sanitise filename — strip path traversal, keep extension
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg'
  const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg'
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`

  const { data, error } = await supabase.storage
    .from('media')
    .createSignedUploadUrl(path)

  if (error) {
    return Response.json({ message: error.message }, { status: 500 })
  }

  return Response.json({ signedUrl: data.signedUrl, path, token: data.token })
}
