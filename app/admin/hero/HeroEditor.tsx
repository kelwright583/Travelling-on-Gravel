'use client'

import { useActionState } from 'react'
import { LocalizedInput } from '@/components/admin/LocalizedInput'
import { FormField } from '@/components/admin/FormField'
import { SaveBar } from '@/components/admin/SaveBar'
import { saveHero, type HeroState } from './actions'
import type { Tables } from '@/db/types'
import { t } from '@/lib/i18n/types'

type Settings = Tables<'site_settings'>

const initial: HeroState = { message: '', ok: false }

function locStr(v: unknown): string {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return ''
  return String((v as Record<string, unknown>)['en'] ?? '')
}

function locStrDe(v: unknown): string {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return ''
  return String((v as Record<string, unknown>)['de'] ?? '')
}

export function HeroEditor({ settings }: { settings: Settings | null }) {
  const [state, formAction, pending] = useActionState(saveHero, initial)

  return (
    <form action={formAction} className="space-y-6 max-w-2xl">
      <LocalizedInput
        label="Headline Line 1"
        nameEn="hero_line1_en"
        nameDe="hero_line1_de"
        defaultEn={locStr(settings?.hero_line1)}
        defaultDe={locStrDe(settings?.hero_line1)}
        placeholder="LESS GLAMPING."
        required
      />

      <LocalizedInput
        label="Headline Line 2"
        nameEn="hero_line2_en"
        nameDe="hero_line2_de"
        defaultEn={locStr(settings?.hero_line2)}
        defaultDe={locStrDe(settings?.hero_line2)}
        placeholder="MORE GRAVEL."
      />

      <LocalizedInput
        label="Subtitle"
        nameEn="hero_subtitle_en"
        nameDe="hero_subtitle_de"
        defaultEn={locStr(settings?.hero_subtitle)}
        defaultDe={locStrDe(settings?.hero_subtitle)}
        placeholder="Honest dispatches from the tracks less taken across Africa."
        multiline
        rows={2}
      />

      <FormField label="Location label" hint="Displayed in top-right of hero">
        <input
          type="text"
          name="hero_location"
          defaultValue={settings?.hero_location ?? ''}
          placeholder="KAOKOLAND, NAMIBIA"
          className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
        />
      </FormField>

      <FormField label="Coordinates" hint="e.g. 18.2358° S, 13.1897° E">
        <input
          type="text"
          name="hero_coords"
          defaultValue={settings?.hero_coords ?? ''}
          placeholder="18.2358° S, 13.1897° E"
          className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
        />
      </FormField>

      {/* Live preview */}
      <div className="rounded border border-line bg-olive/10 p-4">
        <p className="mb-1 text-[10px] font-700 uppercase tracking-widest text-khaki-deep">
          Preview (read from last save)
        </p>
        <p className="font-display text-2xl font-900 uppercase leading-tight text-bone">
          {t(settings?.hero_line1, 'en') || 'LESS GLAMPING.'}
        </p>
        <p className="font-display text-2xl font-900 uppercase leading-tight text-accent">
          {t(settings?.hero_line2, 'en') || 'MORE GRAVEL.'}
        </p>
        <p className="mt-1 text-xs text-khaki">{t(settings?.hero_subtitle, 'en')}</p>
        {settings?.hero_location && (
          <p className="mt-2 text-[10px] font-600 uppercase tracking-widest text-khaki-deep">
            {settings.hero_location}
          </p>
        )}
      </div>

      <SaveBar pending={pending} message={state.message} ok={state.ok} />
    </form>
  )
}
