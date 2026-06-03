'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Check, Plus, X } from 'lucide-react'
import {
  defaultTokens,
  resolveTokens,
  BUILT_IN_PRESETS,
  type ThemeOverrides,
  type ThemeTokenKey,
  type ThemePreset,
} from '@/lib/theme/tokens'
import { applyTheme, savePreset, deletePreset } from './actions'

const TOKEN_META: Record<ThemeTokenKey, { label: string; type: 'color' | 'text' }> = {
  '--bone': { label: 'Bone', type: 'color' },
  '--khaki': { label: 'Khaki', type: 'color' },
  '--khaki-deep': { label: 'Khaki Deep', type: 'color' },
  '--olive': { label: 'Olive', type: 'color' },
  '--olive-2': { label: 'Olive 2', type: 'color' },
  '--ink': { label: 'Ink', type: 'color' },
  '--ink-soft': { label: 'Ink Soft', type: 'color' },
  '--accent': { label: 'Accent', type: 'color' },
  '--accent-soft': { label: 'Accent Soft', type: 'color' },
  '--line': { label: 'Border Line (rgba)', type: 'text' },
}

const SWATCH_KEYS: ThemeTokenKey[] = ['--accent', '--bone', '--olive', '--ink', '--khaki']

/** Derive only the overrides that differ from defaults */
function diffFromDefaults(values: Record<ThemeTokenKey, string>): ThemeOverrides {
  const overrides: ThemeOverrides = {}
  for (const [k, v] of Object.entries(values) as [ThemeTokenKey, string][]) {
    if (v !== defaultTokens[k]) {
      overrides[k] = v
    }
  }
  return overrides
}

function PresetSwatches({ overrides }: { overrides: ThemeOverrides }) {
  const resolved = resolveTokens(overrides)
  return (
    <div className="flex gap-1">
      {SWATCH_KEYS.map((k) => (
        <div
          key={k}
          className="h-4 w-4 rounded-full border border-white/10"
          style={{ backgroundColor: resolved[k] }}
          title={k}
        />
      ))}
    </div>
  )
}

interface PresetCardProps {
  preset: ThemePreset
  isActive: boolean
  isCustom?: boolean
  onLoad: (overrides: ThemeOverrides) => void
  onDelete?: (id: string) => void
  deleting?: boolean
}

function PresetCard({ preset, isActive, isCustom, onLoad, onDelete, deleting }: PresetCardProps) {
  return (
    <div
      className={`relative flex flex-col gap-2 rounded-lg border p-3 transition-colors ${
        isActive ? 'border-accent bg-ink' : 'border-line bg-ink-soft hover:border-accent/50'
      }`}
    >
      {isActive && (
        <div className="absolute right-2 top-2 rounded-full bg-accent p-0.5">
          <Check size={10} className="text-bone" />
        </div>
      )}
      <PresetSwatches overrides={preset.overrides} />
      <p className="text-xs font-700 uppercase tracking-wide text-bone">{preset.name}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onLoad(preset.overrides)}
          className="flex-1 rounded border border-line px-2 py-1 text-[10px] font-700 uppercase tracking-widest text-khaki transition-colors hover:border-accent hover:text-bone"
        >
          Load
        </button>
        {isCustom && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(preset.id)}
            disabled={deleting}
            className="rounded border border-line p-1 text-khaki-deep transition-colors hover:border-red-500 hover:text-red-400"
            aria-label={`Delete ${preset.name}`}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

export function ThemeEditor({
  activeTheme,
  customPresets,
}: {
  activeTheme: ThemeOverrides
  customPresets: ThemePreset[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // Current editor values (merged defaults + active theme)
  const [values, setValues] = useState<Record<ThemeTokenKey, string>>(
    resolveTokens(activeTheme),
  )

  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [presetName, setPresetName] = useState('')
  const presetNameRef = useRef<HTMLInputElement>(null)

  function applyTokensToDOM(resolved: Record<ThemeTokenKey, string>) {
    for (const [k, v] of Object.entries(resolved) as [ThemeTokenKey, string][]) {
      document.documentElement.style.setProperty(k, v)
    }
  }

  function loadPreset(overrides: ThemeOverrides) {
    const resolved = resolveTokens(overrides)
    applyTokensToDOM(resolved)
    setValues(resolved)
    setMessage(null)
  }

  function handleTokenChange(key: ThemeTokenKey, value: string) {
    document.documentElement.style.setProperty(key, value)
    setValues((prev) => ({ ...prev, [key]: value }))
    setMessage(null)
  }

  function handleApply() {
    startTransition(async () => {
      const overrides = diffFromDefaults(values)
      const result = await applyTheme(overrides)
      setMessage({ text: result.message, ok: result.ok })
    })
  }

  function handleSavePreset() {
    if (!presetName.trim()) return
    startTransition(async () => {
      const overrides = diffFromDefaults(values)
      const result = await savePreset(presetName.trim(), overrides)
      setMessage({ text: result.message, ok: result.ok })
      if (result.ok) {
        setPresetName('')
        setShowSaveInput(false)
        router.refresh()
      }
    })
  }

  function handleDeletePreset(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      const result = await deletePreset(id)
      setDeletingId(null)
      if (result.ok) router.refresh()
      else setMessage({ text: result.message, ok: false })
    })
  }

  function handleReset() {
    const resolved = resolveTokens({})
    applyTokensToDOM(resolved)
    setValues(resolved)
    setMessage(null)
  }

  // Detect which built-in preset (if any) matches current values
  const activeBuiltInId = BUILT_IN_PRESETS.find((p) => {
    const resolved = resolveTokens(p.overrides)
    return SWATCH_KEYS.every((k) => resolved[k] === values[k])
  })?.id ?? null

  const activeCustomId = customPresets.find((p) => {
    const resolved = resolveTokens(p.overrides)
    return SWATCH_KEYS.every((k) => resolved[k] === values[k])
  })?.id ?? null

  return (
    <div className="max-w-3xl space-y-10">

      {/* ── Built-in presets ── */}
      <div>
        <p className="mb-3 text-xs font-700 uppercase tracking-widest text-khaki-deep">
          Built-in Presets
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {BUILT_IN_PRESETS.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isActive={activeBuiltInId === preset.id}
              onLoad={loadPreset}
            />
          ))}
        </div>
      </div>

      {/* ── Custom / saved presets ── */}
      <div>
        <div className="mb-3 flex items-center gap-3">
          <p className="text-xs font-700 uppercase tracking-widest text-khaki-deep">
            Saved Presets
          </p>
          {!showSaveInput && (
            <button
              type="button"
              onClick={() => {
                setShowSaveInput(true)
                setTimeout(() => presetNameRef.current?.focus(), 50)
              }}
              className="flex items-center gap-1 rounded border border-line px-2 py-1 text-[10px] font-700 uppercase tracking-widest text-khaki transition-colors hover:border-accent hover:text-bone"
            >
              <Plus size={10} />
              Save Current
            </button>
          )}
        </div>

        {/* Save-as-preset inline input */}
        {showSaveInput && (
          <div className="mb-4 flex items-center gap-2">
            <input
              ref={presetNameRef}
              type="text"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSavePreset()
                if (e.key === 'Escape') { setShowSaveInput(false); setPresetName('') }
              }}
              placeholder="Preset name…"
              className="w-48 rounded border border-line bg-ink px-3 py-1.5 text-xs text-bone focus:border-accent focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSavePreset}
              disabled={!presetName.trim() || isPending}
              className="rounded border border-accent bg-accent px-3 py-1.5 text-[10px] font-700 uppercase tracking-widest text-bone disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => { setShowSaveInput(false); setPresetName('') }}
              className="text-khaki-deep hover:text-bone"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {customPresets.length === 0 ? (
          <p className="text-xs text-khaki-deep italic">
            No saved presets yet — customise the colours below and hit &ldquo;Save Current&rdquo;.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {customPresets.map((preset) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isActive={activeCustomId === preset.id}
                isCustom
                onLoad={loadPreset}
                onDelete={handleDeletePreset}
                deleting={deletingId === preset.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Colour editors ── */}
      <div>
        <p className="mb-3 text-xs font-700 uppercase tracking-widest text-khaki-deep">
          Edit Colours
        </p>
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
                        onChange={(e) => handleTokenChange(key, e.target.value)}
                        className="h-9 w-9 cursor-pointer rounded border border-line bg-ink p-0.5"
                        title={key}
                      />
                      <input
                        type="text"
                        value={values[key]}
                        onChange={(e) => handleTokenChange(key, e.target.value)}
                        className="flex-1 rounded border border-line bg-ink px-3 py-2 font-mono text-xs text-bone focus:border-accent focus:outline-none"
                      />
                    </>
                  ) : (
                    <input
                      type="text"
                      value={values[key]}
                      onChange={(e) => handleTokenChange(key, e.target.value)}
                      className="flex-1 rounded border border-line bg-ink px-3 py-2 font-mono text-xs text-bone focus:border-accent focus:outline-none"
                      placeholder={defaultTokens[key]}
                    />
                  )}
                </div>
                <p className="font-mono text-[10px] text-khaki-deep">{key}</p>
              </div>
            ),
          )}
        </div>
      </div>

      {/* ── Action bar ── */}
      <div className="sticky bottom-4 flex items-center gap-4 rounded-lg border border-line bg-ink-soft px-4 py-3">
        <button
          type="button"
          onClick={handleApply}
          disabled={isPending}
          className="rounded border border-accent bg-accent px-5 py-2.5 text-xs font-700 uppercase tracking-widest text-bone transition-colors hover:bg-accent-soft disabled:opacity-60"
        >
          {isPending ? 'Applying…' : 'Apply to Site'}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={isPending}
          className="text-xs text-khaki-deep transition-colors hover:text-bone"
        >
          Reset to Default
        </button>
        {message && (
          <p className={`ml-auto text-xs ${message.ok ? 'text-green-400' : 'text-red-400'}`}>
            {message.text}
          </p>
        )}
      </div>
    </div>
  )
}
