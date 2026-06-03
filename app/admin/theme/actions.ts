'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  defaultTokens,
  type ThemeTokenKey,
  type ThemeOverrides,
  type ThemePreset,
} from '@/lib/theme/tokens'

export type ThemeActionResult = { ok: boolean; message: string }

async function getAuthedClient() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  return supabase
}

/** Apply a theme to the live site — saves to site_settings.theme and revalidates. */
export async function applyTheme(overrides: ThemeOverrides): Promise<ThemeActionResult> {
  const supabase = await getAuthedClient()
  if (!supabase) return { ok: false, message: 'Unauthorized' }

  const { error } = await supabase
    .from('site_settings')
    .update({ theme: overrides })
    .eq('id', true)

  if (error) return { ok: false, message: error.message }

  revalidateTag('site-theme')
  revalidatePath('/', 'layout')
  return { ok: true, message: 'Theme applied to site.' }
}

/** Save the current colours as a named custom preset. */
export async function savePreset(name: string, overrides: ThemeOverrides): Promise<ThemeActionResult> {
  const supabase = await getAuthedClient()
  if (!supabase) return { ok: false, message: 'Unauthorized' }

  const { data: settings } = await supabase
    .from('site_settings')
    .select('theme_presets')
    .single()

  const existing = (settings?.theme_presets as ThemePreset[] | null) ?? []
  const newPreset: ThemePreset = {
    id: crypto.randomUUID(),
    name: name.trim(),
    overrides,
  }

  const { error } = await supabase
    .from('site_settings')
    .update({ theme_presets: [...existing, newPreset] })
    .eq('id', true)

  if (error) return { ok: false, message: error.message }
  return { ok: true, message: `Preset "${name}" saved.` }
}

/** Delete a custom preset by id. */
export async function deletePreset(id: string): Promise<ThemeActionResult> {
  const supabase = await getAuthedClient()
  if (!supabase) return { ok: false, message: 'Unauthorized' }

  const { data: settings } = await supabase
    .from('site_settings')
    .select('theme_presets')
    .single()

  const existing = (settings?.theme_presets as ThemePreset[] | null) ?? []
  const updated = existing.filter((p) => p.id !== id)

  const { error } = await supabase
    .from('site_settings')
    .update({ theme_presets: updated })
    .eq('id', true)

  if (error) return { ok: false, message: error.message }
  return { ok: true, message: 'Preset deleted.' }
}

/** @deprecated — kept for legacy form submit compatibility */
export type ThemeState = { message: string; ok: boolean }

const TOKEN_KEYS = Object.keys(defaultTokens) as ThemeTokenKey[]

export async function saveTheme(
  _prev: ThemeState,
  formData: FormData,
): Promise<ThemeState> {
  const supabase = await getAuthedClient()
  if (!supabase) return { message: 'Unauthorized', ok: false }

  const theme: ThemeOverrides = {}
  for (const key of TOKEN_KEYS) {
    const value = formData.get(key) as string | null
    if (value && value.trim()) {
      theme[key] = value.trim()
    }
  }

  const { error } = await supabase
    .from('site_settings')
    .update({ theme })
    .eq('id', true)

  if (error) return { message: error.message, ok: false }

  revalidateTag('site-theme')
  revalidatePath('/', 'layout')
  return { message: 'Theme saved — site revalidated.', ok: true }
}

export async function resetTheme(_prev: ThemeState, _formData: FormData): Promise<ThemeState> {
  const supabase = await getAuthedClient()
  if (!supabase) return { message: 'Unauthorized', ok: false }

  const { error } = await supabase
    .from('site_settings')
    .update({ theme: {} })
    .eq('id', true)

  if (error) return { message: error.message, ok: false }

  revalidateTag('site-theme')
  revalidatePath('/', 'layout')
  return { message: 'Theme reset to defaults.', ok: true }
}
