import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> },
) {
  const { entryId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as Record<string, unknown>
  const { data, error } = await supabase
    .from('adventure_entries')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', entryId)
    .select('*')
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ entry: data })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> },
) {
  const { entryId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.from('adventure_entries').delete().eq('id', entryId)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
