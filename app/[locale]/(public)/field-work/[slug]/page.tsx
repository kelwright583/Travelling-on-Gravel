import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'
import { t } from '@/lib/i18n/types'

export const revalidate = 3600

interface Props {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt')
    .eq('slug', slug)
    .single()

  if (!post) return {}
  return {
    title: t(post.title, 'en'),
    description: t(post.excerpt, 'en') ?? undefined,
  }
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function FieldWorkDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  const title = t(post.title, 'en')
  const body = t(post.body, 'en')
  const excerpt = t(post.excerpt, 'en')

  return (
    <article className="mx-auto max-w-[780px] px-6 pb-20 pt-32">
      {/* Back link */}
      <Link
        href="/field-work"
        className="mb-8 inline-block text-xs font-600 uppercase tracking-widest text-khaki-deep transition-colors hover:text-bone"
      >
        ← Field Work
      </Link>

      {/* Cover image */}
      {post.cover_image ? (
        <div className="duotone relative mb-10 aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${post.cover_image}`}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 780px) 100vw, 780px"
          />
        </div>
      ) : (
        <div className="mb-10 aspect-[16/9] rounded-lg bg-gradient-to-br from-olive-2/40 to-ink" />
      )}

      {/* Meta */}
      <p className="mb-3 text-xs font-600 uppercase tracking-widest text-accent">
        From the field
      </p>
      <h1 className="font-display mb-4 text-4xl font-900 uppercase leading-tight tracking-tight text-bone md:text-5xl">
        {title}
      </h1>
      {excerpt && (
        <p className="mb-8 text-base leading-relaxed text-khaki">{excerpt}</p>
      )}
      <p className="mb-10 text-[10px] font-600 uppercase tracking-widest text-khaki-deep">
        {formatDate(post.published_at)}
      </p>

      {/* Body — rendered as preformatted markdown until a renderer is added */}
      {body && (
        <div className="prose-gravel text-sm leading-relaxed text-khaki">
          {body.split('\n').map((line, i) => {
            if (line.startsWith('# '))
              return (
                <h2 key={i} className="font-display mb-4 mt-8 text-2xl font-800 uppercase text-bone">
                  {line.slice(2)}
                </h2>
              )
            if (line.startsWith('## '))
              return (
                <h3 key={i} className="font-display mb-3 mt-6 text-xl font-700 uppercase text-bone">
                  {line.slice(3)}
                </h3>
              )
            if (line.trim() === '')
              return <div key={i} className="h-4" />
            return (
              <p key={i} className="mb-4">
                {line}
              </p>
            )
          })}
        </div>
      )}
    </article>
  )
}
