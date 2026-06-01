import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdventureEditor } from '../AdventureEditor'
import { t } from '@/lib/i18n/types'

export const metadata = { title: 'Edit Adventure | Base Camp' }

export default async function EditAdventurePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: adventure } = await supabase
    .from('adventures')
    .select('*')
    .eq('id', id)
    .single()

  if (!adventure) notFound()

  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-800 uppercase tracking-tight text-bone">
        {t(adventure.title, 'en') || 'Edit Adventure'}
      </h1>
      <AdventureEditor adventure={adventure} />
    </div>
  )
}
