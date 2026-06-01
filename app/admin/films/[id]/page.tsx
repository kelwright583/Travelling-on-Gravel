import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FilmEditor } from '../FilmEditor'
import { t } from '@/lib/i18n/types'

export const metadata = { title: 'Edit Film | Base Camp' }

export default async function EditFilmPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: film } = await supabase.from('films').select('*').eq('id', id).single()

  if (!film) notFound()

  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-800 uppercase tracking-tight text-bone">
        {t(film.title, 'en') || 'Edit Film'}
      </h1>
      <FilmEditor film={film} />
    </div>
  )
}
