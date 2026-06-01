import { createClient } from '@/lib/supabase/server'
import { HeroEditor } from './HeroEditor'

export const metadata = { title: 'Hero Editor | Base Camp' }

export default async function HeroPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('site_settings').select('*').single()

  return (
    <div>
      <div className="mb-8">
        <p className="mb-1 text-xs font-700 uppercase tracking-widest text-accent">Base Camp</p>
        <h1 className="font-display text-2xl font-800 uppercase tracking-tight text-bone">
          Hero Editor
        </h1>
        <p className="mt-1 text-sm text-khaki">
          Edit the home page hero. Changes revalidate the public site on save.
        </p>
      </div>
      <HeroEditor settings={settings} />
    </div>
  )
}
