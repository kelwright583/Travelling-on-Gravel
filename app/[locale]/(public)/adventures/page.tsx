import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { t } from '@/lib/i18n/types'
import type { Json } from '@/db/types'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Adventures',
  description: 'From the first daydream to the last dusty kilometre — every trip, documented in full.',
}

type Adventure = {
  id: string
  slug: string
  title: Json
  country: string | null
  cover_image: string | null
  cover_overlay: boolean | null
  status: string | null
  start_date: string | null
  total_distance_km: number | null
  countries: string[] | null
  tag: string | null
}

const STATUS_META: Record<string, { badge: string; badgeClass: string; cardRing: string }> = {
  dreaming:  { badge: 'Someday…',      badgeClass: 'text-khaki-deep border-line/60',                       cardRing: 'opacity-75' },
  planning:  { badge: 'In the works',  badgeClass: 'text-khaki border-line',                               cardRing: '' },
  confirmed: { badge: 'Confirmed',      badgeClass: 'text-yellow-400 border-yellow-400/50 bg-yellow-400/5', cardRing: 'ring-1 ring-yellow-400/20' },
  live:      { badge: 'LIVE',          badgeClass: 'text-red-400 border-red-400/50 bg-red-400/5',           cardRing: 'ring-2 ring-red-400/30' },
  reviewing: { badge: 'Just returned', badgeClass: 'text-olive-2 border-olive/50',                         cardRing: '' },
  archived:  { badge: 'Complete',      badgeClass: 'text-accent border-accent/40',                         cardRing: '' },
}

function daysUntil(dateStr: string): number {
  const now = new Date(); now.setHours(0, 0, 0, 0)
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / 86400000)
}

export default async function AdventuresPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('adventures')
    .select('id, slug, title, country, cover_image, cover_overlay, status, start_date, total_distance_km, countries, tag')
    .eq('published', true)
    .order('sort_order', { ascending: true })

  const all = (data ?? []) as Adventure[]

  // Surface live/confirmed first
  const sorted = [
    ...all.filter((a) => a.status === 'live'),
    ...all.filter((a) => a.status === 'confirmed'),
    ...all.filter((a) => !['live', 'confirmed'].includes(a.status ?? '')),
  ]

  return (
    <div className="mx-auto max-w-[1240px] px-6 pt-32 pb-24">
      <div className="mb-14">
        <p className="mb-2 text-xs font-700 uppercase tracking-widest text-accent">From dream to dust</p>
        <h1 className="font-display text-5xl font-900 uppercase leading-none tracking-tight text-bone md:text-7xl">
          Adventures
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-khaki">
          Every trip starts as a dot on a map and a conversation about fuel range. Follow the whole arc —
          the planning, the road, and the write-up after.
        </p>
      </div>

      {sorted.length === 0 ? (
        <p className="text-khaki">Nothing published yet — check back soon.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {sorted.map((adv) => {
            const meta = STATUS_META[adv.status ?? 'planning'] ?? STATUS_META.planning
            const days = adv.status === 'confirmed' && adv.start_date ? daysUntil(adv.start_date) : null
            const isLive = adv.status === 'live'
            const countriesList = Array.isArray(adv.countries) && adv.countries.length > 0
              ? adv.countries.join(' · ')
              : adv.country

            return (
              <Link
                key={adv.id}
                href={`/adventures/${adv.slug}`}
                className={`group relative block overflow-hidden rounded-lg border border-line transition-shadow hover:shadow-lg ${meta.cardRing}`}
              >
                <div className={`${adv.cover_overlay !== false ? 'duotone ' : ''}relative aspect-[16/9] bg-olive/30`}>
                  {adv.cover_image ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${adv.cover_image}`}
                      alt={t(adv.title, 'en')}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 900px) 100vw, 620px"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-olive-2/40 to-ink" />
                  )}
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--ink) 0%, transparent 55%)' }} />

                  {isLive && (
                    <div className="absolute left-4 top-4 flex items-center gap-2 rounded border border-red-400/60 bg-ink/80 px-3 py-1 backdrop-blur-sm">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                      <span className="text-[10px] font-700 uppercase tracking-widest text-red-400">Live</span>
                    </div>
                  )}

                  {days !== null && days > 0 && (
                    <div className="absolute left-4 top-4 rounded border border-yellow-400/50 bg-ink/80 px-3 py-1 backdrop-blur-sm">
                      <span className="text-[10px] font-700 uppercase tracking-widest text-yellow-400">
                        {days} {days === 1 ? 'day' : 'days'} to go
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className={`rounded border px-2 py-0.5 text-[10px] font-700 uppercase tracking-widest ${meta.badgeClass}`}>
                      {meta.badge}
                    </span>
                    {adv.tag && (
                      <span className="rounded border border-accent/40 px-2 py-0.5 text-[10px] font-700 uppercase tracking-widest text-accent">
                        {adv.tag}
                      </span>
                    )}
                  </div>

                  {countriesList && (
                    <p className="text-xs font-600 uppercase tracking-widest text-khaki">{countriesList}</p>
                  )}
                  <h2 className="font-display mt-1 text-2xl font-900 uppercase leading-tight text-bone transition-colors group-hover:text-accent">
                    {t(adv.title, 'en')}
                  </h2>

                  {adv.status === 'archived' && (
                    <div className="mt-3 flex flex-wrap gap-4">
                      {adv.total_distance_km && (
                        <span className="text-[10px] font-600 uppercase tracking-wider text-khaki-deep">
                          {adv.total_distance_km.toLocaleString()} km
                        </span>
                      )}
                      {Array.isArray(adv.countries) && adv.countries.length > 1 && (
                        <span className="text-[10px] font-600 uppercase tracking-wider text-khaki-deep">
                          {adv.countries.length} countries
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
