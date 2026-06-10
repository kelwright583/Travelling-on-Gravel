'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  title_en: z.string().min(1, 'Title is required'),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, hyphens only'),
  country: z.string().optional(),
  location: z.string().optional(),
  lat: z.string().optional(),
  lng: z.string().optional(),
  tag: z.string().optional(),
  excerpt_en: z.string().optional(),
  body_en: z.string().optional(),
  sort_order: z.string().optional(),
  published: z.string().optional(),
  cover_overlay: z.string().optional(),
  published_at: z.string().optional(),
  cover_image: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  status: z.string().optional(),
  vehicle: z.string().optional(),
  total_distance_km: z.string().optional(),
  countries_csv: z.string().optional(),
  prep_items_json: z.string().optional(),
  budget_zar: z.string().optional(),
  budget_notes: z.string().optional(),
})

export type AdventureState = { message: string; ok: boolean }

async function getAuthUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

function buildPayload(raw: z.infer<typeof schema>) {
  const countries = raw.countries_csv
    ? raw.countries_csv.split(',').map((s) => s.trim()).filter(Boolean)
    : []
  let prepItems = []
  try { prepItems = raw.prep_items_json ? JSON.parse(raw.prep_items_json) : [] } catch { prepItems = [] }

  return {
    title: { en: raw.title_en },
    slug: raw.slug,
    country: raw.country || null,
    location: raw.location || null,
    lat: raw.lat ? parseFloat(raw.lat) : null,
    lng: raw.lng ? parseFloat(raw.lng) : null,
    tag: raw.tag || null,
    excerpt: raw.excerpt_en ? { en: raw.excerpt_en } : null,
    body: raw.body_en ? { en: raw.body_en } : null,
    sort_order: raw.sort_order ? parseInt(raw.sort_order, 10) : null,
    published: raw.published === 'on',
    cover_overlay: raw.cover_overlay === 'on',
    published_at: raw.published_at || null,
    cover_image: raw.cover_image || null,
    start_date: raw.start_date || null,
    end_date: raw.end_date || null,
    status: raw.status || 'dreaming',
    vehicle: raw.vehicle || null,
    total_distance_km: raw.total_distance_km ? parseInt(raw.total_distance_km, 10) : null,
    countries,
    prep_items: prepItems,
    budget_zar: raw.budget_zar ? parseInt(raw.budget_zar, 10) : null,
    budget_notes: raw.budget_notes || null,
  }
}

function extractRaw(formData: FormData) {
  return {
    title_en: formData.get('title_en') as string,
    slug: formData.get('slug') as string,
    country: (formData.get('country') as string) || undefined,
    location: (formData.get('location') as string) || undefined,
    lat: (formData.get('lat') as string) || undefined,
    lng: (formData.get('lng') as string) || undefined,
    tag: (formData.get('tag') as string) || undefined,
    excerpt_en: (formData.get('excerpt_en') as string) || undefined,
    body_en: (formData.get('body_en') as string) || undefined,
    sort_order: (formData.get('sort_order') as string) || undefined,
    published: (formData.get('published') as string) || undefined,
    cover_overlay: (formData.get('cover_overlay') as string) || undefined,
    published_at: (formData.get('published_at') as string) || undefined,
    cover_image: (formData.get('cover_image') as string) || undefined,
    start_date: (formData.get('start_date') as string) || undefined,
    end_date: (formData.get('end_date') as string) || undefined,
    status: (formData.get('status') as string) || undefined,
    vehicle: (formData.get('vehicle') as string) || undefined,
    total_distance_km: (formData.get('total_distance_km') as string) || undefined,
    countries_csv: (formData.get('countries_csv') as string) || undefined,
    prep_items_json: (formData.get('prep_items_json') as string) || undefined,
    budget_zar: (formData.get('budget_zar') as string) || undefined,
    budget_notes: (formData.get('budget_notes') as string) || undefined,
  }
}

export async function createAdventure(
  _prev: AdventureState,
  formData: FormData,
): Promise<AdventureState> {
  const { supabase, user } = await getAuthUser()
  if (!user) return { message: 'Unauthorized', ok: false }

  const result = schema.safeParse(extractRaw(formData))
  if (!result.success) return { message: result.error.issues[0].message, ok: false }

  const { data, error } = await supabase
    .from('adventures')
    .insert(buildPayload(result.data))
    .select('id')
    .single()

  if (error) return { message: error.message, ok: false }

  revalidatePath('/adventures')
  revalidatePath('/')
  redirect(`/admin/adventures/${data.id}`)
}

export async function updateAdventure(
  id: string,
  _prev: AdventureState,
  formData: FormData,
): Promise<AdventureState> {
  const { supabase, user } = await getAuthUser()
  if (!user) return { message: 'Unauthorized', ok: false }

  const result = schema.safeParse(extractRaw(formData))
  if (!result.success) return { message: result.error.issues[0].message, ok: false }

  const { error } = await supabase
    .from('adventures')
    .update(buildPayload(result.data))
    .eq('id', id)

  if (error) return { message: error.message, ok: false }

  revalidatePath('/adventures')
  revalidatePath(`/adventures/${result.data.slug}`)
  revalidatePath('/')
  return { message: 'Adventure saved.', ok: true }
}

export async function deleteAdventure(id: string): Promise<void> {
  const { supabase, user } = await getAuthUser()
  if (!user) return

  await supabase.from('adventures').delete().eq('id', id)
  revalidatePath('/adventures')
  revalidatePath('/')
  redirect('/admin/adventures')
}

export async function goLive(id: string): Promise<AdventureState> {
  const { supabase, user } = await getAuthUser()
  if (!user) return { message: 'Unauthorized', ok: false }

  const { error } = await supabase
    .from('adventures')
    .update({ status: 'live', actual_departure: new Date().toISOString() })
    .eq('id', id)

  if (error) return { message: error.message, ok: false }
  revalidatePath('/adventures')
  revalidatePath('/')
  return { message: 'Adventure is now LIVE. Drive safe.', ok: true }
}

export async function goReviewing(id: string): Promise<AdventureState> {
  const { supabase, user } = await getAuthUser()
  if (!user) return { message: 'Unauthorized', ok: false }

  const { error } = await supabase
    .from('adventures')
    .update({ status: 'reviewing', actual_return: new Date().toISOString() })
    .eq('id', id)

  if (error) return { message: error.message, ok: false }
  revalidatePath('/adventures')
  revalidatePath('/')
  return { message: 'Welcome back. Write it up while it\'s fresh.', ok: true }
}
