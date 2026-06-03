import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { FilmsStrip } from '@/components/public/FilmsStrip'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Films',
  description: 'The Gravel Files — overland Africa on video.',
}

export default async function FilmsPage() {
  const supabase = await createClient()
  const { data: films } = await supabase
    .from('films')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })

  return (
    <div className="pt-24 pb-0">
      <FilmsStrip films={films ?? []} />
    </div>
  )
}
