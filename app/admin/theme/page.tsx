import { createClient } from '@/lib/supabase/server'
import { ThemeEditor } from './ThemeEditor'
import type { ThemeOverrides, ThemePreset } from '@/lib/theme/tokens'

export const metadata = { title: 'Theme | Base Camp' }

export default async function ThemePage() {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('site_settings')
    .select('theme, theme_presets')
    .single()

  const activeTheme = (settings?.theme as ThemeOverrides) ?? {}
  const customPresets = (settings?.theme_presets as ThemePreset[] | null) ?? []

  return (
    <div>
      <div className="mb-8">
        <p className="mb-1 text-xs font-700 uppercase tracking-widest text-accent">Base Camp</p>
        <h1 className="font-display text-2xl font-800 uppercase tracking-tight text-bone">
          Theme Studio
        </h1>
        <p className="mt-1 text-sm text-khaki">
          Pick a preset or edit colours individually. Changes preview live in this admin panel.
          Hit <strong className="text-bone">Apply to Site</strong> to publish to the public PWA.
        </p>
      </div>

      <ThemeEditor activeTheme={activeTheme} customPresets={customPresets} />
    </div>
  )
}
