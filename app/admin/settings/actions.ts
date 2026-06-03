'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Json } from '@/db/types'

export type SettingsState = { message: string; ok: boolean }

export async function saveSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized', ok: false }

  // Parse stats JSON
  const statsRaw = (formData.get('stats') as string) || '[]'
  let stats: Json = []
  try {
    stats = JSON.parse(statsRaw) as Json
  } catch {
    return { message: 'Stats JSON is invalid. Please check the format.', ok: false }
  }

  // Parse socials
  const socials = {
    instagram: (formData.get('instagram') as string) || null,
    youtube: (formData.get('youtube') as string) || null,
    facebook: (formData.get('facebook') as string) || null,
    tiktok: (formData.get('tiktok') as string) || null,
  }

  const { error } = await supabase
    .from('site_settings')
    .update({ stats, socials })
    .eq('id', true)

  if (error) return { message: error.message, ok: false }

  revalidatePath('/')
  return { message: 'Settings saved.', ok: true }
}
