'use client'

import Image from 'next/image'
import {
  MapPin,
  Fuel,
  AlertTriangle,
  Wrench,
  Circle,
  Utensils,
  Star,
  Tent,
  FileText,
  Pencil,
} from 'lucide-react'
import type { DiaryEntry } from './EntryModal'

function assetUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  checkin: <MapPin size={14} />,
  fuel: <Fuel size={14} />,
  breakdown: <AlertTriangle size={14} />,
  repair: <Wrench size={14} />,
  tyre: <Circle size={14} />,
  restaurant: <Utensils size={14} />,
  find: <Star size={14} />,
  camp: <Tent size={14} />,
  note: <FileText size={14} />,
}

const TYPE_LABEL: Record<string, string> = {
  checkin: 'Check-in',
  fuel: 'Fuel stop',
  breakdown: 'Breakdown',
  repair: 'Repair',
  tyre: 'Tyre event',
  restaurant: 'Restaurant',
  find: 'Cool find',
  camp: 'Camp',
  note: 'Note',
}

const TYPE_COLOR: Record<string, string> = {
  checkin: 'text-accent bg-accent/10 border-accent/30',
  fuel: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  breakdown: 'text-red-400 bg-red-400/10 border-red-400/30',
  repair: 'text-orange-400 bg-orange-400/10 border-orange-400/30',
  tyre: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
  restaurant: 'text-green-400 bg-green-400/10 border-green-400/30',
  find: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  camp: 'text-teal-400 bg-teal-400/10 border-teal-400/30',
  note: 'text-khaki-deep bg-ink border-line',
}

const LINE_COLOR: Record<string, string> = {
  checkin: 'border-accent/40',
  fuel: 'border-yellow-400/40',
  breakdown: 'border-red-400/40',
  repair: 'border-orange-400/40',
  tyre: 'border-amber-400/40',
  restaurant: 'border-green-400/40',
  find: 'border-purple-400/40',
  camp: 'border-teal-400/40',
  note: 'border-line',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-ZA', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })
}

function groupByDate(entries: DiaryEntry[]): [string, DiaryEntry[]][] {
  const map = new Map<string, DiaryEntry[]>()
  for (const e of entries) {
    const day = new Date(e.occurred_at).toDateString()
    const group = map.get(day) ?? []
    group.push(e)
    map.set(day, group)
  }
  return Array.from(map.entries())
}

function FuelSummary({ data }: { data: Record<string, unknown> }) {
  if (!data.litres && !data.station_name) return null
  return (
    <div className="mt-2 flex flex-wrap gap-3 text-xs text-khaki-deep">
      {Boolean(data.litres) && <span>⛽ {String(data.litres)}L</span>}
      {Boolean(data.cost_per_litre) && <span>@ R{String(data.cost_per_litre)}/L</span>}
      {Boolean(data.total_cost) && <span>= R{String(data.total_cost)}</span>}
      {Boolean(data.odometer) && <span>📍 {String(data.odometer)} km</span>}
      {Boolean(data.station_name) && <span>{String(data.station_name)}</span>}
    </div>
  )
}

function TyreSummary({ data }: { data: Record<string, unknown> }) {
  if (!data.event_type) return null
  return (
    <div className="mt-2 text-xs text-khaki-deep">
      {String(data.event_type)} {data.position ? `· ${String(data.position)}` : ''}
      {data.brand ? ` · ${String(data.brand)}` : ''}
    </div>
  )
}

interface DiaryTimelineProps {
  entries: DiaryEntry[]
  onEdit: (entry: DiaryEntry) => void
}

export function DiaryTimeline({ entries, onEdit }: DiaryTimelineProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="text-4xl opacity-30">📍</div>
        <p className="text-sm font-600 text-khaki-deep">No entries yet</p>
        <p className="text-xs text-khaki-deep/60">
          Click on the map to drop a pin, or use &quot;Log entry&quot; to start the diary
        </p>
      </div>
    )
  }

  const groups = groupByDate(entries)

  return (
    <div className="space-y-8">
      {groups.map(([day, dayEntries]) => (
        <div key={day}>
          <p className="mb-3 text-[10px] font-700 uppercase tracking-widest text-khaki-deep">
            {formatDate(dayEntries[0].occurred_at)}
          </p>
          <div className="space-y-3">
            {dayEntries.map((entry, i) => {
              const colors = TYPE_COLOR[entry.type] ?? TYPE_COLOR.note
              const lineColor = LINE_COLOR[entry.type] ?? LINE_COLOR.note
              const isLast = i === dayEntries.length - 1
              const data = (entry.data ?? {}) as Record<string, unknown>

              return (
                <div key={entry.id} className="relative flex gap-3">
                  {/* Vertical timeline line */}
                  {!isLast && (
                    <div className={`absolute left-[15px] top-8 h-[calc(100%+0.75rem)] w-px border-l-2 border-dashed ${lineColor}`} />
                  )}

                  {/* Icon bubble */}
                  <div className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${colors}`}>
                    {TYPE_ICON[entry.type] ?? TYPE_ICON.note}
                  </div>

                  {/* Card */}
                  <div className="min-w-0 flex-1 rounded-lg border border-line bg-ink p-3 hover:border-line/60 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-700 uppercase tracking-wider ${colors}`}>
                            {TYPE_LABEL[entry.type] ?? entry.type}
                          </span>
                          {entry.rating && (
                            <span className="text-xs text-yellow-400">
                              {'★'.repeat(entry.rating)}{'☆'.repeat(5 - entry.rating)}
                            </span>
                          )}
                        </div>
                        {entry.title && (
                          <p className="mt-1 text-sm font-600 text-bone">{entry.title}</p>
                        )}
                        {entry.location_name && (
                          <p className="mt-0.5 text-xs text-khaki-deep">{entry.location_name}</p>
                        )}
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2">
                        <span className="text-[10px] text-khaki-deep/60">{formatTime(entry.occurred_at)}</span>
                        <button
                          type="button"
                          onClick={() => onEdit(entry)}
                          className="rounded p-1 text-khaki-deep transition-colors hover:bg-ink-soft hover:text-bone"
                          title="Edit entry"
                        >
                          <Pencil size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Type-specific summary */}
                    {entry.type === 'fuel' && <FuelSummary data={data} />}
                    {entry.type === 'tyre' && <TyreSummary data={data} />}
                    {entry.type === 'breakdown' && Boolean(data.cause) && (
                      <p className="mt-1.5 text-xs text-red-300/80">{String(data.cause)}</p>
                    )}
                    {entry.type === 'restaurant' && (
                      <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-khaki-deep">
                        {Boolean(data.cuisine) && <span>{String(data.cuisine)}</span>}
                        {Boolean(data.price_range) && <span>· {String(data.price_range)}</span>}
                        {Boolean(data.would_return) && <span className="text-green-400">· Would go back ✓</span>}
                      </div>
                    )}

                    {/* Body */}
                    {entry.body && (
                      <p className="mt-2 text-xs leading-relaxed text-khaki-deep line-clamp-3">
                        {entry.body}
                      </p>
                    )}

                    {/* Tags */}
                    {entry.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entry.tags.map((tag) => (
                          <span key={tag} className="rounded-full bg-ink-soft px-2 py-0.5 text-[10px] text-khaki-deep">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Photos */}
                    {entry.images.length > 0 && (
                      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
                        {entry.images.slice(0, 6).map((path) => (
                          <div key={path} className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded border border-line">
                            <Image src={assetUrl(path)} alt="" fill sizes="80px" className="object-cover" />
                          </div>
                        ))}
                        {entry.images.length > 6 && (
                          <div className="flex h-14 w-20 flex-shrink-0 items-center justify-center rounded border border-line text-xs text-khaki-deep">
                            +{entry.images.length - 6}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
