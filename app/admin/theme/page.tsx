import { createClient } from '@/lib/supabase/server'
import { ThemeEditor } from './ThemeEditor'
import type { ThemeOverrides } from '@/lib/theme/tokens'

export const metadata = { title: 'Theme | Base Camp' }

export default async function ThemePage() {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('site_settings')
    .select('theme')
    .single()

  const savedTheme = (settings?.theme as ThemeOverrides) ?? {}

  return (
    <div>
      <div className="mb-8">
        <p className="mb-1 text-xs font-700 uppercase tracking-widest text-accent">Base Camp</p>
        <h1 className="font-display text-2xl font-800 uppercase tracking-tight text-bone">
          Theme Editor
        </h1>
        <p className="mt-1 text-sm text-khaki">
          Colour pickers update the site instantly in this admin preview. Save to publish to
          the public site (injected server-side on every page load — no flash of unstyled content).
        </p>
      </div>

      {/* Live colour swatches preview */}
      <div className="mb-8 flex flex-wrap gap-2">
        {[
          { label: 'Bone', var: '--bone' },
          { label: 'Khaki', var: '--khaki' },
          { label: 'Olive', var: '--olive' },
          { label: 'Ink', var: '--ink' },
          { label: 'Accent', var: '--accent' },
        ].map(({ label, var: v }) => (
          <div key={v} className="flex flex-col items-center gap-1">
            <div
              className="h-10 w-10 rounded border border-line"
              style={{ backgroundColor: `var(${v})` }}
            />
            <p className="text-[10px] text-khaki-deep">{label}</p>
          </div>
        ))}
      </div>

      <ThemeEditor savedTheme={savedTheme} />
    </div>
  )
}
