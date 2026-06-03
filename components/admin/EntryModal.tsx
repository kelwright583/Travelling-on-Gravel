'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
  X,
  MapPin,
  Fuel,
  AlertTriangle,
  Wrench,
  Circle,
  Utensils,
  Star,
  Tent,
  FileText,
  Tag,
  Camera,
  Loader2,
} from 'lucide-react'
import { Dropzone } from './Dropzone'

export type EntryType =
  | 'checkin'
  | 'fuel'
  | 'breakdown'
  | 'repair'
  | 'tyre'
  | 'restaurant'
  | 'find'
  | 'camp'
  | 'note'

export interface DiaryEntry {
  id: string
  adventure_id: string
  type: EntryType
  title: string | null
  body: string | null
  lat: number | null
  lng: number | null
  location_name: string | null
  occurred_at: string
  images: string[]
  tags: string[]
  rating: number | null
  data: Record<string, unknown>
  created_at: string
  updated_at: string
}

const TYPES: {
  type: EntryType
  label: string
  icon: React.ReactNode
  color: string
  ring: string
  bg: string
}[] = [
  { type: 'checkin', label: 'Check-in', icon: <MapPin size={15} />, color: 'text-accent', ring: 'ring-accent', bg: 'bg-accent/20' },
  { type: 'fuel', label: 'Fuel stop', icon: <Fuel size={15} />, color: 'text-yellow-400', ring: 'ring-yellow-400', bg: 'bg-yellow-400/20' },
  { type: 'restaurant', label: 'Restaurant', icon: <Utensils size={15} />, color: 'text-green-400', ring: 'ring-green-400', bg: 'bg-green-400/20' },
  { type: 'camp', label: 'Camp', icon: <Tent size={15} />, color: 'text-teal-400', ring: 'ring-teal-400', bg: 'bg-teal-400/20' },
  { type: 'find', label: 'Cool find', icon: <Star size={15} />, color: 'text-purple-400', ring: 'ring-purple-400', bg: 'bg-purple-400/20' },
  { type: 'breakdown', label: 'Breakdown', icon: <AlertTriangle size={15} />, color: 'text-red-400', ring: 'ring-red-400', bg: 'bg-red-400/20' },
  { type: 'repair', label: 'Repair', icon: <Wrench size={15} />, color: 'text-orange-400', ring: 'ring-orange-400', bg: 'bg-orange-400/20' },
  { type: 'tyre', label: 'Tyre event', icon: <Circle size={15} />, color: 'text-amber-400', ring: 'ring-amber-400', bg: 'bg-amber-400/20' },
  { type: 'note', label: 'Note', icon: <FileText size={15} />, color: 'text-khaki-deep', ring: 'ring-khaki-deep', bg: 'bg-ink-soft' },
]

const INPUT =
  'w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none'
const LABEL = 'block text-[10px] font-700 uppercase tracking-widest text-khaki-deep mb-1'

function assetUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`
}

function StarRating({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-lg transition-colors ${n <= (value ?? 0) ? 'text-yellow-400' : 'text-khaki-deep/30 hover:text-yellow-400/50'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function TypeSpecificFields({
  type,
  data,
  onChange,
}: {
  type: EntryType
  data: Record<string, unknown>
  onChange: (d: Record<string, unknown>) => void
}) {
  const set = (key: string, val: unknown) => onChange({ ...data, [key]: val })

  if (type === 'fuel')
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={LABEL}>Litres</label>
          <input type="number" step="0.1" placeholder="65.0" className={INPUT}
            value={(data.litres as string) ?? ''} onChange={(e) => set('litres', e.target.value ? parseFloat(e.target.value) : undefined)} />
        </div>
        <div>
          <label className={LABEL}>Cost / litre</label>
          <input type="number" step="0.01" placeholder="24.90" className={INPUT}
            value={(data.cost_per_litre as string) ?? ''} onChange={(e) => set('cost_per_litre', e.target.value ? parseFloat(e.target.value) : undefined)} />
        </div>
        <div>
          <label className={LABEL}>Odometer (km)</label>
          <input type="number" placeholder="128450" className={INPUT}
            value={(data.odometer as string) ?? ''} onChange={(e) => set('odometer', e.target.value ? parseInt(e.target.value) : undefined)} />
        </div>
        <div>
          <label className={LABEL}>Station name</label>
          <input type="text" placeholder="Engen Maun" className={INPUT}
            value={(data.station_name as string) ?? ''} onChange={(e) => set('station_name', e.target.value)} />
        </div>
        <div>
          <label className={LABEL}>Fuel type</label>
          <select className={INPUT} value={(data.fuel_type as string) ?? 'diesel'} onChange={(e) => set('fuel_type', e.target.value)}>
            <option value="diesel">Diesel</option>
            <option value="petrol">Petrol</option>
            <option value="lpg">LPG</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Total cost</label>
          <input type="number" step="0.01" placeholder="Auto-calc" className={INPUT}
            value={(data.total_cost as string) ?? ''} onChange={(e) => set('total_cost', e.target.value ? parseFloat(e.target.value) : undefined)} />
        </div>
      </div>
    )

  if (type === 'breakdown')
    return (
      <div className="space-y-3">
        <div>
          <label className={LABEL}>Cause / what happened</label>
          <input type="text" placeholder="Rear diff oil seal failure" className={INPUT}
            value={(data.cause as string) ?? ''} onChange={(e) => set('cause', e.target.value)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Repair cost</label>
            <input type="number" step="0.01" placeholder="850.00" className={INPUT}
              value={(data.repair_cost as string) ?? ''} onChange={(e) => set('repair_cost', e.target.value ? parseFloat(e.target.value) : undefined)} />
          </div>
          <div className="flex items-end pb-2">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-bone">
              <input type="checkbox" className="h-4 w-4 rounded border-line accent-accent"
                checked={Boolean(data.resolved)} onChange={(e) => set('resolved', e.target.checked)} />
              Resolved on the road
            </label>
          </div>
        </div>
        {Boolean(data.resolved) && (
          <div>
            <label className={LABEL}>How it was fixed</label>
            <textarea rows={2} placeholder="Temporary seal with Pratley, proper fix in Windhoek" className={INPUT}
              value={(data.resolution as string) ?? ''} onChange={(e) => set('resolution', e.target.value)} />
          </div>
        )}
      </div>
    )

  if (type === 'repair')
    return (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Mechanic / workshop</label>
            <input type="text" placeholder="Mario's Auto, Windhoek" className={INPUT}
              value={(data.mechanic as string) ?? ''} onChange={(e) => set('mechanic', e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Cost</label>
            <input type="number" step="0.01" className={INPUT}
              value={(data.cost as string) ?? ''} onChange={(e) => set('cost', e.target.value ? parseFloat(e.target.value) : undefined)} />
          </div>
        </div>
        <div>
          <label className={LABEL}>Parts replaced</label>
          <input type="text" placeholder="Oil seal, gasket, diff oil x2L (comma separated)" className={INPUT}
            value={(data.parts as string) ?? ''} onChange={(e) => set('parts', e.target.value)} />
        </div>
      </div>
    )

  if (type === 'tyre')
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={LABEL}>Event type</label>
          <select className={INPUT} value={(data.event_type as string) ?? 'puncture'} onChange={(e) => set('event_type', e.target.value)}>
            <option value="puncture">Puncture</option>
            <option value="replacement">Full replacement</option>
            <option value="rotation">Rotation</option>
            <option value="repair">Plug/patch repair</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Position</label>
          <select className={INPUT} value={(data.position as string) ?? ''} onChange={(e) => set('position', e.target.value)}>
            <option value="">Select…</option>
            <option value="front-left">Front left</option>
            <option value="front-right">Front right</option>
            <option value="rear-left">Rear left</option>
            <option value="rear-right">Rear right</option>
            <option value="spare">Spare</option>
            <option value="all">All four</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Brand / size</label>
          <input type="text" placeholder="BF Goodrich 265/70/R17" className={INPUT}
            value={(data.brand as string) ?? ''} onChange={(e) => set('brand', e.target.value)} />
        </div>
        <div>
          <label className={LABEL}>Cost</label>
          <input type="number" step="0.01" className={INPUT}
            value={(data.cost as string) ?? ''} onChange={(e) => set('cost', e.target.value ? parseFloat(e.target.value) : undefined)} />
        </div>
      </div>
    )

  if (type === 'restaurant')
    return (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Cuisine</label>
            <input type="text" placeholder="Namibian, braai, seafood…" className={INPUT}
              value={(data.cuisine as string) ?? ''} onChange={(e) => set('cuisine', e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Price range</label>
            <select className={INPUT} value={(data.price_range as string) ?? ''} onChange={(e) => set('price_range', e.target.value)}>
              <option value="">Select…</option>
              <option value="budget">$ Budget</option>
              <option value="mid">$$ Mid-range</option>
              <option value="splurge">$$$ Splurge</option>
            </select>
          </div>
        </div>
        <div>
          <label className={LABEL}>Must-order dishes</label>
          <input type="text" placeholder="Oryx steak, springbok pie…" className={INPUT}
            value={(data.recommended as string) ?? ''} onChange={(e) => set('recommended', e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-bone">
            <input type="checkbox" className="h-4 w-4 rounded border-line accent-accent"
              checked={Boolean(data.would_return)} onChange={(e) => set('would_return', e.target.checked)} />
            Would go back
          </label>
        </div>
      </div>
    )

  if (type === 'camp')
    return (
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Campsite name</label>
            <input type="text" placeholder="Nkasa Rupara NP campsite" className={INPUT}
              value={(data.campsite_name as string) ?? ''} onChange={(e) => set('campsite_name', e.target.value)} />
          </div>
          <div>
            <label className={LABEL}>Cost / night</label>
            <input type="number" step="0.01" placeholder="250" className={INPUT}
              value={(data.cost_per_night as string) ?? ''} onChange={(e) => set('cost_per_night', e.target.value ? parseFloat(e.target.value) : undefined)} />
          </div>
        </div>
        <div>
          <label className={LABEL}>Facilities</label>
          <input type="text" placeholder="Hot shower, braai, flush toilet, pool (comma separated)" className={INPUT}
            value={(data.facilities as string) ?? ''} onChange={(e) => set('facilities', e.target.value)} />
        </div>
      </div>
    )

  if (type === 'find')
    return (
      <div>
        <label className={LABEL}>Category</label>
        <select className={INPUT} value={(data.category as string) ?? ''} onChange={(e) => set('category', e.target.value)}>
          <option value="">Select…</option>
          <option value="viewpoint">Viewpoint / scenic spot</option>
          <option value="waterhole">Waterhole / wildlife spot</option>
          <option value="swimming">Swimming hole / beach</option>
          <option value="ruins">Ruins / historical site</option>
          <option value="town">Town / village gem</option>
          <option value="shop">Shop / market find</option>
          <option value="road">Incredible road</option>
          <option value="other">Other</option>
        </select>
      </div>
    )

  if (type === 'checkin')
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={LABEL}>Mood</label>
          <select className={INPUT} value={(data.mood as string) ?? ''} onChange={(e) => set('mood', e.target.value)}>
            <option value="">Select…</option>
            <option value="stoked">Absolutely stoked 🤩</option>
            <option value="good">Good vibes ✌️</option>
            <option value="tired">Tired but happy 😴</option>
            <option value="tough">Tough day 😤</option>
            <option value="relieved">Relieved 😅</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Weather</label>
          <select className={INPUT} value={(data.weather as string) ?? ''} onChange={(e) => set('weather', e.target.value)}>
            <option value="">Select…</option>
            <option value="sunny">Sunny & hot ☀️</option>
            <option value="warm">Warm & clear 🌤</option>
            <option value="cloudy">Overcast</option>
            <option value="rain">Rain 🌧</option>
            <option value="storm">Thunderstorm ⛈</option>
            <option value="cold">Cold</option>
            <option value="dust">Dusty 💨</option>
          </select>
        </div>
        <div>
          <label className={LABEL}>Odometer (km)</label>
          <input type="number" placeholder="128450" className={INPUT}
            value={(data.odometer as string) ?? ''} onChange={(e) => set('odometer', e.target.value ? parseInt(e.target.value) : undefined)} />
        </div>
      </div>
    )

  return null
}

interface EntryModalProps {
  adventureId: string
  entry?: DiaryEntry | null
  defaultLat?: number
  defaultLng?: number
  onSaved: (entry: DiaryEntry) => void
  onDeleted?: (id: string) => void
  onClose: () => void
}

export function EntryModal({
  adventureId,
  entry,
  defaultLat,
  defaultLng,
  onSaved,
  onDeleted,
  onClose,
}: EntryModalProps) {
  const isEdit = Boolean(entry)
  const [type, setType] = useState<EntryType>(entry?.type ?? 'checkin')
  const [title, setTitle] = useState(entry?.title ?? '')
  const [body, setBody] = useState(entry?.body ?? '')
  const [locationName, setLocationName] = useState(entry?.location_name ?? '')
  const [lat, setLat] = useState(String(entry?.lat ?? defaultLat ?? ''))
  const [lng, setLng] = useState(String(entry?.lng ?? defaultLng ?? ''))
  const [occurredAt, setOccurredAt] = useState(
    entry?.occurred_at
      ? new Date(entry.occurred_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  )
  const [rating, setRating] = useState<number | null>(entry?.rating ?? null)
  const [data, setData] = useState<Record<string, unknown>>(
    (entry?.data as Record<string, unknown>) ?? {},
  )
  const [images, setImages] = useState<string[]>(entry?.images ?? [])
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>(entry?.tags ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPhotos, setShowPhotos] = useState(false)

  const meta = TYPES.find((t) => t.type === type)!
  const hasRating = ['restaurant', 'camp', 'find'].includes(type)

  async function handleSave() {
    setSaving(true)
    setError('')
    const payload = {
      type,
      title: title.trim() || null,
      body: body.trim() || null,
      location_name: locationName.trim() || null,
      lat: lat ? parseFloat(lat) : null,
      lng: lng ? parseFloat(lng) : null,
      occurred_at: new Date(occurredAt).toISOString(),
      rating: hasRating ? rating : null,
      data,
      images,
      tags,
    }
    const url = isEdit
      ? `/api/adventures/${adventureId}/entries/${entry!.id}`
      : `/api/adventures/${adventureId}/entries`
    const method = isEdit ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = (await res.json()) as { entry?: DiaryEntry; error?: string }
    setSaving(false)
    if (json.error) { setError(json.error); return }
    onSaved(json.entry!)
  }

  async function handleDelete() {
    if (!entry || !confirm('Delete this entry?')) return
    setSaving(true)
    await fetch(`/api/adventures/${adventureId}/entries/${entry.id}`, { method: 'DELETE' })
    setSaving(false)
    onDeleted?.(entry.id)
    onClose()
  }

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setTagInput('')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/80 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-line bg-ink-soft sm:rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-display text-sm font-700 uppercase tracking-widest text-bone">
            {isEdit ? 'Edit Entry' : 'Log Entry'}
          </h2>
          <button type="button" onClick={onClose} className="text-khaki-deep transition-colors hover:text-bone">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {/* Type selector */}
          <div>
            <p className={LABEL}>Entry type</p>
            <div className="flex flex-wrap gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setType(t.type)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-600 transition-all ${
                    type === t.type
                      ? `border-transparent ${t.bg} ${t.color} ring-2 ${t.ring} ring-offset-1 ring-offset-ink-soft`
                      : 'border-line text-khaki-deep hover:border-line/60 hover:text-bone'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Common fields */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={LABEL}>Title (optional)</label>
              <input
                type="text"
                placeholder={`e.g. ${meta.label} at ${locationName || '…'}`}
                className={INPUT}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className={LABEL}>Date & time</label>
              <input
                type="datetime-local"
                className={INPUT}
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={LABEL}>Location name</label>
            <input
              type="text"
              placeholder="Maun, Botswana"
              className={INPUT}
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={LABEL}>Latitude</label>
              <input type="number" step="any" placeholder="-18.234" className={INPUT}
                value={lat} onChange={(e) => setLat(e.target.value)} />
            </div>
            <div>
              <label className={LABEL}>Longitude</label>
              <input type="number" step="any" placeholder="24.765" className={INPUT}
                value={lng} onChange={(e) => setLng(e.target.value)} />
            </div>
          </div>

          {/* Type-specific */}
          <TypeSpecificFields type={type} data={data} onChange={setData} />

          {/* Rating */}
          {hasRating && (
            <div>
              <p className={LABEL}>Rating</p>
              <StarRating value={rating} onChange={setRating} />
            </div>
          )}

          {/* Notes / body */}
          <div>
            <label className={LABEL}>Notes</label>
            <textarea
              rows={4}
              placeholder="Write up your experience, honest impressions, tips for the next adventurer…"
              className={`${INPUT} resize-y`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div>
            <p className={LABEL}>Tags</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add tag…"
                className={`${INPUT} flex-1`}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="flex items-center gap-1.5 rounded border border-line px-3 py-2 text-xs text-khaki-deep hover:border-accent hover:text-bone"
              >
                <Tag size={12} /> Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-full bg-ink px-2.5 py-0.5 text-xs text-bone">
                    {tag}
                    <button type="button" onClick={() => setTags(tags.filter((t) => t !== tag))} className="text-khaki-deep hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Photos */}
          <div>
            <button
              type="button"
              onClick={() => setShowPhotos((o) => !o)}
              className="flex items-center gap-2 text-xs font-600 uppercase tracking-widest text-khaki-deep hover:text-bone"
            >
              <Camera size={13} />
              {showPhotos ? 'Hide photos' : `Photos${images.length > 0 ? ` (${images.length})` : ''}`}
            </button>
            {showPhotos && (
              <div className="mt-3 space-y-3">
                <Dropzone
                  onUploaded={(path) => setImages((prev) => (prev.includes(path) ? prev : [path, ...prev]))}
                />
                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                    {images.map((path) => (
                      <div key={path} className="group relative aspect-square overflow-hidden rounded border border-line">
                        <Image src={assetUrl(path)} alt="" fill sizes="80px" className="object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((i) => i !== path))}
                          className="absolute right-0.5 top-0.5 hidden h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-bone group-hover:flex"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {error && <p className="rounded bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-line px-5 py-4">
          <div>
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Delete entry
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="text-xs text-khaki-deep hover:text-bone transition-colors">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded border border-accent bg-accent px-4 py-2 text-xs font-700 uppercase tracking-widest text-bone transition-colors hover:bg-accent/80 disabled:opacity-50"
            >
              {saving && <Loader2 size={12} className="animate-spin" />}
              {isEdit ? 'Update' : 'Log it'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
