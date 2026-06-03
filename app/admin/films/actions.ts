'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

function parseYouTubeId(url: string): string | null {
  const patterns = [/[?&]v=([^&]+)/, /youtu\.be\/([^?]+)/, /embed\/([^?&]+)/]
  for (const pattern of patterns) {
    const m = url.match(pattern)
    if (m) return m[1]
  }
  return null
}

const schema = z.object({
  title_en: z.string().min(1, 'Title is required'),
  youtube_url: z.string().url('Must be a valid YouTube URL'),
  description_en: z.string().optional(),
  duration: z.string().optional(),
  sort_order: z.string().optional(),
  published: z.string().optional(),
  cover_overlay: z.string().optional(),
})

export type FilmState = { message: string; ok: boolean }

async function getAuthUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

function extractRaw(formData: FormData) {
  return {
    title_en: formData.get('title_en') as string,
    youtube_url: formData.get('youtube_url') as string,
    description_en: (formData.get('description_en') as string) || undefined,
    duration: (formData.get('duration') as string) || undefined,
    sort_order: (formData.get('sort_order') as string) || undefined,
    published: (formData.get('published') as string) || undefined,
    cover_overlay: (formData.get('cover_overlay') as string) || undefined,
  }
}

function buildPayload(raw: z.infer<typeof schema>) {
  const youtubeId = parseYouTubeId(raw.youtube_url) ?? ''
  return {
    title: { en: raw.title_en },
    youtube_url: raw.youtube_url,
    youtube_id: youtubeId,
    description: raw.description_en ? { en: raw.description_en } : null,
    duration: raw.duration || null,
    sort_order: raw.sort_order ? parseInt(raw.sort_order, 10) : null,
    published: raw.published === 'on',
    cover_overlay: raw.cover_overlay === 'on',
  }
}

export async function createFilm(
  _prev: FilmState,
  formData: FormData,
): Promise<FilmState> {
  const { supabase, user } = await getAuthUser()
  if (!user) return { message: 'Unauthorized', ok: false }

  const raw = extractRaw(formData)
  const result = schema.safeParse(raw)
  if (!result.success) return { message: result.error.issues[0].message, ok: false }

  const youtubeId = parseYouTubeId(result.data.youtube_url)
  if (!youtubeId) return { message: 'Could not extract YouTube video ID from URL', ok: false }

  const { data, error } = await supabase
    .from('films')
    .insert(buildPayload(result.data))
    .select('id')
    .single()

  if (error) return { message: error.message, ok: false }

  revalidatePath('/films')
  revalidatePath('/')
  redirect(`/admin/films/${data.id}`)
}

export async function updateFilm(
  id: string,
  _prev: FilmState,
  formData: FormData,
): Promise<FilmState> {
  const { supabase, user } = await getAuthUser()
  if (!user) return { message: 'Unauthorized', ok: false }

  const result = schema.safeParse(extractRaw(formData))
  if (!result.success) return { message: result.error.issues[0].message, ok: false }

  const youtubeId = parseYouTubeId(result.data.youtube_url)
  if (!youtubeId) return { message: 'Could not extract YouTube video ID from URL', ok: false }

  const { error } = await supabase
    .from('films')
    .update(buildPayload(result.data))
    .eq('id', id)

  if (error) return { message: error.message, ok: false }

  revalidatePath('/films')
  revalidatePath('/')
  return { message: 'Film saved.', ok: true }
}

export async function deleteFilm(id: string): Promise<void> {
  const { supabase, user } = await getAuthUser()
  if (!user) return

  await supabase.from('films').delete().eq('id', id)
  revalidatePath('/films')
  revalidatePath('/')
  redirect('/admin/films')
}
