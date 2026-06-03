import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import type { TablesUpdate } from '@/db/types'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const { itemId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as Record<string, unknown>
  const { data, error } = await supabase
    .from('adventure_itinerary')
    .update(body as TablesUpdate<'adventure_itinerary'>)
    .eq('id', itemId)
    .select('*')
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ item: data })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const { itemId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase.from('adventure_itinerary').delete().eq('id', itemId)
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ ok: true })
}
