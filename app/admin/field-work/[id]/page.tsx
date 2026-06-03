import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PostEditor } from '../PostEditor'
import { t } from '@/lib/i18n/types'

export const metadata = { title: 'Edit Field Note | Base Camp' }

export default async function EditFieldWorkPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: post } = await supabase.from('posts').select('*').eq('id', id).single()

  if (!post) notFound()

  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-800 uppercase tracking-tight text-bone">
        {t(post.title, 'en') || 'Edit Field Note'}
      </h1>
      <PostEditor post={post} />
    </div>
  )
}
