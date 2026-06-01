'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { LocalizedInput } from '@/components/admin/LocalizedInput'
import { FormField } from '@/components/admin/FormField'
import { SaveBar } from '@/components/admin/SaveBar'
import { MediaPicker } from '@/components/admin/MediaPicker'
import { createAdventure, updateAdventure, deleteAdventure, type AdventureState } from './actions'
import type { Tables } from '@/db/types'

type Adventure = Tables<'adventures'>

function locStr(v: unknown, locale: 'en' | 'de' = 'en'): string {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return ''
  return String((v as Record<string, unknown>)[locale] ?? '')
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const initial: AdventureState = { message: '', ok: false }

const inputClass =
  'w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none'

export function AdventureEditor({ adventure }: { adventure?: Adventure }) {
  const saveAction = adventure ? updateAdventure.bind(null, adventure.id) : createAdventure
  const [state, formAction, pending] = useActionState(saveAction, initial)
  const deleteAction = adventure ? deleteAdventure.bind(null, adventure.id) : null

  return (
    <div className="max-w-3xl">
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
            onSubmit={(e) => {
              if (!confirm('Delete this adventure permanently?')) e.preventDefault()
            }}
          >
            <button type="submit" className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Delete
            </button>
          </form>
        )}
      </div>

      <form action={formAction} className="space-y-6">
        <LocalizedInput
          label="Title"
          nameEn="title_en"
          nameDe="title_de"
          defaultEn={locStr(adventure?.title)}
          defaultDe={locStr(adventure?.title, 'de')}
          placeholder="Adventure title"
          required
        />

        <FormField label="Slug" hint="Lowercase, hyphens only. Auto-filled from title.">
          <input
            type="text"
            name="slug"
            defaultValue={adventure?.slug ?? ''}
            placeholder="kaokoland-namibia"
            pattern="[a-z0-9-]+"
            required
            className={`${inputClass} font-mono`}
            onBlur={(e) => {
              if (e.target.value) return
              const titleInput = e.target.form?.querySelector<HTMLInputElement>(
                'input[name="title_en"]',
              )
              if (titleInput?.value) e.target.value = slugify(titleInput.value)
            }}
          />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Country">
            <input
              type="text"
              name="country"
              defaultValue={adventure?.country ?? ''}
              placeholder="Namibia"
              className={inputClass}
            />
          </FormField>
          <FormField label="Location / Region">
            <input
              type="text"
              name="location"
              defaultValue={adventure?.location ?? ''}
              placeholder="Kaokoland"
              className={inputClass}
            />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Latitude">
            <input
              type="number"
              name="lat"
              step="any"
              defaultValue={adventure?.lat ?? ''}
              placeholder="-18.2358"
              className={inputClass}
            />
          </FormField>
          <FormField label="Longitude">
            <input
              type="number"
              name="lng"
              step="any"
              defaultValue={adventure?.lng ?? ''}
              placeholder="13.1897"
              className={inputClass}
            />
          </FormField>
          <FormField label="Tag" hint="e.g. Overland, Bush Camp">
            <input
              type="text"
              name="tag"
              defaultValue={adventure?.tag ?? ''}
              placeholder="Overland"
              className={inputClass}
            />
          </FormField>
        </div>

        <MediaPicker
          name="cover_image"
          defaultValue={adventure?.cover_image}
          label="Cover Image"
        />

        <LocalizedInput
          label="Excerpt"
          nameEn="excerpt_en"
          nameDe="excerpt_de"
          defaultEn={locStr(adventure?.excerpt)}
          defaultDe={locStr(adventure?.excerpt, 'de')}
          placeholder="Short teaser shown on listing page…"
          multiline
          rows={3}
        />

        <LocalizedInput
          label="Body (Markdown)"
          nameEn="body_en"
          nameDe="body_de"
          defaultEn={locStr(adventure?.body)}
          defaultDe={locStr(adventure?.body, 'de')}
          placeholder="Full adventure content in Markdown…"
          multiline
          rows={16}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Sort order" hint="Lower = shown first">
            <input
              type="number"
              name="sort_order"
              defaultValue={adventure?.sort_order ?? ''}
              placeholder="0"
              className={inputClass}
            />
          </FormField>
          <FormField label="Published date">
            <input
              type="date"
              name="published_at"
              defaultValue={adventure?.published_at?.slice(0, 10) ?? ''}
              className={inputClass}
            />
          </FormField>
          <FormField label="Status">
            <label className="flex cursor-pointer items-center gap-3 pt-5">
              <input
                type="checkbox"
                name="published"
                defaultChecked={adventure?.published ?? false}
                className="h-4 w-4 rounded border-line accent-accent"
              />
              <span className="text-sm text-bone">Published</span>
            </label>
          </FormField>
        </div>

        <SaveBar pending={pending} message={state.message} ok={state.ok} />
      </form>
    </div>
  )
}
