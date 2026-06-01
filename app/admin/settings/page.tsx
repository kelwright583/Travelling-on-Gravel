import { createClient } from '@/lib/supabase/server'
import { SettingsEditor } from './SettingsEditor'

export const metadata = { title: 'Settings | Base Camp' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('site_settings').select('*').single()

  return (
    <div>
      <div className="mb-8">
        <p className="mb-1 text-xs font-700 uppercase tracking-widest text-accent">Base Camp</p>
        <h1 className="font-display text-2xl font-800 uppercase tracking-tight text-bone">
          Settings
        </h1>
        <p className="mt-1 text-sm text-khaki">
          Site stats strip and social media links.
        </p>
      </div>
      <SettingsEditor settings={settings} />
    </div>
  )
}
