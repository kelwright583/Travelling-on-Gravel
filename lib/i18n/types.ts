import type { Json } from '@/db/types'

/** Localised text stored as jsonb `{"en":"…","de":"…"}`. */
export type LocalizedText = { en: string; de?: string }

/**
 * Render a LocalizedText value in the active locale, falling back to EN.
 * Safe to call with any Json value from Supabase — returns empty string for nulls.
 */
export function t(v: Json | null | undefined, locale: 'en' | 'de' = 'en'): string {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return ''
  const obj = v as Record<string, Json>
  const val = obj[locale] ?? obj['en'] ?? ''
  return String(val)
}

export type Stat = { label: LocalizedText; value: number; suffix?: string }
