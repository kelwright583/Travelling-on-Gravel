'use client'

import { useActionState, useState } from 'react'
import { SaveBar } from '@/components/admin/SaveBar'
import { saveTheme, resetTheme, type ThemeState } from './actions'
import {
  defaultTokens,
  themePresets,
  type ThemeOverrides,
  type ThemeTokenKey,
} from '@/lib/theme/tokens'

const initial: ThemeState = { message: '', ok: false }

const TOKEN_META: Record<ThemeTokenKey, { label: string; type: 'color' | 'text' }> = {
  '--bone': { label: 'Bone (primary text)', type: 'color' },
  '--khaki': { label: 'Khaki (secondary text)', type: 'color' },
  '--khaki-deep': { label: 'Khaki Deep (muted)', type: 'color' },
  '--olive': { label: 'Olive (brand green)', type: 'color' },
  '--olive-2': { label: 'Olive 2 (surfaces)', type: 'color' },
  '--ink': { label: 'Ink (background)', type: 'color' },
  '--ink-soft': { label: 'Ink Soft (cards)', type: 'color' },
  '--accent': { label: 'Accent (CTAs, pins)', type: 'color' },
  '--accent-soft': { label: 'Accent Soft (hover)', type: 'color' },
  '--line': { label: 'Line (borders)', type: 'text' },
}

export function ThemeEditor({ savedTheme }: { savedTheme: ThemeOverrides }) {
  const merged = { ...defaultTokens, ...savedTheme }
  const [values, setValues] = useState<Record<ThemeTokenKey, string>>(
    Object.fromEntries(
      Object.keys(defaultTokens).map((k) => [k, merged[k as ThemeTokenKey] ?? '']),
    ) as Record<ThemeTokenKey, string>,
  )

  const [saveState, formAction, saving] = useActionState(saveTheme, initial)
  const [resetState, resetAction, resetting] = useActionState(resetTheme, initial)

  function applyValue(key: ThemeTokenKey, value: string) {
    document.documentElement.style.setProperty(key, value)
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  function applyPreset(preset: ThemeOverrides) {
    const base = { ...defaultTokens }
    const next = { ...base, ...preset } as Record<ThemeTokenKey, string>
    for (const [k, v] of Object.entries(next)) {
      document.documentElement.style.setProperty(k, v)
    }
    setValues(next)
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Preset buttons */}
      <div>
        <p className="mb-3 text-xs font-700 uppercase tracking-widest text-khaki-deep">
          Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(themePresets).map(([name, preset]) => (
            <button
              key={name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="rounded border border-line px-4 py-2 text-xs font-700 uppercase tracking-widest text-khaki hover:border-accent hover:text-bone transition-colors capitalize"
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* Colour pickers */}
      <form action={formAction} className="space-y-4">
        {/* Hidden inputs to submit all current values */}
        {(Object.keys(defaultTokens) as ThemeTokenKey[]).map((key) => (
          <input key={key} type="hidden" name={key} value={values[key]} />
        ))}

        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.entries(TOKEN_META) as [ThemeTokenKey, { label: string; type: 'color' | 'text' }][]).map(
            ([key, meta]) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-xs font-700 uppercase tracking-widest text-khaki-deep">
                  {meta.label}
                </label>
                <div className="flex items-center gap-3">
                  {meta.type === 'color' ? (
                    <>
                      <input
                        type="color"
                        value={values[key]}
                        onChange={(e) => applyValue(key, e.target.value)}
                        className="h-9 w-9 cursor-pointer rounded border border-line bg-ink p-0.5"
                        title={key}
                      />
                      <input
                        type="text"
                        value={values[key]}
                        onChange={(e) => applyValue(key, e.target.value)}
                        className="flex-1 rounded border border-line bg-ink px-3 py-2 font-mono text-xs text-bone focus:border-accent focus:outline-none"
                      />
                    </>
                  ) : (
                    <input
                      type="text"
                      value={values[key]}
                      onChange={(e) => applyValue(key, e.target.value)}
                      className="flex-1 rounded border border-line bg-ink px-3 py-2 font-mono text-xs text-bone focus:border-accent focus:outline-none"
                      placeholder={defaultTokens[key]}
                    />
                  )}
                  <div
                    className="h-9 w-9 flex-shrink-0 rounded border border-line"
                    style={{ backgroundColor: values[key] }}
                    aria-hidden="true"
                  />
                </div>
                <p className="font-mono text-[10px] text-khaki-deep">{key}</p>
              </div>
            ),
          )}
        </div>

        <SaveBar pending={saving} message={saveState.message} ok={saveState.ok} label="Save Theme" />
      </form>

      {/* Reset form */}
      <form action={resetAction}>
        <button
          type="submit"
          disabled={resetting}
          className="text-xs text-khaki-deep hover:text-red-400 transition-colors"
        >
          {resetting ? 'Resetting…' : 'Reset to defaults'}
        </button>
        {resetState.message && (
          <p className={`mt-1 text-xs ${resetState.ok ? 'text-green-400' : 'text-red-400'}`}>
            {resetState.message}
          </p>
        )}
      </form>
    </div>
  )
}
