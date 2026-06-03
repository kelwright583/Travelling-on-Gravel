'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { IngredientGroup, Step, AiNotes } from '@/lib/recipes/types'
import type { Json } from '@/db/types'

export type RecipeState = { message: string; ok: boolean }

async function getAuthUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

export interface RecipePayload {
  title_en: string
  subtitle_en?: string
  intro_en?: string
  slug: string
  cover_image?: string | null
  prep_minutes?: number | null
  cook_minutes?: number | null
  servings?: number | null
  difficulty: string
  cook_method: string
  ingredients: IngredientGroup[]
  steps: Step[]
  tips: { en: string }[]
  equipment: { en: string }[]
  tags: string[]
  published: boolean
  published_at?: string | null
}

function buildPayload(data: RecipePayload) {
  return {
    title: { en: data.title_en },
    subtitle: data.subtitle_en ? { en: data.subtitle_en } : {},
    intro: data.intro_en ? { en: data.intro_en } : {},
    slug: data.slug,
    cover_image: data.cover_image ?? null,
    prep_minutes: data.prep_minutes ?? null,
    cook_minutes: data.cook_minutes ?? null,
    servings: data.servings ?? null,
    difficulty: data.difficulty,
    cook_method: data.cook_method,
    ingredients: data.ingredients as unknown as Json,
    steps: data.steps as unknown as Json,
    tips: data.tips as unknown as Json,
    equipment: data.equipment as unknown as Json,
    tags: data.tags,
    published: data.published,
    published_at: data.published_at ?? null,
  }
}

export async function createRecipe(
  _prev: RecipeState,
  payload: RecipePayload,
): Promise<RecipeState> {
  const { supabase, user } = await getAuthUser()
  if (!user) return { message: 'Unauthorized', ok: false }

  const { data, error } = await supabase
    .from('recipes')
    .insert({ ...buildPayload(payload), author_id: user.id })
    .select('id')
    .single()

  if (error) return { message: error.message, ok: false }

  revalidatePath('/cast-iron')
  revalidatePath('/')
  redirect(`/admin/cast-iron/${data.id}`)
}

export async function updateRecipe(
  id: string,
  _prev: RecipeState,
  payload: RecipePayload,
): Promise<RecipeState> {
  const { supabase, user } = await getAuthUser()
  if (!user) return { message: 'Unauthorized', ok: false }

  const { error } = await supabase
    .from('recipes')
    .update(buildPayload(payload))
    .eq('id', id)

  if (error) return { message: error.message, ok: false }

  revalidatePath('/cast-iron')
  revalidatePath(`/cast-iron/${payload.slug}`)
  revalidatePath('/')
  return { message: 'Recipe saved.', ok: true }
}

export async function deleteRecipe(id: string): Promise<void> {
  const { supabase, user } = await getAuthUser()
  if (!user) return

  await supabase.from('recipes').delete().eq('id', id)
  revalidatePath('/cast-iron')
  revalidatePath('/')
  redirect('/admin/cast-iron')
}

export async function saveAiNotes(
  id: string,
  aiNotes: AiNotes,
): Promise<RecipeState> {
  const { supabase, user } = await getAuthUser()
  if (!user) return { message: 'Unauthorized', ok: false }

  const { error } = await supabase
    .from('recipes')
    .update({ ai_notes: aiNotes as unknown as Json, ai_reviewed: true })
    .eq('id', id)

  if (error) return { message: error.message, ok: false }
  return { message: 'AI notes saved.', ok: true }
}
