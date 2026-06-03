'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  hero_line1_en: z.string().min(1, 'Line 1 (EN) is required'),
  hero_line1_de: z.string().optional(),
  hero_line2_en: z.string().optional(),
  hero_line2_de: z.string().optional(),
  hero_subtitle_en: z.string().optional(),
  hero_subtitle_de: z.string().optional(),
  hero_location: z.string().optional(),
  hero_coords: z.string().optional(),
})

export type HeroState = { message: string; ok: boolean }

export async function saveHero(
  _prev: HeroState,
  formData: FormData,
): Promise<HeroState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized', ok: false }

  const raw = {
    hero_line1_en: formData.get('hero_line1_en') as string,
    hero_line1_de: (formData.get('hero_line1_de') as string) || undefined,
    hero_line2_en: (formData.get('hero_line2_en') as string) || undefined,
    hero_line2_de: (formData.get('hero_line2_de') as string) || undefined,
    hero_subtitle_en: (formData.get('hero_subtitle_en') as string) || undefined,
    hero_subtitle_de: (formData.get('hero_subtitle_de') as string) || undefined,
    hero_location: (formData.get('hero_location') as string) || undefined,
    hero_coords: (formData.get('hero_coords') as string) || undefined,
  }

  const result = schema.safeParse(raw)
  if (!result.success) {
    return { message: result.error.issues[0].message, ok: false }
  }

  const { error } = await supabase
    .from('site_settings')
    .update({
      hero_line1: {
        en: raw.hero_line1_en,
        ...(raw.hero_line1_de ? { de: raw.hero_line1_de } : {}),
      },
      hero_line2: {
        en: raw.hero_line2_en ?? '',
        ...(raw.hero_line2_de ? { de: raw.hero_line2_de } : {}),
      },
      hero_subtitle: {
        en: raw.hero_subtitle_en ?? '',
        ...(raw.hero_subtitle_de ? { de: raw.hero_subtitle_de } : {}),
      },
      hero_location: raw.hero_location ?? null,
      hero_coords: raw.hero_coords ?? null,
    })
    .eq('id', true)

  if (error) return { message: error.message, ok: false }

  revalidatePath('/')
  return { message: 'Hero saved — home page revalidated.', ok: true }
}
