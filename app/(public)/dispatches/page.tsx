import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { t } from '@/lib/i18n/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Dispatches',
  description: 'Honest field notes from overland Africa — no sponsored fluff.',
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function DispatchesPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return (
    <div className="mx-auto max-w-[1240px] px-6 pt-32 pb-20">
      <div className="mb-12">
        <p className="mb-2 text-xs font-700 uppercase tracking-widest text-accent">From the field</p>
        <h1 className="font-display text-5xl font-900 uppercase leading-none tracking-tight text-bone md:text-7xl">
          Dispatches
        </h1>
      </div>

      {posts && posts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/dispatches/${post.slug}`}
              className="group block overflow-hidden rounded-lg border border-line bg-ink-soft transition-colors hover:border-accent/40"
            >
              <div className="duotone relative aspect-[16/9] bg-olive/30">
                {post.cover_image && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${post.cover_image}`}
                    alt={t(post.title, 'en')}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 900px) 100vw, 420px"
                  />
                )}
              </div>
              <div className="p-5">
                <p className="mb-1 text-[10px] font-600 uppercase tracking-widest text-khaki-deep">
                  {formatDate(post.published_at)}
                </p>
                <h2 className="font-display mb-2 text-lg font-800 uppercase leading-tight text-bone group-hover:text-accent">
                  {t(post.title, 'en')}
                </h2>
                <p className="text-xs leading-relaxed text-khaki line-clamp-3">
                  {t(post.excerpt, 'en')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-khaki">No dispatches yet. Check back soon.</p>
      )}
    </div>
  )
}
