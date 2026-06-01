import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { t } from '@/lib/i18n/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Adventures',
  description: 'Field reports from the tracks less taken across Africa.',
}

export default async function AdventuresPage() {
  const supabase = await createClient()
  const { data: adventures } = await supabase
    .from('adventures')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true })

  return (
    <div className="mx-auto max-w-[1240px] px-6 pt-32 pb-20">
      <div className="mb-12">
        <p className="mb-2 text-xs font-700 uppercase tracking-widest text-accent">Field reports</p>
        <h1 className="font-display text-5xl font-900 uppercase leading-none tracking-tight text-bone md:text-7xl">
          Adventures
        </h1>
      </div>

      {adventures && adventures.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {adventures.map((adv) => (
            <Link
              key={adv.id}
              href={`/adventures/${adv.slug}`}
              className="group relative block overflow-hidden rounded-lg border border-line"
            >
              <div className="duotone relative aspect-[16/9] bg-olive/30">
                {adv.cover_image && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${adv.cover_image}`}
                    alt={t(adv.title, 'en')}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 900px) 100vw, 620px"
                  />
                )}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--ink) 0%, transparent 60%)' }} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                {adv.tag && (
                  <span className="mb-2 inline-block rounded border border-accent px-2 py-0.5 text-[10px] font-700 uppercase tracking-widest text-accent">
                    {adv.tag}
                  </span>
                )}
                <p className="text-xs font-600 uppercase tracking-widest text-khaki">{adv.country}</p>
                <h2 className="font-display mt-1 text-2xl font-900 uppercase leading-tight text-bone">
                  {t(adv.title, 'en')}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-khaki">No adventures published yet.</p>
      )}
    </div>
  )
}
