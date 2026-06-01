'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  title_en: z.string().min(1, 'Title (EN) is required'),
  title_de: z.string().optional(),
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
  excerpt_de: z.string().optional(),
  body_en: z.string().optional(),
  body_de: z.string().optional(),
  sort_order: z.string().optional(),
  published: z.string().optional(),
  published_at: z.string().optional(),
  cover_image: z.string().optional(),
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
  return {
    title: { en: raw.title_en, ...(raw.title_de ? { de: raw.title_de } : {}) },
    slug: raw.slug,
    country: raw.country || null,
    location: raw.location || null,
    lat: raw.lat ? parseFloat(raw.lat) : null,
    lng: raw.lng ? parseFloat(raw.lng) : null,
    tag: raw.tag || null,
    excerpt: raw.excerpt_en
      ? { en: raw.excerpt_en, ...(raw.excerpt_de ? { de: raw.excerpt_de } : {}) }
      : null,
    body: raw.body_en
      ? { en: raw.body_en, ...(raw.body_de ? { de: raw.body_de } : {}) }
      : null,
    sort_order: raw.sort_order ? parseInt(raw.sort_order, 10) : null,
    published: raw.published === 'on',
    published_at: raw.published_at || null,
    cover_image: raw.cover_image || null,
  }
}

function extractRaw(formData: FormData) {
  return {
    title_en: formData.get('title_en') as string,
    title_de: (formData.get('title_de') as string) || undefined,
    slug: formData.get('slug') as string,
    country: (formData.get('country') as string) || undefined,
    location: (formData.get('location') as string) || undefined,
    lat: (formData.get('lat') as string) || undefined,
    lng: (formData.get('lng') as string) || undefined,
    tag: (formData.get('tag') as string) || undefined,
    excerpt_en: (formData.get('excerpt_en') as string) || undefined,
    excerpt_de: (formData.get('excerpt_de') as string) || undefined,
    body_en: (formData.get('body_en') as string) || undefined,
    body_de: (formData.get('body_de') as string) || undefined,
    sort_order: (formData.get('sort_order') as string) || undefined,
    published: (formData.get('published') as string) || undefined,
    published_at: (formData.get('published_at') as string) || undefined,
    cover_image: (formData.get('cover_image') as string) || undefined,
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
