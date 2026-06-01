'use client'

import { useActionState } from 'react'
import { FormField } from '@/components/admin/FormField'
import { SaveBar } from '@/components/admin/SaveBar'
import { saveSettings, type SettingsState } from './actions'
import type { Tables } from '@/db/types'

type Settings = Tables<'site_settings'>

function socStr(v: unknown, key: string): string {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return ''
  return String((v as Record<string, unknown>)[key] ?? '')
}

const initial: SettingsState = { message: '', ok: false }

const STATS_EXAMPLE = `[
  { "value": 47, "suffix": "+", "label": { "en": "Countries Crossed" } },
  { "value": 230000, "label": { "en": "Km Covered" } }
]`

const inputClass =
  'w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none'

export function SettingsEditor({ settings }: { settings: Settings | null }) {
  const [state, formAction, pending] = useActionState(saveSettings, initial)

  const statsDefault = settings?.stats
    ? JSON.stringify(settings.stats, null, 2)
    : STATS_EXAMPLE

  return (
    <form action={formAction} className="max-w-2xl space-y-8">
      {/* Stats */}
      <section>
        <h2 className="font-display mb-4 text-sm font-700 uppercase tracking-widest text-bone">
          Stats Strip
        </h2>
        <FormField
          label="Stats (JSON)"
          hint={`Array of { value, suffix?, label: { en, de? } }. Example:\n${STATS_EXAMPLE}`}
        >
          <textarea
            name="stats"
            rows={10}
            defaultValue={statsDefault}
            className={`${inputClass} resize-y font-mono text-xs`}
          />
        </FormField>
      </section>

      {/* Socials */}
      <section>
        <h2 className="font-display mb-4 text-sm font-700 uppercase tracking-widest text-bone">
          Social Links
        </h2>
        <div className="space-y-4">
          <FormField label="Instagram URL">
            <input
              type="url"
              name="instagram"
              defaultValue={socStr(settings?.socials, 'instagram')}
              placeholder="https://instagram.com/…"
              className={inputClass}
            />
          </FormField>
          <FormField label="YouTube URL">
            <input
              type="url"
              name="youtube"
              defaultValue={socStr(settings?.socials, 'youtube')}
              placeholder="https://youtube.com/…"
              className={inputClass}
            />
          </FormField>
          <FormField label="Facebook URL">
            <input
              type="url"
              name="facebook"
              defaultValue={socStr(settings?.socials, 'facebook')}
              placeholder="https://facebook.com/…"
              className={inputClass}
            />
          </FormField>
          <FormField label="TikTok URL">
            <input
              type="url"
              name="tiktok"
              defaultValue={socStr(settings?.socials, 'tiktok')}
              placeholder="https://tiktok.com/…"
              className={inputClass}
            />
          </FormField>
        </div>
      </section>

      <SaveBar pending={pending} message={state.message} ok={state.ok} />
    </form>
  )
}
