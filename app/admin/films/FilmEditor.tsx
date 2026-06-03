'use client'

import { useActionState, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { LocalizedInput } from '@/components/admin/LocalizedInput'
import { FormField } from '@/components/admin/FormField'
import { SaveBar } from '@/components/admin/SaveBar'
import { createFilm, updateFilm, deleteFilm, type FilmState } from './actions'
import type { Tables } from '@/db/types'
type Film = Tables<'films'>

function locStr(v: unknown, locale: 'en' | 'de' = 'en'): string {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return ''
  return String((v as Record<string, unknown>)[locale] ?? '')
}

function extractYouTubeId(url: string): string | null {
  const patterns = [/[?&]v=([^&]+)/, /youtu\.be\/([^?]+)/, /embed\/([^?&]+)/]
  for (const pattern of patterns) {
    const m = url.match(pattern)
    if (m) return m[1]
  }
  return null
}

const initial: FilmState = { message: '', ok: false }

const inputClass =
  'w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none'

export function FilmEditor({ film }: { film?: Film }) {
  const saveAction = film ? updateFilm.bind(null, film.id) : createFilm
  const [state, formAction, pending] = useActionState(saveAction, initial)
  const deleteAction = film ? deleteFilm.bind(null, film.id) : null
  const [previewId, setPreviewId] = useState(film?.youtube_id ?? '')

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/films"
          className="text-xs font-600 uppercase tracking-widest text-khaki-deep hover:text-bone transition-colors"
        >
          ← All Films
        </Link>
        {deleteAction && (
          <form
            action={deleteAction}
            onSubmit={(e) => {
              if (!confirm('Delete this film permanently?')) e.preventDefault()
            }}
          >
            <button type="submit" className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Delete
            </button>
          </form>
        )}
      </div>

      <form action={formAction} className="space-y-6">
        <FormField label="YouTube URL" hint="Paste any YouTube share, watch, or embed URL">
          <input
            type="url"
            name="youtube_url"
            defaultValue={film?.youtube_url ?? ''}
            placeholder="https://www.youtube.com/watch?v=..."
            required
            className={inputClass}
            onChange={(e) => {
              const id = extractYouTubeId(e.target.value)
              setPreviewId(id ?? '')
            }}
          />
        </FormField>

        {/* Thumbnail preview */}
        {previewId && (
          <div className="relative aspect-video w-full overflow-hidden rounded border border-line bg-ink-soft">
            <Image
              src={`https://img.youtube.com/vi/${previewId}/maxresdefault.jpg`}
              alt="YouTube thumbnail preview"
              fill
              className="object-cover"
              sizes="672px"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink/80">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 text-bone">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        <LocalizedInput
          label="Title"
          nameEn="title_en"
          nameDe="title_de"
          defaultEn={locStr(film?.title)}
          placeholder="Film title"
          required
        />

        <LocalizedInput
          label="Description"
          nameEn="description_en"
          nameDe="description_de"
          defaultEn={locStr(film?.description)}
          placeholder="Short description shown in the grid…"
          multiline
          rows={3}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Duration" hint="e.g. 12:34">
            <input
              type="text"
              name="duration"
              defaultValue={film?.duration ?? ''}
              placeholder="12:34"
              className={inputClass}
            />
          </FormField>
          <FormField label="Sort order">
            <input
              type="number"
              name="sort_order"
              defaultValue={film?.sort_order ?? ''}
              placeholder="0"
              className={inputClass}
            />
          </FormField>
          <FormField label="Status">
            <label className="flex cursor-pointer items-center gap-3 pt-5">
              <input
                type="checkbox"
                name="published"
                defaultChecked={film?.published ?? false}
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
