'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { FormField } from '@/components/admin/FormField'
import { LocalizedInput } from '@/components/admin/LocalizedInput'
import { SaveBar } from '@/components/admin/SaveBar'
import { createPin, updatePin, deletePin, type PinState } from './actions'
import type { Tables } from '@/db/types'

type Pin = Tables<'map_pins'>

function noteStr(v: unknown, locale: 'en' | 'de' = 'en'): string {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return ''
  return String((v as Record<string, unknown>)[locale] ?? '')
}

const initial: PinState = { message: '', ok: false }

const inputClass =
  'w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none'

const CATEGORIES = ['Camp', 'Border', 'Fuel', 'Water', 'Scenic', 'Mechanic', 'Other']

export function PinEditor({ pin }: { pin?: Pin }) {
  const saveAction = pin ? updatePin.bind(null, pin.id) : createPin
  const [state, formAction, pending] = useActionState(saveAction, initial)
  const deleteAction = pin ? deletePin.bind(null, pin.id) : null

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/pins"
          className="text-xs font-600 uppercase tracking-widest text-khaki-deep hover:text-bone transition-colors"
        >
          ← All Pins
        </Link>
        {deleteAction && (
          <form
            action={deleteAction}
            onSubmit={(e) => {
              if (!confirm('Delete this pin permanently?')) e.preventDefault()
            }}
          >
            <button type="submit" className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Delete
            </button>
          </form>
        )}
      </div>

      <form action={formAction} className="space-y-5">
        <FormField label="Label" hint="Shown in popover and on admin list">
          <input
            type="text"
            name="label"
            defaultValue={pin?.label ?? ''}
            placeholder="Epupa Falls Camp"
            required
            className={inputClass}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Latitude" hint="e.g. -17.4823">
            <input
              type="number"
              name="lat"
              step="any"
              defaultValue={pin?.lat ?? ''}
              placeholder="-17.4823"
              required
              className={inputClass}
            />
          </FormField>
          <FormField label="Longitude" hint="e.g. 13.2614">
            <input
              type="number"
              name="lng"
              step="any"
              defaultValue={pin?.lng ?? ''}
              placeholder="13.2614"
              required
              className={inputClass}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Category">
            <select
              name="category"
              defaultValue={pin?.category ?? ''}
              className={inputClass}
            >
              <option value="">— None —</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Country">
            <input
              type="text"
              name="country"
              defaultValue={pin?.country ?? ''}
              placeholder="Namibia"
              className={inputClass}
            />
          </FormField>
        </div>

        <LocalizedInput
          label="Note"
          nameEn="note_en"
          nameDe="note_de"
          defaultEn={noteStr(pin?.note)}
          defaultDe={noteStr(pin?.note, 'de')}
          placeholder="Short description shown in the map popover…"
          multiline
          rows={3}
        />

        <FormField label="Related Dispatch ID" hint="Optional — links popover to a dispatch">
          <input
            type="text"
            name="related_post_id"
            defaultValue={pin?.related_post_id ?? ''}
            placeholder="UUID of the related post"
            className={`${inputClass} font-mono text-xs`}
          />
        </FormField>

        <SaveBar pending={pending} message={state.message} ok={state.ok} />
      </form>
    </div>
  )
}
