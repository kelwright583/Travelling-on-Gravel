import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'
import type { TablesInsert } from '@/db/types'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: items, error } = await supabase
    .from('adventure_itinerary')
    .select('*')
    .eq('adventure_id', id)
    .order('sort_order', { ascending: true })
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ items: items ?? [] })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as Record<string, unknown>
  const { data, error } = await supabase
    .from('adventure_itinerary')
    .insert({ ...(body as TablesInsert<'adventure_itinerary'>), adventure_id: id })
    .select('*')
    .single()
  if (error) return Response.json({ error: error.message }, { status: 500 })
  return Response.json({ item: data })
}
