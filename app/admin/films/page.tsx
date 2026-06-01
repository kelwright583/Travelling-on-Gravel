import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { t } from '@/lib/i18n/types'

export const metadata = { title: 'Films | Base Camp' }

export default async function FilmsAdminPage() {
  const supabase = await createClient()
  const { data: films } = await supabase
    .from('films')
    .select('id, title, youtube_id, duration, published, sort_order')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-700 uppercase tracking-widest text-accent">Base Camp</p>
          <h1 className="font-display text-2xl font-800 uppercase tracking-tight text-bone">
            Films
          </h1>
        </div>
        <Link
          href="/admin/films/new"
          className="rounded border border-accent px-4 py-2 text-xs font-700 uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-bone"
        >
          + Add Film
        </Link>
      </div>

      {films && films.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {films.map((film) => (
            <Link
              key={film.id}
              href={`/admin/films/${film.id}`}
              className="group overflow-hidden rounded-lg border border-line bg-ink-soft transition-colors hover:border-accent/40"
            >
              <div className="relative aspect-video bg-olive/20">
                <Image
                  src={`https://img.youtube.com/vi/${film.youtube_id}/mqdefault.jpg`}
                  alt={t(film.title, 'en')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {film.duration && (
                  <span className="absolute bottom-2 right-2 rounded bg-ink/80 px-1.5 py-0.5 text-[10px] font-700 text-bone">
                    {film.duration}
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-600 text-bone group-hover:text-accent transition-colors line-clamp-1">
                  {t(film.title, 'en') || '(untitled)'}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-700 uppercase tracking-widest ${
                      film.published
                        ? 'bg-olive/30 text-accent'
                        : 'bg-ink text-khaki-deep'
                    }`}
                  >
                    {film.published ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-[10px] text-khaki-deep">#{film.sort_order ?? '—'}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-khaki">No films yet. Add your first YouTube video.</p>
      )}
    </div>
  )
}
