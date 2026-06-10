import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/server'
import { t } from '@/lib/i18n/types'
import { AdventureCountdown } from '@/components/public/AdventureCountdown'
import { CurrencyDisplay } from '@/components/public/CurrencyDisplay'
import { RouteMap } from '@/components/public/RouteMapClient'
import type { Json } from '@/db/types'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string; locale: string }>
}

type PrepItem = { id: string; category: string; label: string; done: boolean }
type Entry = {
  id: string; type: string; title: string | null; body: string | null
  lat: number | null; lng: number | null; location_name: string | null
  occurred_at: string; rating: number | null; data: Record<string, unknown>
}
type Adventure = {
  id: string; slug: string; title: Json; country: string | null; location: string | null
  excerpt: Json | null; body: Json | null; cover_image: string | null; cover_overlay: boolean | null
  status: string | null; start_date: string | null; end_date: string | null
  actual_departure: string | null; actual_return: string | null
  vehicle: string | null; total_distance_km: number | null
  countries: string[] | null; prep_items: PrepItem[] | null
  budget_zar: number | null; budget_notes: string | null
  lat: number | null; lng: number | null; tag: string | null
  published_at: string | null
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('adventures').select('title, excerpt').eq('slug', slug).single()
  if (!data) return {}
  return { title: t(data.title, 'en'), description: t(data.excerpt, 'en') ?? undefined }
}

const ENTRY_TYPE_ICON: Record<string, string> = {
  checkin: '📍', fuel: '⛽', breakdown: '🔧', repair: '🔩',
  tyre: '🔄', restaurant: '🍽', find: '⭐', camp: '🏕', note: '📝',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3600000)
  if (h < 1)  return 'just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function daysBetween(a: string, b: string) {
  return Math.ceil((new Date(b).getTime() - new Date(a).getTime()) / 86400000) + 1
}

function renderBody(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('# '))
      return <h2 key={i} className="font-display mb-4 mt-8 text-2xl font-800 uppercase text-bone">{line.slice(2)}</h2>
    if (line.startsWith('## '))
      return <h3 key={i} className="font-display mb-3 mt-6 text-xl font-700 uppercase text-bone">{line.slice(3)}</h3>
    if (line.trim() === '') return <div key={i} className="h-4" />
    return <p key={i} className="mb-4">{line}</p>
  })
}

// ── STATUS LABEL ─────────────────────────────────────────────────────────────

function StatusLabel({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    dreaming:  { label: 'Someday…',      cls: 'text-khaki-deep border-line/60' },
    planning:  { label: 'In the works',  cls: 'text-khaki border-line' },
    confirmed: { label: 'Confirmed',      cls: 'text-yellow-400 border-yellow-400/40 bg-yellow-400/5' },
    live:      { label: 'LIVE',          cls: 'text-red-400 border-red-400/40 bg-red-400/5' },
    reviewing: { label: 'Just returned', cls: 'text-olive-2 border-olive/40' },
    archived:  { label: 'Complete',      cls: 'text-accent border-accent/40' },
  }
  const m = map[status] ?? map.planning
  return (
    <span className={`inline-flex items-center gap-2 rounded border px-3 py-1 text-[10px] font-700 uppercase tracking-widest ${m.cls}`}>
      {status === 'live' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />}
      {m.label}
    </span>
  )
}

// ── PREP PROGRESS ─────────────────────────────────────────────────────────────

function PrepProgress({ items }: { items: PrepItem[] }) {
  if (items.length === 0) return null
  const done = items.filter((i) => i.done).length
  const pct = Math.round((done / items.length) * 100)

  const groups = ['docs', 'vehicle', 'gear', 'packing', 'nav', 'other'].map((cat) => ({
    cat,
    label: { docs: 'Documents', vehicle: 'Vehicle', gear: 'Gear', packing: 'Packing', nav: 'Navigation', other: 'Other' }[cat]!,
    items: items.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="rounded-lg border border-line bg-ink-soft p-6">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Trip loading</p>
        <p className="font-mono text-sm font-700 text-accent">{pct}%</p>
      </div>
      <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-ink">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {groups.map((g) => {
          const gDone = g.items.filter((i) => i.done).length
          return (
            <div key={g.cat}>
              <p className="mb-2 text-[10px] font-700 uppercase tracking-widest text-khaki-deep">
                {g.label} <span className="font-400 text-khaki-deep/60">{gDone}/{g.items.length}</span>
              </p>
              <div className="space-y-1">
                {g.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${item.done ? 'bg-accent' : 'bg-line'}`} />
                    <span className={`text-xs ${item.done ? 'text-khaki-deep line-through' : 'text-bone'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── DIARY ENTRY CARD ──────────────────────────────────────────────────────────

function EntryCard({ entry }: { entry: Entry }) {
  const icon = ENTRY_TYPE_ICON[entry.type] ?? '•'
  return (
    <div className="flex gap-4 rounded-lg border border-line bg-ink p-4">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-ink-soft text-base">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          {entry.title && <p className="text-sm font-700 text-bone">{entry.title}</p>}
          {entry.location_name && <p className="text-xs text-khaki-deep">{entry.location_name}</p>}
          <p className="ml-auto text-[10px] text-khaki-deep/60">{formatDate(entry.occurred_at)}</p>
        </div>
        {entry.body && <p className="text-xs leading-relaxed text-khaki">{entry.body}</p>}
        {entry.rating && (
          <p className="mt-1 text-[10px] text-accent">{'★'.repeat(entry.rating)}{'☆'.repeat(5 - entry.rating)}</p>
        )}
      </div>
    </div>
  )
}

// ── STATS BAR ─────────────────────────────────────────────────────────────────

function StatsBar({ adv, entries }: { adv: Adventure; entries: Entry[] }) {
  const startStr = adv.actual_departure ?? adv.start_date
  const endStr = adv.actual_return ?? adv.end_date
  const days = startStr && endStr ? daysBetween(startStr, endStr) : null
  const fuelStops = entries.filter((e) => e.type === 'fuel').length
  const totalLitres = entries.filter((e) => e.type === 'fuel').reduce((s, e) => s + ((e.data?.litres as number) ?? 0), 0)
  const camps = entries.filter((e) => e.type === 'camp').length
  const finds = entries.filter((e) => e.type === 'find').length

  const stats = [
    adv.total_distance_km && { label: 'Distance', value: `${adv.total_distance_km.toLocaleString()} km` },
    days && { label: 'Days', value: String(days) },
    Array.isArray(adv.countries) && adv.countries.length > 0 && { label: 'Countries', value: String(adv.countries.length) },
    fuelStops > 0 && { label: 'Fuel stops', value: String(fuelStops) },
    totalLitres > 0 && { label: 'Litres', value: totalLitres.toFixed(0) },
    camps > 0 && { label: 'Camps', value: String(camps) },
    finds > 0 && { label: 'Cool finds', value: String(finds) },
  ].filter(Boolean) as { label: string; value: string }[]

  if (stats.length === 0) return null

  return (
    <div className="flex flex-wrap gap-px overflow-hidden rounded-lg border border-line">
      {stats.map((s) => (
        <div key={s.label} className="flex flex-1 flex-col items-center justify-center bg-ink-soft px-4 py-4">
          <p className="font-display text-xl font-900 text-bone">{s.value}</p>
          <p className="mt-0.5 text-[9px] font-700 uppercase tracking-widest text-khaki-deep">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default async function AdventureDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: raw } = await supabase
    .from('adventures')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!raw) notFound()
  const adv = raw as unknown as Adventure

  // Fetch diary entries
  const { data: entriesRaw } = await supabase
    .from('adventure_entries')
    .select('id, type, title, body, lat, lng, location_name, occurred_at, rating, data')
    .eq('adventure_id', adv.id)
    .order('occurred_at', { ascending: true })
  const entries = (entriesRaw ?? []) as Entry[]

  // For archived status: pull field notes published during the trip window
  const tripStart = adv.actual_departure ?? adv.start_date
  const tripEnd   = adv.actual_return   ?? adv.end_date
  let fieldNotes: { id: string; slug: string; title: Json | null; published_at: string | null; excerpt: Json | null }[] = []
  if ((adv.status === 'archived' || adv.status === 'reviewing') && tripStart && tripEnd) {
    const { data: notes } = await supabase
      .from('posts')
      .select('id, slug, title, published_at, excerpt')
      .eq('published', true)
      .gte('published_at', tripStart)
      .lte('published_at', tripEnd)
      .order('published_at', { ascending: true })
    fieldNotes = notes ?? []
  }

  const mapMarkers = entries
    .filter((e) => e.lat && e.lng)
    .map((e) => ({ id: e.id, type: e.type, lat: e.lat!, lng: e.lng!, title: e.title }))

  const status = adv.status ?? 'planning'
  const title = t(adv.title, 'en')
  const body = t(adv.body, 'en')
  const excerpt = t(adv.excerpt, 'en')
  const countriesStr = Array.isArray(adv.countries) && adv.countries.length > 0
    ? adv.countries.join(' · ')
    : adv.country
  const prepItems: PrepItem[] = Array.isArray(adv.prep_items) ? adv.prep_items : []

  // Last diary entry for live status
  const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null

  return (
    <article className="pb-24">

      {/* ── HERO ── */}
      <div className="relative aspect-[21/9] min-h-[320px] overflow-hidden bg-olive/30">
        {adv.cover_image ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${adv.cover_image}`}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-olive-2/40 to-ink" />
        )}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, var(--ink) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' }} />

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 md:px-12">
          <div className="mx-auto max-w-[1240px]">
            <StatusLabel status={status} />
            {countriesStr && (
              <p className="mt-3 text-xs font-600 uppercase tracking-widest text-khaki">{countriesStr}</p>
            )}
            <h1 className="font-display mt-1 text-4xl font-900 uppercase leading-tight tracking-tight text-bone md:text-6xl">
              {title}
            </h1>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div className="mx-auto max-w-[1240px] px-6 pt-10 md:px-12">
        <div className="mb-8">
          <Link href="/adventures" className="text-xs font-600 uppercase tracking-widest text-khaki-deep transition-colors hover:text-bone">
            ← All adventures
          </Link>
        </div>

        {/* ── CONFIRMED: COUNTDOWN + PREP ── */}
        {status === 'confirmed' && adv.start_date && (
          <div className="mb-12 space-y-6">
            <div className="rounded-lg border border-yellow-400/20 bg-ink-soft">
              <AdventureCountdown departureDate={adv.start_date} />
            </div>
            <PrepProgress items={prepItems} />
          </div>
        )}

        {/* ── LIVE: LIVE BANNER + LAST LOCATION + MAP ── */}
        {status === 'live' && (
          <div className="mb-12 space-y-6">
            <div className="rounded-lg border border-red-400/20 bg-red-400/5 px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 animate-pulse rounded-full bg-red-400" />
                  <p className="font-700 uppercase tracking-widest text-red-400">
                    Rupert is out there right now
                  </p>
                </div>
                {lastEntry && (
                  <p className="text-xs text-khaki-deep">
                    Last logged: {lastEntry.location_name ?? lastEntry.title ?? 'location unknown'} &mdash; {timeAgo(lastEntry.occurred_at)}
                  </p>
                )}
              </div>
            </div>

            {mapMarkers.length > 0 && (
              <div className="h-[420px] overflow-hidden rounded-xl border border-line">
                <RouteMap
                  entries={mapMarkers}
                  defaultLat={adv.lat ?? (mapMarkers[0]?.lat ?? undefined)}
                  defaultLng={adv.lng ?? (mapMarkers[0]?.lng ?? undefined)}
                />
              </div>
            )}

            {/* Live diary feed — most recent first */}
            {entries.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Latest from the road</p>
                {[...entries].reverse().slice(0, 8).map((e) => <EntryCard key={e.id} entry={e} />)}
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWING / ARCHIVED: STATS BAR ── */}
        {(status === 'reviewing' || status === 'archived') && (
          <div className="mb-10">
            <StatsBar adv={adv} entries={entries} />
          </div>
        )}

        {/* ── BODY CONTENT ── */}
        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          <div>
            {excerpt && status !== 'archived' && (
              <p className="mb-8 text-base leading-relaxed text-khaki">{excerpt}</p>
            )}

            {body && (
              <div className="text-sm leading-relaxed text-khaki">
                {renderBody(body)}
              </div>
            )}

            {/* Planning: prep progress */}
            {(status === 'planning') && prepItems.length > 0 && (
              <div className="mt-10">
                <PrepProgress items={prepItems} />
              </div>
            )}

            {/* ── ARCHIVED: FULL DIARY + FIELD NOTES ── */}
            {status === 'archived' && (
              <>
                {entries.length > 0 && (
                  <div className="mt-12 space-y-3">
                    <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Trip diary</p>
                    {entries.map((e) => <EntryCard key={e.id} entry={e} />)}
                  </div>
                )}

                {fieldNotes.length > 0 && (
                  <div className="mt-12 space-y-4">
                    <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Field notes from this trip</p>
                    {fieldNotes.map((note) => (
                      <Link
                        key={note.id}
                        href={`/field-work/${note.slug}`}
                        className="group block rounded-lg border border-line p-4 transition-colors hover:border-accent/40"
                      >
                        <p className="text-[10px] text-khaki-deep">{note.published_at ? formatDate(note.published_at) : ''}</p>
                        <p className="mt-1 text-sm font-700 text-bone transition-colors group-hover:text-accent">
                          {t(note.title, 'en')}
                        </p>
                        {t(note.excerpt, 'en') && (
                          <p className="mt-1 text-xs text-khaki">{t(note.excerpt, 'en')}</p>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Reviewing: full diary */}
            {status === 'reviewing' && entries.length > 0 && (
              <div className="mt-12 space-y-3">
                <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Trip diary</p>
                {entries.map((e) => <EntryCard key={e.id} entry={e} />)}
              </div>
            )}
          </div>

          {/* ── SIDEBAR ── */}
          <aside className="space-y-6">
            {/* Trip meta */}
            <div className="rounded-lg border border-line bg-ink-soft p-5 text-xs">
              {adv.vehicle && (
                <div className="mb-3 border-b border-line pb-3">
                  <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Vehicle</p>
                  <p className="mt-1 text-bone">{adv.vehicle}</p>
                </div>
              )}
              {adv.start_date && (
                <div className="mb-3 border-b border-line pb-3">
                  <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">
                    {status === 'confirmed' ? 'Planned departure' : 'Departed'}
                  </p>
                  <p className="mt-1 text-bone">{formatDate(adv.actual_departure ?? adv.start_date)}</p>
                </div>
              )}
              {(adv.end_date || adv.actual_return) && (
                <div className="mb-3 border-b border-line pb-3">
                  <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">
                    {adv.actual_return ? 'Returned' : 'Planned return'}
                  </p>
                  <p className="mt-1 text-bone">{formatDate(adv.actual_return ?? adv.end_date!)}</p>
                </div>
              )}
              {Array.isArray(adv.countries) && adv.countries.length > 0 && (
                <div>
                  <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Countries</p>
                  <p className="mt-1 text-bone">{adv.countries.join(', ')}</p>
                </div>
              )}
            </div>

            {/* Route map (sidebar, for non-live status with markers or lat/lng) */}
            {status !== 'live' && (mapMarkers.length > 0 || (adv.lat && adv.lng)) && (
              <div className="overflow-hidden rounded-xl border border-line" style={{ height: 280 }}>
                <RouteMap
                  entries={mapMarkers}
                  defaultLat={adv.lat ?? undefined}
                  defaultLng={adv.lng ?? undefined}
                />
              </div>
            )}

            {/* Budget / currency converter */}
            {adv.budget_zar && (
              <div>
                {adv.budget_notes && (
                  <p className="mb-2 text-xs text-khaki-deep">{adv.budget_notes}</p>
                )}
                <CurrencyDisplay amountZar={adv.budget_zar} />
              </div>
            )}
          </aside>
        </div>
      </div>
    </article>
  )
}
