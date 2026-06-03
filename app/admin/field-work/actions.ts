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
  excerpt_en: z.string().optional(),
  body_en: z.string().optional(),
  tags_json: z.string().optional(),
  published: z.string().optional(),
  cover_overlay: z.string().optional(),
  published_at: z.string().optional(),
  cover_image: z.string().optional(),
})

export type PostState = { message: string; ok: boolean }

async function getAuthUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

function buildPayload(raw: z.infer<typeof schema>) {
  let tags: string[] = []
  try { tags = JSON.parse(raw.tags_json ?? '[]') } catch { /* keep empty */ }
  return {
    title: { en: raw.title_en },
    slug: raw.slug,
    excerpt: raw.excerpt_en ? { en: raw.excerpt_en } : null,
    body: raw.body_en ? { en: raw.body_en } : null,
    tags,
    published: raw.published === 'on',
    cover_overlay: raw.cover_overlay === 'on',
    published_at: raw.published_at || null,
    cover_image: raw.cover_image || null,
  }
}

function extractRaw(formData: FormData) {
  return {
    title_en: formData.get('title_en') as string,
    slug: formData.get('slug') as string,
    excerpt_en: (formData.get('excerpt_en') as string) || undefined,
    body_en: (formData.get('body_en') as string) || undefined,
    tags_json: (formData.get('tags_json') as string) || undefined,
    published: (formData.get('published') as string) || undefined,
    cover_overlay: (formData.get('cover_overlay') as string) || undefined,
    published_at: (formData.get('published_at') as string) || undefined,
    cover_image: (formData.get('cover_image') as string) || undefined,
  }
}

export async function createPost(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  const { supabase, user } = await getAuthUser()
  if (!user) return { message: 'Unauthorized', ok: false }

  const raw = extractRaw(formData)
  const result = schema.safeParse(raw)
  if (!result.success) return { message: result.error.issues[0].message, ok: false }

  const { data, error } = await supabase
    .from('posts')
    .insert({ ...buildPayload(result.data), author_id: user.id })
    .select('id')
    .single()

  if (error) return { message: error.message, ok: false }

  revalidatePath('/field-work')
  revalidatePath('/')
  redirect(`/admin/field-work/${data.id}`)
}

export async function updatePost(
  id: string,
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  const { supabase, user } = await getAuthUser()
  if (!user) return { message: 'Unauthorized', ok: false }

  const raw = extractRaw(formData)
  const result = schema.safeParse(raw)
  if (!result.success) return { message: result.error.issues[0].message, ok: false }

  const { error } = await supabase
    .from('posts')
    .update(buildPayload(result.data))
    .eq('id', id)

  if (error) return { message: error.message, ok: false }

  revalidatePath('/field-work')
  revalidatePath(`/field-work/${result.data.slug}`)
  revalidatePath('/')
  return { message: 'Post saved.', ok: true }
}

export async function deletePost(id: string): Promise<void> {
  const { supabase, user } = await getAuthUser()
  if (!user) return

  await supabase.from('posts').delete().eq('id', id)
  revalidatePath('/field-work')
  revalidatePath('/')
  redirect('/admin/field-work')
}
