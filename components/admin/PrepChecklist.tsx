'use client'

import { useState, useId } from 'react'
import { Check, Plus, X } from 'lucide-react'

export type PrepItem = {
  id: string
  category: 'docs' | 'vehicle' | 'gear' | 'packing' | 'nav' | 'other'
  label: string
  done: boolean
}

const CATEGORIES: { value: PrepItem['category']; label: string }[] = [
  { value: 'docs',    label: 'Documents' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'gear',    label: 'Gear' },
  { value: 'packing', label: 'Packing' },
  { value: 'nav',     label: 'Navigation' },
  { value: 'other',   label: 'Other' },
]

function nanoid() { return Math.random().toString(36).slice(2, 10) }

interface Props {
  items: PrepItem[]
  onChange: (items: PrepItem[]) => void
}

export function PrepChecklist({ items, onChange }: Props) {
  const [newLabel, setNewLabel] = useState('')
  const [newCat, setNewCat] = useState<PrepItem['category']>('docs')
  const inputId = useId()

  const done = items.filter((i) => i.done).length
  const total = items.length
  const pct = total === 0 ? 0 : Math.round((done / total) * 100)

  function toggle(id: string) {
    onChange(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))
  }

  function remove(id: string) {
    onChange(items.filter((i) => i.id !== id))
  }

  function add() {
    const label = newLabel.trim()
    if (!label) return
    onChange([...items, { id: nanoid(), category: newCat, label, done: false }])
    setNewLabel('')
  }

  const grouped = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category === cat.value),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      {total > 0 && (
        <div className="rounded-lg border border-line bg-ink p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">
              Trip loading
            </p>
            <p className="font-mono text-xs font-700 text-accent">{pct}%</p>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-ink-soft">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-khaki-deep">
            {done} of {total} items done
          </p>
        </div>
      )}

      {/* Items grouped by category */}
      {grouped.map((group) => {
        const groupDone = group.items.filter((i) => i.done).length
        return (
          <div key={group.value}>
            <div className="mb-2 flex items-center gap-2">
              <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">
                {group.label}
              </p>
              <span className="text-[10px] text-khaki-deep/60">
                {groupDone}/{group.items.length}
              </span>
              {groupDone === group.items.length && group.items.length > 0 && (
                <Check size={10} className="text-accent" />
              )}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors ${
                      item.done
                        ? 'border-accent bg-accent text-bone'
                        : 'border-line bg-ink text-transparent hover:border-accent/50'
                    }`}
                  >
                    <Check size={11} />
                  </button>
                  <span className={`flex-1 text-sm ${item.done ? 'text-khaki-deep line-through' : 'text-bone'}`}>
                    {item.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="text-khaki-deep/40 hover:text-red-400 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Add new item */}
      <div className="flex gap-2">
        <select
          value={newCat}
          onChange={(e) => setNewCat(e.target.value as PrepItem['category'])}
          className="rounded border border-line bg-ink px-2 py-1.5 text-xs text-bone focus:border-accent focus:outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <input
          id={inputId}
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Add prep item…"
          className="flex-1 rounded border border-line bg-ink px-3 py-1.5 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={add}
          className="flex items-center gap-1 rounded border border-accent px-3 py-1.5 text-xs font-700 text-accent hover:bg-accent hover:text-bone transition-colors"
        >
          <Plus size={12} />
          Add
        </button>
      </div>
    </div>
  )
}
