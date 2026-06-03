'use client'

import { useState } from 'react'
import { Plus, X, Check, Loader2, GripVertical } from 'lucide-react'
import type { DiaryEntry } from './EntryModal'

export interface ItineraryItem {
  id: string
  adventure_id: string
  day_number: number | null
  title: string
  description: string | null
  lat: number | null
  lng: number | null
  location_name: string | null
  planned_date: string | null
  actual_entry_id: string | null
  sort_order: number
  created_at: string
}

const INPUT =
  'w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none'
const LABEL = 'block text-[10px] font-700 uppercase tracking-widest text-khaki-deep mb-1'

interface AddStopFormProps {
  adventureId: string
  sortOrder: number
  onAdded: (item: ItineraryItem) => void
  onCancel: () => void
}

function AddStopForm({ adventureId, sortOrder, onAdded, onCancel }: AddStopFormProps) {
  const [title, setTitle] = useState('')
  const [dayNumber, setDayNumber] = useState('')
  const [locationName, setLocationName] = useState('')
  const [plannedDate, setPlannedDate] = useState('')
  const [description, setDescription] = useState('')
  const [lat, setLat] = useState('')
  const [lng, setLng] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    const res = await fetch(`/api/adventures/${adventureId}/itinerary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.trim(),
        day_number: dayNumber ? parseInt(dayNumber) : null,
        location_name: locationName.trim() || null,
        planned_date: plannedDate || null,
        description: description.trim() || null,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        sort_order: sortOrder,
      }),
    })
    const json = (await res.json()) as { item?: ItineraryItem; error?: string }
    setSaving(false)
    if (json.error) { setError(json.error); return }
    onAdded(json.item!)
  }

  return (
    <div className="rounded-lg border border-accent/40 bg-ink p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={LABEL}>Day #</label>
          <input type="number" placeholder="1" className={INPUT} value={dayNumber} onChange={(e) => setDayNumber(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL}>Stop title *</label>
          <input type="text" placeholder="Maun — fuel and resupply" className={INPUT} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={LABEL}>Location</label>
          <input type="text" placeholder="Maun, Botswana" className={INPUT} value={locationName} onChange={(e) => setLocationName(e.target.value)} />
        </div>
        <div>
          <label className={LABEL}>Planned date</label>
          <input type="date" className={INPUT} value={plannedDate} onChange={(e) => setPlannedDate(e.target.value)} />
        </div>
      </div>
      <div>
        <label className={LABEL}>Notes</label>
        <textarea rows={2} placeholder="What do you plan to do here?" className={`${INPUT} resize-none`} value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="text-xs text-khaki-deep hover:text-bone transition-colors">Cancel</button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 rounded border border-accent px-3 py-1.5 text-xs font-700 text-accent hover:bg-accent hover:text-bone disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
          Add stop
        </button>
      </div>
    </div>
  )
}

interface ItineraryPanelProps {
  adventureId: string
  items: ItineraryItem[]
  entries: DiaryEntry[]
  onUpdate: (items: ItineraryItem[]) => void
}

export function ItineraryPanel({ adventureId, items, entries, onUpdate }: ItineraryPanelProps) {
  const [showAdd, setShowAdd] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function deleteItem(id: string) {
    if (!confirm('Remove this stop from the itinerary?')) return
    setDeleting(id)
    await fetch(`/api/adventures/${adventureId}/itinerary/${id}`, { method: 'DELETE' })
    setDeleting(null)
    onUpdate(items.filter((i) => i.id !== id))
  }

  async function linkEntry(itemId: string, entryId: string | null) {
    const res = await fetch(`/api/adventures/${adventureId}/itinerary/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actual_entry_id: entryId }),
    })
    const json = (await res.json()) as { item?: ItineraryItem }
    if (json.item) onUpdate(items.map((i) => (i.id === itemId ? json.item! : i)))
  }

  const entryOptions = entries.filter((e) => e.location_name || e.title)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-600 text-bone">Route plan</p>
          <p className="text-xs text-khaki-deep">Map out where you plan to go, then link actual diary entries when it happens</p>
        </div>
        {!showAdd && (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 rounded border border-line px-3 py-1.5 text-xs font-600 text-khaki-deep hover:border-accent hover:text-bone transition-colors"
          >
            <Plus size={12} />
            Add stop
          </button>
        )}
      </div>

      {items.length === 0 && !showAdd && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="text-4xl opacity-30">🗺️</div>
          <p className="text-sm font-600 text-khaki-deep">No planned stops yet</p>
          <p className="text-xs text-khaki-deep/60">
            Build your route before you go — compare plan vs reality once you&apos;re on the road
          </p>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="mt-1 rounded border border-accent px-4 py-2 text-xs font-700 uppercase tracking-widest text-accent hover:bg-accent hover:text-bone transition-colors"
          >
            Plan first stop
          </button>
        </div>
      )}

      {/* Planned stops list */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, idx) => {
            const linked = item.actual_entry_id
              ? entries.find((e) => e.id === item.actual_entry_id)
              : null
            const isDeleting = deleting === item.id
            return (
              <div
                key={item.id}
                className={`rounded-lg border transition-colors ${linked ? 'border-accent/40 bg-accent/5' : 'border-line bg-ink'} p-4`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex flex-shrink-0 flex-col items-center">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-700 ${linked ? 'border-accent bg-accent text-bone' : 'border-line text-khaki-deep'}`}>
                      {linked ? <Check size={12} /> : (item.day_number ?? idx + 1)}
                    </div>
                    <GripVertical size={14} className="mt-1 text-khaki-deep/30" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-600 text-bone">{item.title}</p>
                        {item.location_name && (
                          <p className="text-xs text-khaki-deep">{item.location_name}</p>
                        )}
                        {item.planned_date && (
                          <p className="text-xs text-khaki-deep/60">
                            {new Date(item.planned_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        disabled={isDeleting}
                        className="text-khaki-deep/40 hover:text-red-400 transition-colors"
                      >
                        {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                      </button>
                    </div>

                    {item.description && (
                      <p className="mt-1.5 text-xs text-khaki-deep">{item.description}</p>
                    )}

                    {/* Link to diary entry */}
                    <div className="mt-2">
                      <select
                        className="rounded border border-line bg-ink px-2 py-1 text-xs text-khaki-deep focus:border-accent focus:outline-none"
                        value={item.actual_entry_id ?? ''}
                        onChange={(e) => linkEntry(item.id, e.target.value || null)}
                      >
                        <option value="">{linked ? '— unlink entry' : 'Link to diary entry…'}</option>
                        {entryOptions.map((e) => (
                          <option key={e.id} value={e.id}>
                            {e.title ?? e.location_name ?? e.type} — {new Date(e.occurred_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                          </option>
                        ))}
                      </select>
                      {linked && (
                        <span className="ml-2 text-[10px] text-accent">✓ Happened!</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showAdd && (
        <AddStopForm
          adventureId={adventureId}
          sortOrder={items.length}
          onAdded={(item) => { onUpdate([...items, item]); setShowAdd(false) }}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}
