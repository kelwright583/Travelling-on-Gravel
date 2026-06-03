import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import type { Database } from '@/db/types'
import { t } from '@/lib/i18n/types'

type Post = Database['public']['Tables']['posts']['Row']

interface FieldWorkPreviewProps {
  posts: Post[]
}

function formatDate(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export async function FieldWorkPreview({ posts }: FieldWorkPreviewProps) {
  const tl = await getTranslations('fieldWork')

  if (posts.length === 0) return null

  return (
    <section aria-label="Latest Field Work" className="bg-ink-soft py-20">
      <div className="mx-auto max-w-[1240px] px-6">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-700 uppercase tracking-widest text-accent">
              {tl('eyebrow')}
            </p>
            <h2 className="font-display text-4xl font-900 uppercase leading-none tracking-tight text-bone md:text-5xl">
              {tl('title')}
            </h2>
          </div>
          <Link
            href="/field-work"
            className="text-xs font-700 uppercase tracking-widest text-khaki transition-colors hover:text-bone"
          >
            {tl('allPosts')}
          </Link>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/field-work/${post.slug}`}
              className="group block overflow-hidden rounded-lg border border-line bg-ink transition-colors hover:border-accent/40"
            >
              {/* Cover image */}
              <div className="duotone relative aspect-[16/9] bg-ink-soft">
                {post.cover_image ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${post.cover_image}`}
                    alt={t(post.title, 'en')}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 900px) 100vw, 420px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-olive-2/50 to-ink" />
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="mb-2 text-[10px] font-600 uppercase tracking-widest text-khaki-deep">
                  {formatDate(post.published_at)}
                </p>
                <h3 className="font-display mb-2 text-lg font-800 uppercase leading-tight text-bone transition-colors group-hover:text-accent">
                  {t(post.title, 'en')}
                </h3>
                <p className="line-clamp-3 text-xs leading-relaxed text-khaki">
                  {t(post.excerpt, 'en')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
