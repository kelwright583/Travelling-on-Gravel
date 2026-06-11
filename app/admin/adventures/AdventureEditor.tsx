'use client'

import { useActionState, useState, useEffect, useCallback, useTransition } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { LocalizedInput } from '@/components/admin/LocalizedInput'
import { FormField } from '@/components/admin/FormField'
import { SaveBar } from '@/components/admin/SaveBar'
import { PostCoverPicker } from '@/components/admin/PostCoverPicker'
import { WritingAssistant } from '@/components/admin/WritingAssistant'
import { MarkdownBodyEditor } from '@/components/admin/MarkdownBodyEditor'
import { DiaryTimeline } from '@/components/admin/DiaryTimeline'
import { ItineraryPanel } from '@/components/admin/ItineraryPanel'
import { EntryModal } from '@/components/admin/EntryModal'
import type { EntryMarker } from '@/components/admin/AdventureMap'
import type { DiaryEntry } from '@/components/admin/EntryModal'
import type { ItineraryItem } from '@/components/admin/ItineraryPanel'
import { createAdventure, updateAdventure, deleteAdventure, goLive, goReviewing, type AdventureState } from './actions'
import { PrepChecklist, type PrepItem } from '@/components/admin/PrepChecklist'
import { LocationPicker, type LocationValue } from '@/components/admin/LocationPicker'
import type { Tables } from '@/db/types'
import { Plus, Map, List, Route, BarChart2, Tent, Fuel, AlertTriangle, Wrench } from 'lucide-react'

// Lazy-load the map (avoids SSR issues with google maps)
const AdventureMap = dynamic(
  () => import('@/components/admin/AdventureMap').then((m) => m.AdventureMap),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse rounded-lg bg-ink-soft" /> },
)

type Adventure = Tables<'adventures'>

type Tab = 'overview' | 'diary' | 'itinerary' | 'stats'

function locStr(v: unknown): string {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return ''
  return String((v as Record<string, unknown>)['en'] ?? '')
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function getField(name: string) {
  return document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)?.value ?? ''
}

function setField(name: string, value: string) {
  const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)
  if (el) el.value = value
}

const initial: AdventureState = { message: '', ok: false }

const STATUS_OPTIONS = [
  { value: 'dreaming',  label: 'Dreaming',      color: 'text-khaki-deep/70 bg-ink border-line/50' },
  { value: 'planning',  label: 'Planning',       color: 'text-khaki bg-ink-soft border-line' },
  { value: 'confirmed', label: 'Confirmed',      color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/40' },
  { value: 'live',      label: 'Live — on road', color: 'text-red-400 bg-red-400/10 border-red-400/40' },
  { value: 'reviewing', label: 'Reviewing',      color: 'text-olive-2 bg-olive/10 border-olive/40' },
  { value: 'archived',  label: 'Archived',       color: 'text-accent bg-accent/10 border-accent/40' },
]

const INPUT =
  'w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none'

// ── Stats helpers ────────────────────────────────────────────────────────────

function computeStats(entries: DiaryEntry[]) {
  const fuelEntries = entries.filter((e) => e.type === 'fuel')
  const totalLitres = fuelEntries.reduce((s, e) => s + (((e.data as Record<string,unknown>).litres as number) ?? 0), 0)
  const totalFuelCost = fuelEntries.reduce((s, e) => s + (((e.data as Record<string,unknown>).total_cost as number) ?? 0), 0)
  const breakdowns = entries.filter((e) => e.type === 'breakdown').length
  const repairs = entries.filter((e) => e.type === 'repair').length
  const tyres = entries.filter((e) => e.type === 'tyre').length
  const restaurants = entries.filter((e) => e.type === 'restaurant')
  const camps = entries.filter((e) => e.type === 'camp')
  const finds = entries.filter((e) => e.type === 'find').length
  const avgRestaurantRating =
    restaurants.length > 0
      ? restaurants.reduce((s, e) => s + (e.rating ?? 0), 0) / restaurants.length
      : null
  const avgCampRating =
    camps.length > 0
      ? camps.reduce((s, e) => s + (e.rating ?? 0), 0) / camps.length
      : null
  const byType = [
    'checkin', 'fuel', 'restaurant', 'camp', 'find', 'breakdown', 'repair', 'tyre', 'note',
  ].reduce<Record<string, number>>((acc, t) => {
    acc[t] = entries.filter((e) => e.type === t).length
    return acc
  }, {})
  return {
    totalLitres,
    totalFuelCost,
    fuelStops: fuelEntries.length,
    breakdowns,
    repairs,
    tyres,
    finds,
    avgRestaurantRating,
    avgCampRating,
    byType,
    totalEntries: entries.length,
  }
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-line bg-ink p-4">
      <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">{label}</p>
      <p className="mt-1 font-display text-2xl font-800 text-bone">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-khaki-deep">{sub}</p>}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export function AdventureEditor({ adventure }: { adventure?: Adventure }) {
  const isNew = !adventure
  const saveAction = adventure ? updateAdventure.bind(null, adventure.id) : createAdventure
  const [state, formAction, pending] = useActionState(saveAction, initial)
  const deleteAction = adventure ? deleteAdventure.bind(null, adventure.id) : null

  const [tab, setTab] = useState<Tab>('overview')
  const [status, setStatus] = useState(adventure?.status ?? 'dreaming')
  const [slug, setSlug] = useState(adventure?.slug ?? '')
  const [prepItems, setPrepItems] = useState<PrepItem[]>(
    Array.isArray(adventure?.prep_items) ? (adventure.prep_items as unknown as PrepItem[]) : []
  )
  const [mapLat, setMapLat] = useState<number | null>(adventure?.lat ?? null)
  const [mapLng, setMapLng] = useState<number | null>(adventure?.lng ?? null)
  const [actionMsg, setActionMsg] = useState('')
  const [actionPending, startActionTransition] = useTransition()

  // Diary state
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [diaryView, setDiaryView] = useState<'split' | 'map' | 'list'>('split')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null)
  const [pendingPin, setPendingPin] = useState<{ lat: number; lng: number } | null>(null)

  const loadDiary = useCallback(async () => {
    if (!adventure?.id) return
    setLoadingEntries(true)
    const [entriesRes, itinRes] = await Promise.all([
      fetch(`/api/adventures/${adventure.id}/entries`),
      fetch(`/api/adventures/${adventure.id}/itinerary`),
    ])
    const [entriesData, itinData] = await Promise.all([
      entriesRes.json() as Promise<{ entries: DiaryEntry[] }>,
      itinRes.json() as Promise<{ items: ItineraryItem[] }>,
    ])
    setEntries(entriesData.entries ?? [])
    setItinerary(itinData.items ?? [])
    setLoadingEntries(false)
  }, [adventure?.id])

  useEffect(() => {
    if (tab === 'diary' || tab === 'itinerary' || tab === 'stats') {
      loadDiary()
    }
  }, [tab, loadDiary])

  const markers: EntryMarker[] = entries
    .filter((e) => e.lat && e.lng)
    .map((e) => ({ id: e.id, type: e.type, lat: e.lat!, lng: e.lng!, title: e.title }))

  function handleMapClick(lat: number, lng: number) {
    setPendingPin({ lat, lng })
    setEditingEntry(null)
    setModalOpen(true)
  }

  function handleMarkerClick(id: string) {
    const entry = entries.find((e) => e.id === id)
    if (entry) { setEditingEntry(entry); setPendingPin(null); setModalOpen(true) }
  }

  function handleEntrySaved(saved: DiaryEntry) {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === saved.id)
      return idx >= 0 ? prev.map((e) => (e.id === saved.id ? saved : e)) : [saved, ...prev].sort((a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime())
    })
    setModalOpen(false)
    setPendingPin(null)
    setEditingEntry(null)
  }

  function handleEntryDeleted(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const stats = computeStats(entries)
  const days =
    adventure?.start_date && adventure?.end_date
      ? Math.ceil(
          (new Date(adventure.end_date).getTime() - new Date(adventure.start_date).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1
      : null

  return (
    <div className="max-w-5xl">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/adventures"
          className="text-xs font-600 uppercase tracking-widest text-khaki-deep hover:text-bone transition-colors"
        >
          ← All Adventures
        </Link>
        {deleteAction && (
          <form
            action={deleteAction}
            onSubmit={(e) => { if (!confirm('Delete this adventure permanently?')) e.preventDefault() }}
          >
            <button type="submit" className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Delete
            </button>
          </form>
        )}
      </div>

      {/* Go Live / I'm Back action banners */}
      {adventure && status === 'confirmed' && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-yellow-400/30 bg-yellow-400/5 px-4 py-3">
          <div>
            <p className="text-xs font-700 uppercase tracking-widest text-yellow-400">Ready to roll?</p>
            <p className="text-xs text-khaki-deep">Set the adventure live — records departure time and activates the live map.</p>
          </div>
          <button
            type="button"
            disabled={actionPending}
            onClick={() => startActionTransition(async () => {
              const r = await goLive(adventure.id)
              setStatus('live')
              setActionMsg(r.message)
            })}
            className="rounded border border-yellow-400 bg-yellow-400/10 px-5 py-2 text-xs font-700 uppercase tracking-widest text-yellow-400 hover:bg-yellow-400 hover:text-ink transition-colors disabled:opacity-50"
          >
            {actionPending ? 'Going live…' : 'GO LIVE'}
          </button>
        </div>
      )}
      {adventure && status === 'live' && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-red-400/30 bg-red-400/5 px-4 py-3">
          <div>
            <p className="text-xs font-700 uppercase tracking-widest text-red-400 flex items-center gap-2">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-400" />
              LIVE — on the road
            </p>
            <p className="text-xs text-khaki-deep">Back home? Record your return and start writing it up.</p>
          </div>
          <button
            type="button"
            disabled={actionPending}
            onClick={() => startActionTransition(async () => {
              const r = await goReviewing(adventure.id)
              setStatus('reviewing')
              setActionMsg(r.message)
            })}
            className="rounded border border-accent bg-accent/10 px-5 py-2 text-xs font-700 uppercase tracking-widest text-accent hover:bg-accent hover:text-bone transition-colors disabled:opacity-50"
          >
            {actionPending ? 'Recording…' : "I'M BACK"}
          </button>
        </div>
      )}
      {actionMsg && (
        <p className="mb-4 text-xs text-accent">{actionMsg}</p>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line pb-px">
        {(
          [
            { key: 'overview', label: 'Overview' },
            { key: 'diary', label: 'Diary', disabled: isNew },
            { key: 'itinerary', label: 'Itinerary', disabled: isNew },
            { key: 'stats', label: 'Stats', disabled: isNew },
          ] as { key: Tab; label: string; disabled?: boolean }[]
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            disabled={t.disabled}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap px-4 py-2 text-xs font-700 uppercase tracking-widest transition-colors ${
              tab === t.key
                ? 'border-b-2 border-accent text-accent'
                : t.disabled
                  ? 'cursor-not-allowed text-khaki-deep/30'
                  : 'text-khaki-deep hover:text-bone'
            }`}
          >
            {t.label}
          </button>
        ))}
        {isNew && (
          <p className="ml-auto self-center text-[10px] text-khaki-deep/50">
            Save the adventure first to unlock Diary, Itinerary & Stats
          </p>
        )}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === 'overview' && (
        <form action={formAction} className="space-y-6">
          {/* Status selector */}
          <div className="space-y-2">
            <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Status</p>
            <input type="hidden" name="status" value={status} />
            <div className="flex gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={`rounded-full border px-4 py-1.5 text-xs font-700 uppercase tracking-widest transition-all ${
                    status === opt.value
                      ? `${opt.color} ring-2 ring-offset-1 ring-offset-ink`
                      : 'border-line text-khaki-deep hover:border-line/60 hover:text-bone'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <LocalizedInput
            label="Title"
            nameEn="title_en"
            nameDe="title_de"
            defaultEn={locStr(adventure?.title)}
            placeholder="Adventure title"
            required
            onChange={(val) => { if (!adventure) setSlug(slugify(val)) }}
          />

          <FormField label="Slug" hint="Auto-generated from title. Edit only if you need a custom URL.">
            <input
              type="text"
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated-from-title"
              pattern="[a-z0-9-]+"
              required
              className={`${INPUT} font-mono`}
            />
          </FormField>

          <PostCoverPicker name="cover_image" defaultValue={adventure?.cover_image} label="Cover Photo" />

          {/* Dreaming: just the dream — mood, inspiration, wishlist thoughts */}
          {status === 'dreaming' && (
            <div className="rounded border border-line/40 bg-ink-soft px-4 py-3">
              <p className="text-xs text-khaki-deep">
                <span className="font-700 text-khaki">Dreaming phase</span> — write the dream. Where, why, the feeling. No dates or budget yet, just the pull of it.
              </p>
            </div>
          )}

          <LocalizedInput
            label={status === 'dreaming' ? 'The dream' : 'Excerpt'}
            nameEn="excerpt_en"
            nameDe="excerpt_de"
            defaultEn={locStr(adventure?.excerpt)}
            placeholder={status === 'dreaming' ? 'The idea, the itch, the inspiration…' : 'Short teaser shown on the adventure listing…'}
            multiline
            rows={3}
          />

          <div className="space-y-2">
            <MarkdownBodyEditor
              label={status === 'dreaming' ? 'Thoughts & wishlist' : 'About this adventure'}
              name="body_en"
              defaultValue={locStr(adventure?.body)}
              placeholder={status === 'dreaming'
                ? 'Everything that keeps drawing you back to this idea — places, people, stories you\'ve heard.'
                : 'Full adventure write-up…'}
              rows={12}
            />
            <input type="hidden" name="body_de" value="" />
            <WritingAssistant
              getText={() => getField('body_en')}
              onApply={(text) => setField('body_en', text)}
              fieldLabel={status === 'dreaming' ? 'the dream write-up' : 'the adventure write-up'}
            />
          </div>

          {/* Planning+ fields — not shown while still dreaming */}
          {status !== 'dreaming' && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Vehicle / rig">
                  <input type="text" name="vehicle" defaultValue={adventure?.vehicle ?? ''} placeholder="Toyota Land Cruiser 79" className={INPUT} />
                </FormField>
                <FormField label="Total distance (km)" hint="Approximate — can update after the trip">
                  <input type="number" name="total_distance_km" defaultValue={adventure?.total_distance_km ?? ''} placeholder="8400" className={INPUT} />
                </FormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={status === 'planning' ? 'Rough departure date' : 'Departure date'}>
                  <input type="date" name="start_date" defaultValue={adventure?.start_date ?? ''} className={INPUT} />
                </FormField>
                <FormField label={status === 'planning' ? 'Rough return date' : 'Return date'}>
                  <input type="date" name="end_date" defaultValue={adventure?.end_date ?? ''} className={INPUT} />
                </FormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Primary country">
                  <input type="text" name="country" defaultValue={adventure?.country ?? ''} placeholder="Namibia" className={INPUT} />
                </FormField>
                <FormField label="Region / location">
                  <input type="text" name="location" defaultValue={adventure?.location ?? ''} placeholder="Kaokoland" className={INPUT} />
                </FormField>
              </div>

              <FormField label="Countries crossed" hint="Comma-separated — shown as trip stats on the public page">
                <input
                  type="text"
                  name="countries_csv"
                  defaultValue={Array.isArray(adventure?.countries) ? (adventure.countries as string[]).join(', ') : ''}
                  placeholder="South Africa, Botswana, Namibia, Zimbabwe"
                  className={INPUT}
                />
              </FormField>

              {/* Budget */}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Trip budget (ZAR)" hint="Shown with a live currency converter on the public page">
                  <input type="number" name="budget_zar" defaultValue={adventure?.budget_zar ?? ''} placeholder="45000" className={INPUT} />
                </FormField>
                <FormField label="Budget notes" hint="What this figure covers">
                  <input type="text" name="budget_notes" defaultValue={adventure?.budget_notes ?? ''} placeholder="Fuel + accommodation + border fees, excluding gear" className={INPUT} />
                </FormField>
              </div>

              {/* Prep checklist */}
              <div>
                <p className="mb-1 text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Prep checklist</p>
                <p className="mb-3 text-xs text-khaki-deep/70">
                  Tick items as you complete them — feeds the &ldquo;trip loading&rdquo; progress bar on the public page.
                </p>
                <input type="hidden" name="prep_items_json" value={JSON.stringify(prepItems)} />
                <PrepChecklist items={prepItems} onChange={setPrepItems} />
              </div>
            </>
          )}

          {/* Hidden fields to keep server action happy when dreaming (no form fields rendered) */}
          {status === 'dreaming' && (
            <>
              <input type="hidden" name="vehicle" value="" />
              <input type="hidden" name="total_distance_km" value="" />
              <input type="hidden" name="start_date" value="" />
              <input type="hidden" name="end_date" value="" />
              <input type="hidden" name="country" value="" />
              <input type="hidden" name="location" value="" />
              <input type="hidden" name="countries_csv" value="" />
              <input type="hidden" name="budget_zar" value="" />
              <input type="hidden" name="budget_notes" value="" />
              <input type="hidden" name="prep_items_json" value="[]" />
            </>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Sort order" hint="Lower = shown first on the listing page">
              <input type="number" name="sort_order" defaultValue={adventure?.sort_order ?? ''} placeholder="0" className={INPUT} />
            </FormField>
          </div>

          {/* Map centre — sets default view for the diary map */}
          <FormField label="Map centre" hint="Used as the default map position for the diary view. Search or use current location.">
            <LocationPicker
              defaultLat={adventure?.lat}
              defaultLng={adventure?.lng}
              placeholder="Search for a country, region, or starting point…"
              onChange={(v: LocationValue | null) => {
                setMapLat(v?.lat ?? null)
                setMapLng(v?.lng ?? null)
              }}
            />
          </FormField>
          <input type="hidden" name="lat" value={mapLat ?? ''} />
          <input type="hidden" name="lng" value={mapLng ?? ''} />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Published date">
              <input type="date" name="published_at" defaultValue={adventure?.published_at?.slice(0, 10) ?? ''} className={INPUT} />
            </FormField>
            <FormField label="Status">
              <div className="flex flex-col gap-2 pt-5">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="published"
                    defaultChecked={adventure?.published ?? false}
                    className="h-4 w-4 rounded border-line accent-accent"
                  />
                  <span className="text-sm text-bone">Published</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="cover_overlay"
                    defaultChecked={adventure?.cover_overlay ?? true}
                    className="h-4 w-4 rounded border-line accent-accent"
                  />
                  <span className="text-sm text-bone">Card image overlay</span>
                </label>
              </div>
            </FormField>
          </div>

          <SaveBar pending={pending} message={state.message} ok={state.ok} />
        </form>
      )}

      {/* ── DIARY TAB ── */}
      {tab === 'diary' && adventure && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-lg border border-line overflow-hidden">
              {(
                [
                  { key: 'split', icon: <span className="text-[10px]">⬛⬛</span>, label: 'Split' },
                  { key: 'map', icon: <Map size={13} />, label: 'Map' },
                  { key: 'list', icon: <List size={13} />, label: 'List' },
                ] as { key: typeof diaryView; icon: React.ReactNode; label: string }[]
              ).map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => setDiaryView(v.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-600 transition-colors ${
                    diaryView === v.key ? 'bg-accent text-bone' : 'text-khaki-deep hover:text-bone'
                  }`}
                >
                  {v.icon}
                  <span className="hidden sm:inline">{v.label}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => { setEditingEntry(null); setPendingPin(null); setModalOpen(true) }}
              className="flex items-center gap-2 rounded border border-accent bg-accent px-4 py-2 text-xs font-700 uppercase tracking-widest text-bone hover:bg-accent/80 transition-colors"
            >
              <Plus size={13} />
              Log entry
            </button>
            <p className="text-xs text-khaki-deep ml-auto">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
              {diaryView !== 'list' && ' · Click map to drop a pin'}
            </p>
          </div>

          {loadingEntries ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-xs text-khaki-deep">Loading diary…</div>
            </div>
          ) : (
            <>
              {/* Split / Map only */}
              {(diaryView === 'split' || diaryView === 'map') && (
                <div
                  className={`overflow-hidden rounded-xl border border-line ${
                    diaryView === 'split' ? 'lg:h-[540px]' : 'h-[540px]'
                  }`}
                >
                  {diaryView === 'split' ? (
                    <div className="flex h-80 flex-col lg:h-full lg:flex-row">
                      <div className="h-full flex-1">
                        <AdventureMap
                          entries={markers}
                          onMapClick={handleMapClick}
                          onMarkerClick={handleMarkerClick}
                          defaultLat={mapLat}
                          defaultLng={mapLng}
                        />
                      </div>
                      <div className="h-64 overflow-y-auto border-t border-line lg:h-full lg:w-80 lg:border-l lg:border-t-0">
                        <div className="p-4">
                          <DiaryTimeline
                            entries={[...entries].sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())}
                            onEdit={(e) => { setEditingEntry(e); setModalOpen(true) }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <AdventureMap
                      entries={markers}
                      onMapClick={handleMapClick}
                      onMarkerClick={handleMarkerClick}
                      defaultLat={adventure.lat}
                      defaultLng={adventure.lng}
                    />
                  )}
                </div>
              )}

              {/* Legend */}
              {diaryView !== 'list' && entries.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {Object.entries({
                    checkin: { label: 'Check-in', color: 'bg-accent' },
                    fuel: { label: 'Fuel', color: 'bg-yellow-400' },
                    breakdown: { label: 'Breakdown', color: 'bg-red-400' },
                    repair: { label: 'Repair', color: 'bg-orange-400' },
                    tyre: { label: 'Tyre', color: 'bg-amber-400' },
                    restaurant: { label: 'Restaurant', color: 'bg-green-400' },
                    find: { label: 'Cool find', color: 'bg-purple-400' },
                    camp: { label: 'Camp', color: 'bg-teal-400' },
                    note: { label: 'Note', color: 'bg-gray-500' },
                  })
                    .filter(([type]) => entries.some((e) => e.type === type))
                    .map(([type, meta]) => (
                      <span key={type} className="flex items-center gap-1.5 text-[10px] text-khaki-deep">
                        <span className={`h-2.5 w-2.5 rounded-full ${meta.color}`} />
                        {meta.label}
                      </span>
                    ))}
                </div>
              )}

              {/* Full timeline (list-only view) */}
              {diaryView === 'list' && (
                <DiaryTimeline
                  entries={[...entries].sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime())}
                  onEdit={(e) => { setEditingEntry(e); setModalOpen(true) }}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* ── ITINERARY TAB ── */}
      {tab === 'itinerary' && adventure && (
        <ItineraryPanel
          adventureId={adventure.id}
          items={itinerary}
          entries={entries}
          onUpdate={setItinerary}
        />
      )}

      {/* ── STATS TAB ── */}
      {tab === 'stats' && adventure && (
        <div className="space-y-8">
          {entries.length === 0 ? (
            <p className="py-12 text-center text-sm text-khaki-deep">
              No diary entries yet — head to the Diary tab to start logging.
            </p>
          ) : (
            <>
              {/* Overview stats */}
              <div>
                <p className="mb-3 text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Trip overview</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Total entries" value={stats.totalEntries} />
                  {days && <StatCard label="Days planned" value={days} />}
                  {adventure.vehicle && <StatCard label="Vehicle" value={adventure.vehicle} />}
                  {adventure.total_distance_km && <StatCard label="Distance" value={`${adventure.total_distance_km.toLocaleString()} km`} />}
                </div>
              </div>

              {/* Fuel */}
              {stats.fuelStops > 0 && (
                <div>
                  <p className="mb-3 flex items-center gap-2 text-[10px] font-700 uppercase tracking-widest text-yellow-400">
                    <Fuel size={12} /> Fuel
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <StatCard label="Fuel stops" value={stats.fuelStops} />
                    <StatCard label="Total litres" value={stats.totalLitres.toFixed(1)} />
                    {stats.totalFuelCost > 0 && (
                      <StatCard
                        label="Total fuel spend"
                        value={`R${stats.totalFuelCost.toFixed(0)}`}
                        sub={stats.totalLitres > 0 ? `avg R${(stats.totalFuelCost / stats.totalLitres).toFixed(2)}/L` : undefined}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Incidents */}
              {(stats.breakdowns > 0 || stats.repairs > 0 || stats.tyres > 0) && (
                <div>
                  <p className="mb-3 flex items-center gap-2 text-[10px] font-700 uppercase tracking-widest text-red-400">
                    <AlertTriangle size={12} /> Incidents
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {stats.breakdowns > 0 && <StatCard label="Breakdowns" value={stats.breakdowns} />}
                    {stats.repairs > 0 && <StatCard label="Repairs" value={stats.repairs} />}
                    {stats.tyres > 0 && <StatCard label="Tyre events" value={stats.tyres} />}
                  </div>
                </div>
              )}

              {/* Experiences */}
              <div>
                <p className="mb-3 flex items-center gap-2 text-[10px] font-700 uppercase tracking-widest text-accent">
                  <Tent size={12} /> Experiences
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.byType.restaurant > 0 && (
                    <StatCard
                      label="Restaurants"
                      value={stats.byType.restaurant}
                      sub={stats.avgRestaurantRating ? `avg ${stats.avgRestaurantRating.toFixed(1)} ★` : undefined}
                    />
                  )}
                  {stats.byType.camp > 0 && (
                    <StatCard
                      label="Camps"
                      value={stats.byType.camp}
                      sub={stats.avgCampRating ? `avg ${stats.avgCampRating.toFixed(1)} ★` : undefined}
                    />
                  )}
                  {stats.finds > 0 && <StatCard label="Cool finds" value={stats.finds} />}
                  {stats.byType.checkin > 0 && <StatCard label="Check-ins" value={stats.byType.checkin} />}
                </div>
              </div>

              {/* Entry type breakdown */}
              <div>
                <p className="mb-3 text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Entry breakdown</p>
                <div className="space-y-2">
                  {Object.entries(stats.byType)
                    .filter(([, count]) => count > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => (
                      <div key={type} className="flex items-center gap-3">
                        <p className="w-28 text-xs capitalize text-khaki-deep">{type}</p>
                        <div className="flex-1 overflow-hidden rounded-full bg-ink">
                          <div
                            className="h-2 rounded-full bg-accent"
                            style={{ width: `${(count / stats.totalEntries) * 100}%` }}
                          />
                        </div>
                        <p className="w-6 text-right text-xs text-bone">{count}</p>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Entry modal */}
      {modalOpen && adventure && (
        <EntryModal
          adventureId={adventure.id}
          entry={editingEntry}
          defaultLat={pendingPin?.lat}
          defaultLng={pendingPin?.lng}
          onSaved={handleEntrySaved}
          onDeleted={handleEntryDeleted}
          onClose={() => { setModalOpen(false); setPendingPin(null); setEditingEntry(null) }}
        />
      )}
    </div>
  )
}
