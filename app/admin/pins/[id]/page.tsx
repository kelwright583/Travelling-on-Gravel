import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PinEditor } from '../PinEditor'

export const metadata = { title: 'Edit Pin | Base Camp' }

export default async function EditPinPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: pin } = await supabase.from('map_pins').select('*').eq('id', id).single()

  if (!pin) notFound()

  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-800 uppercase tracking-tight text-bone">
        {pin.label}
      </h1>
      <PinEditor pin={pin} />
    </div>
  )
}
