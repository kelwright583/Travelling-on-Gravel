import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { data: assets } = await supabase
    .from('media_assets')
    .select('id, storage_path, width, height, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  return Response.json({ assets: assets ?? [] })
}
