'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { defaultTokens, type ThemeTokenKey } from '@/lib/theme/tokens'

export type ThemeState = { message: string; ok: boolean }

const TOKEN_KEYS = Object.keys(defaultTokens) as ThemeTokenKey[]

export async function saveTheme(
  _prev: ThemeState,
  formData: FormData,
): Promise<ThemeState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized', ok: false }

  // Build theme override object from form values
  const theme: Partial<Record<ThemeTokenKey, string>> = {}
  for (const key of TOKEN_KEYS) {
    const value = formData.get(key) as string | null
    if (value && value.trim()) {
      theme[key] = value.trim()
    }
  }

  const { error } = await supabase.from('site_settings').upsert({
    id: true,
    theme,
  })

  if (error) return { message: error.message, ok: false }

  // Revalidate the theme cache tag (clears getCachedTheme) + all public pages
  revalidateTag('site-theme', 'max')
  revalidatePath('/', 'layout')
  return { message: 'Theme saved — site revalidated.', ok: true }
}

export async function resetTheme(_prev: ThemeState, _formData: FormData): Promise<ThemeState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized', ok: false }

  const { error } = await supabase.from('site_settings').upsert({
    id: true,
    theme: {},
  })

  if (error) return { message: error.message, ok: false }

  revalidateTag('site-theme', 'max')
  revalidatePath('/', 'layout')
  return { message: 'Theme reset to defaults.', ok: true }
}
