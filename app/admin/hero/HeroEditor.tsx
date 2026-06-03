'use client'

import { useActionState, useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { X, Eye } from 'lucide-react'
import { FormField } from '@/components/admin/FormField'
import { SaveBar } from '@/components/admin/SaveBar'
import { AiButton } from '@/components/admin/AiButton'
import { WritingAssistant } from '@/components/admin/WritingAssistant'
import { Dropzone } from '@/components/admin/Dropzone'
import { MediaLibrary } from '@/components/admin/MediaLibrary'
import { saveHero, type HeroState } from './actions'
import type { Tables } from '@/db/types'

type Settings = Tables<'site_settings'>

const initial: HeroState = { message: '', ok: false }

const inputClass =
  'w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none'

// ── Colour types ───────────────────────────────────────────────────────────────

export type HeroColors = {
  eyebrow: string
  line1: string
  line2: string
  subtitle: string
  overlay: number  // 0-100 darkening strength
}

const DEFAULT_COLORS: HeroColors = {
  eyebrow: '#D75E2C',
  line1: '#EFEAD9',
  line2: '#D75E2C',
  subtitle: '#B9A77B',
  overlay: 40,
}

function parseColors(raw: unknown): HeroColors {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return DEFAULT_COLORS
  const r = raw as Record<string, unknown>
  return {
    eyebrow: typeof r.eyebrow === 'string' ? r.eyebrow : DEFAULT_COLORS.eyebrow,
    line1: typeof r.line1 === 'string' ? r.line1 : DEFAULT_COLORS.line1,
    line2: typeof r.line2 === 'string' ? r.line2 : DEFAULT_COLORS.line2,
    subtitle: typeof r.subtitle === 'string' ? r.subtitle : DEFAULT_COLORS.subtitle,
    overlay: typeof r.overlay === 'number' ? r.overlay : DEFAULT_COLORS.overlay,
  }
}

// ── Colour picker ──────────────────────────────────────────────────────────────

const PALETTE = [
  { label: 'Bone', hex: '#EFEAD9' },
  { label: 'Khaki', hex: '#B9A77B' },
  { label: 'Khaki deep', hex: '#8E7C50' },
  { label: 'Accent', hex: '#D75E2C' },
  { label: 'Accent soft', hex: '#E8814F' },
  { label: 'Olive', hex: '#3B4329' },
  { label: 'White', hex: '#FFFFFF' },
  { label: 'Black', hex: '#000000' },
]

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 flex-shrink-0 rounded-full border border-line/60 shadow"
          style={{ backgroundColor: value }}
        />
        <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">{label}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {PALETTE.map(({ label: pl, hex }) => (
          <button
            key={hex}
            type="button"
            title={pl}
            onClick={() => onChange(hex)}
            className={`h-5 w-5 rounded-full border-2 transition-all hover:scale-110 ${
              value.toLowerCase() === hex.toLowerCase()
                ? 'border-bone scale-110 shadow-md'
                : 'border-transparent hover:border-bone/40'
            }`}
            style={{ backgroundColor: hex }}
          />
        ))}
        <div className="flex items-center gap-1.5 ml-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-[5.5rem] rounded border border-line bg-ink px-2 py-0.5 font-mono text-[11px] text-bone focus:border-accent focus:outline-none"
            placeholder="#EFEAD9"
            maxLength={7}
          />
        </div>
      </div>
    </div>
  )
}

function locStr(v: unknown): string {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return ''
  return String((v as Record<string, unknown>)['en'] ?? '')
}

function applyTagline(suggestion: string) {
  const parts = suggestion.split(/[,.\n]/).map((s) => s.trim()).filter(Boolean)
  const l1 = document.querySelector<HTMLInputElement>('input[name="hero_line1_en"]')
  const l2 = document.querySelector<HTMLInputElement>('input[name="hero_line2_en"]')
  if (l1) l1.value = parts[0] ?? suggestion
  if (l2 && parts[1]) l2.value = parts[1]
}

// ── Hero image picker ─────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const MIN_W = 1920
const MIN_H = 1080

function assetUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/media/${path}`
}

interface Asset {
  id: string
  storage_path: string
  width: number | null
  height: number | null
  created_at: string | null
}

interface SelectedImage {
  path: string
  width: number | null
  height: number | null
}

function HeroImagePicker({
  defaultValue,
  onChange,
}: {
  defaultValue?: string | null
  onChange: (path: string | null) => void
}) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<SelectedImage | null>(
    defaultValue ? { path: defaultValue, width: null, height: null } : null,
  )
  const [assets, setAssets] = useState<Asset[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)
  const fetchedRef = useRef(false)

  // Load assets when modal opens
  useEffect(() => {
    if (!open || fetchedRef.current) return
    fetchedRef.current = true
    setLoadingAssets(true)
    fetch('/api/media/assets')
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { assets: Asset[] } | null) => {
        if (data) setAssets(data.assets)
        setLoadingAssets(false)
      })
      .catch(() => setLoadingAssets(false))
  }, [open])

  // Backfill dimensions for default value once assets are loaded
  useEffect(() => {
    if (!selected || selected.width !== null) return
    const found = assets.find((a) => a.storage_path === selected.path)
    if (found) setSelected({ path: found.storage_path, width: found.width, height: found.height })
  }, [assets, selected])

  async function refreshAssets() {
    fetchedRef.current = false
    setLoadingAssets(true)
    try {
      const res = await fetch('/api/media/assets')
      if (res.ok) {
        const data = (await res.json()) as { assets: Asset[] }
        setAssets(data.assets)
      }
    } finally {
      setLoadingAssets(false)
    }
  }

  function handleLibrarySelect(storagePath: string) {
    const asset = assets.find((a) => a.storage_path === storagePath)
    const sel: SelectedImage = {
      path: storagePath,
      width: asset?.width ?? null,
      height: asset?.height ?? null,
    }
    setSelected(sel)
    onChange(storagePath)
    setOpen(false)
  }

  function handleUploaded(storagePath: string) {
    // Dimensions come through after asset list refresh
    setSelected({ path: storagePath, width: null, height: null })
    onChange(storagePath)
    refreshAssets()
  }

  const isLowRes =
    selected?.width != null &&
    selected?.height != null &&
    (selected.width < MIN_W || selected.height < MIN_H)

  return (
    <>
      {/* Hidden form field */}
      <input type="hidden" name="hero_image" value={selected?.path ?? ''} />

      <div className="space-y-3">
        <span className="text-xs font-700 uppercase tracking-widest text-khaki-deep">
          Hero Background Image
        </span>

        {/* 16:9 preview */}
        <div
          className="relative w-full overflow-hidden rounded-lg border border-line bg-ink-soft"
          style={{ aspectRatio: '16 / 9' }}
        >
          {selected ? (
            <>
              <Image
                src={assetUrl(selected.path)}
                alt="Hero background preview"
                fill
                sizes="(max-width: 640px) 100vw, 672px"
                className="object-cover grayscale"
              />
              {/* Duotone overlay */}
              <div
                className="absolute inset-0 mix-blend-color"
                style={{ backgroundColor: 'var(--olive)' }}
              />
              {/* Topo layer */}
              <div className="topo-bg absolute inset-0 opacity-20" />
              {/* Bottom gradient scrim */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, var(--ink) 0%, color-mix(in srgb, var(--ink) 60%, transparent) 40%, transparent 70%)',
                }}
              />
              <p className="absolute bottom-2 left-3 text-[10px] font-600 uppercase tracking-widest text-khaki-deep">
                Preview with hero overlays applied
              </p>
              {selected.width && selected.height && (
                <p className="absolute bottom-2 right-3 font-mono text-[10px] text-khaki-deep">
                  {selected.width} × {selected.height}px
                </p>
              )}
            </>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
              <p className="text-xs text-khaki-deep">No background image set</p>
              <p className="text-[10px] text-khaki-deep/60">Hero will show a plain dark background</p>
            </div>
          )}
        </div>

        {/* Resolution warning */}
        {isLowRes && (
          <div className="flex items-start gap-2 rounded border border-amber-500/30 bg-amber-500/10 px-3 py-2">
            <span className="mt-px shrink-0 text-amber-400">⚠</span>
            <p className="text-xs text-amber-300">
              This image is only {selected!.width} × {selected!.height}px — below the{' '}
              {MIN_W} × {MIN_H}px minimum. It may look soft on large screens.
            </p>
          </div>
        )}

        {/* Resolution guidance */}
        <p className="text-[10px] text-khaki-deep">
          Recommended: 2560 × 1440px (16:9 landscape) · Minimum: 1920 × 1080px · JPG or WebP
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded border border-accent px-3 py-1.5 text-xs font-700 uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-bone"
          >
            {selected ? 'Change image' : 'Select image'}
          </button>
          {selected && (
            <button
              type="button"
              onClick={() => { setSelected(null); onChange(null) }}
              className="text-xs text-khaki-deep transition-colors hover:text-red-400"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-line bg-ink-soft">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h2 className="font-display text-sm font-700 uppercase tracking-widest text-bone">
                  Hero Background Image
                </h2>
                <p className="mt-0.5 text-[10px] text-khaki-deep">
                  Recommended: 2560 × 1440px · Minimum: 1920 × 1080px · 16:9 landscape
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-khaki-deep transition-colors hover:text-bone"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <Dropzone
                onUploaded={handleUploaded}
                hint="Recommended: 2560 × 1440px (16:9) · Minimum: 1920 × 1080px"
                warnBelow={{ width: MIN_W, height: MIN_H }}
              />
              {loadingAssets ? (
                <p className="text-center text-xs text-khaki-deep">Loading…</p>
              ) : (
                <MediaLibrary
                  assets={assets}
                  onRefresh={refreshAssets}
                  selectable
                  selected={selected?.path}
                  onSelect={handleLibrarySelect}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Preview modal ──────────────────────────────────────────────────────────────

type PreviewData = {
  line1: string
  line2: string
  subtitle: string
  location: string
  coords: string
  heroImage: string | null
  colors: HeroColors
}

function HeroPreviewModal({ data, onClose }: { data: PreviewData; onClose: () => void }) {
  const imgSrc = data.heroImage ? assetUrl(data.heroImage) : '/hero-default.jpg'

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded border border-line bg-ink/80 px-3 py-2 text-xs font-600 uppercase tracking-widest text-bone backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
      >
        <X size={13} strokeWidth={2} />
        Close preview
      </button>

      {/* Hero */}
      <section className="grain relative flex min-h-full flex-col overflow-hidden bg-ink">
        {/* Background */}
        <div className="absolute inset-0 scale-110" aria-hidden="true">
          <Image
            src={imgSrc}
            alt=""
            fill
            sizes="100vw"
            className="object-cover grayscale"
          />
          <div className="absolute inset-0 mix-blend-color" style={{ backgroundColor: 'var(--olive)' }} />
          <div className="topo-bg absolute inset-0 opacity-30" />
          <div className="hazard absolute left-0 right-0 top-0" />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, var(--ink) 0%, color-mix(in srgb, var(--ink) 80%, transparent) 25%, transparent 60%)' }}
          />
        </div>

        {/* Configurable darkening overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: '#15150F', opacity: (data.colors.overlay / 100) * 0.75 }}
        />

        {/* Content */}
        <div className="relative z-10 mt-auto px-6 pb-16 md:px-12 lg:px-20">
          <div className="max-w-[800px]">
            {(data.location || data.coords) && (
              <p className="mb-5 text-xs font-600 uppercase tracking-[0.3em]" style={{ color: data.colors.eyebrow }}>
                {data.location}
                {data.coords && <span className="ml-4 opacity-60">{data.coords}</span>}
              </p>
            )}
            <h1 className="font-display mb-6 text-[clamp(3rem,9vw,7.5rem)] font-900 uppercase leading-[0.9] tracking-tight">
              {data.line1 && <span className="block" style={{ color: data.colors.line1 }}>{data.line1}</span>}
              {data.line2 && <span className="block" style={{ color: data.colors.line2 }}>{data.line2}</span>}
            </h1>
            {data.subtitle && (
              <p className="max-w-lg text-sm leading-relaxed" style={{ color: data.colors.subtitle }}>{data.subtitle}</p>
            )}
          </div>
        </div>

        {/* Coords badge */}
        {data.coords && (
          <div className="absolute bottom-8 right-6 hidden md:block" aria-hidden="true">
            <p className="font-mono text-[10px] tracking-widest text-khaki-deep">{data.coords}</p>
          </div>
        )}
      </section>
    </div>
  )
}

// ── Editor ─────────────────────────────────────────────────────────────────────

export function HeroEditor({ settings }: { settings: Settings | null }) {
  const [state, formAction, pending] = useActionState(saveHero, initial)
  const [taglines, setTaglines] = useState<string[]>([])
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [heroImage, setHeroImage] = useState<string | null>(settings?.hero_image ?? null)
  const [colors, setColors] = useState<HeroColors>(() => parseColors(settings?.hero_colors))

  function setColor(key: keyof Omit<HeroColors, 'overlay'>, value: string) {
    setColors((c) => ({ ...c, [key]: value }))
  }

  function openPreview() {
    const get = (selector: string) =>
      document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)?.value?.trim() ?? ''

    setPreview({
      line1:     get('input[name="hero_line1_en"]'),
      line2:     get('input[name="hero_line2_en"]'),
      subtitle:  get('textarea[name="hero_subtitle_en"]'),
      location:  get('input[name="hero_location"]'),
      coords:    get('input[name="hero_coords"]'),
      heroImage,
      colors,
    })
  }

  return (
    <>
      {preview && <HeroPreviewModal data={preview} onClose={() => setPreview(null)} />}

      <form action={formAction} className="space-y-6 max-w-2xl">
        {/* Hidden DE fields — kept for form action compatibility */}
        <input type="hidden" name="hero_line1_de" value="" />
        <input type="hidden" name="hero_line2_de" value="" />
        <input type="hidden" name="hero_subtitle_de" value="" />
        {/* Serialised colours */}
        <input type="hidden" name="hero_colors_json" value={JSON.stringify(colors)} />

        <HeroImagePicker
          defaultValue={settings?.hero_image}
          onChange={setHeroImage}
        />

        <div className="space-y-2">
          <FormField label="Headline Line 1">
            <input
              type="text"
              name="hero_line1_en"
              defaultValue={locStr(settings?.hero_line1)}
              placeholder="LESS GLAMPING."
              required
              className={inputClass}
            />
          </FormField>

          <div className="flex items-center gap-2">
            <AiButton
              endpoint="/api/ai/tagline"
              payload={{ locale: 'en' }}
              onResult={(r) => setTaglines((r.taglines as string[]) ?? [])}
              label="Generate taglines"
            />
            {taglines.length > 0 && (
              <button
                type="button"
                onClick={() => setTaglines([])}
                className="text-[11px] text-khaki-deep hover:text-bone"
              >
                Clear
              </button>
            )}
          </div>

          {taglines.length > 0 && (
            <div className="rounded border border-line bg-ink p-3 space-y-1.5">
              <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep mb-2">
                Click to apply:
              </p>
              {taglines.map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyTagline(suggestion)}
                  className="block w-full rounded px-2 py-1.5 text-left text-sm text-bone hover:bg-accent/10 hover:text-accent transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <FormField label="Headline Line 2">
          <input
            type="text"
            name="hero_line2_en"
            defaultValue={locStr(settings?.hero_line2)}
            placeholder="MORE GRAVEL."
            className={inputClass}
          />
        </FormField>

        <div className="space-y-2">
          <FormField label="Subtitle" hint="Shown below the headline">
            <textarea
              name="hero_subtitle_en"
              defaultValue={locStr(settings?.hero_subtitle)}
              placeholder="Honest dispatches from the tracks less taken across Africa."
              rows={2}
              className={`${inputClass} resize-y`}
            />
          </FormField>
          <WritingAssistant
            getText={() =>
              document.querySelector<HTMLTextAreaElement>('textarea[name="hero_subtitle_en"]')?.value ?? ''
            }
            onApply={(text) => {
              const el = document.querySelector<HTMLTextAreaElement>('textarea[name="hero_subtitle_en"]')
              if (el) el.value = text
            }}
            fieldLabel="the subtitle"
          />
        </div>

        <FormField label="Eyebrow text" hint="Small line above the headline — place name, mood, or short tagline. Shown in accent colour.">
          <input
            type="text"
            name="hero_location"
            defaultValue={settings?.hero_location ?? ''}
            placeholder="KAOKOLAND, NAMIBIA"
            className={inputClass}
          />
        </FormField>

        <FormField label="Coordinates badge" hint="Optional — appears as a small decorative detail bottom-right of the hero. Leave blank to hide it.">
          <input
            type="text"
            name="hero_coords"
            defaultValue={settings?.hero_coords ?? ''}
            placeholder="18.2358° S, 13.1897° E"
            className={inputClass}
          />
        </FormField>

        {/* ── Text colours ── */}
        <div className="space-y-4 rounded-lg border border-line bg-ink p-5">
          <div>
            <p className="text-xs font-700 uppercase tracking-widest text-bone">Text colours</p>
            <p className="mt-0.5 text-[10px] text-khaki-deep">
              Choose from the brand palette or enter any hex value
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <ColorPicker
              label="Eyebrow text"
              value={colors.eyebrow}
              onChange={(v) => setColor('eyebrow', v)}
            />
            <ColorPicker
              label="Headline line 1"
              value={colors.line1}
              onChange={(v) => setColor('line1', v)}
            />
            <ColorPicker
              label="Headline line 2"
              value={colors.line2}
              onChange={(v) => setColor('line2', v)}
            />
            <ColorPicker
              label="Subtitle"
              value={colors.subtitle}
              onChange={(v) => setColor('subtitle', v)}
            />
          </div>

          {/* Live preview strip */}
          <div
            className="rounded border border-line/40 px-4 py-3"
            style={{ backgroundColor: '#15150F' }}
          >
            <p className="mb-0.5 text-[10px] font-600 uppercase tracking-[0.25em]" style={{ color: colors.eyebrow }}>
              Eyebrow text
            </p>
            <p className="font-display text-2xl font-900 uppercase leading-tight tracking-tight" style={{ color: colors.line1 }}>
              Headline line 1
            </p>
            <p className="font-display text-2xl font-900 uppercase leading-tight tracking-tight" style={{ color: colors.line2 }}>
              Headline line 2
            </p>
            <p className="mt-1 text-xs leading-relaxed" style={{ color: colors.subtitle }}>
              Subtitle text preview
            </p>
          </div>
        </div>

        {/* ── Image overlay strength ── */}
        <div className="space-y-3 rounded-lg border border-line bg-ink p-5">
          <div>
            <p className="text-xs font-700 uppercase tracking-widest text-bone">
              Image overlay strength
            </p>
            <p className="mt-0.5 text-[10px] text-khaki-deep">
              Controls how much the background image is darkened — higher makes text more legible
            </p>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={100}
              value={colors.overlay}
              onChange={(e) => setColors((c) => ({ ...c, overlay: parseInt(e.target.value) }))}
              className="flex-1 accent-accent"
            />
            <span className="w-10 text-right font-mono text-sm text-bone">{colors.overlay}%</span>
          </div>
          <div className="flex justify-between text-[10px] text-khaki-deep">
            <span>Light (0%)</span>
            <span>Current: {colors.overlay}%</span>
            <span>Dark (100%)</span>
          </div>
        </div>

        {/* Preview + Save */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={openPreview}
            className="flex items-center gap-2 rounded border border-line px-4 py-2.5 text-xs font-700 uppercase tracking-widest text-khaki-deep transition-colors hover:border-bone hover:text-bone"
          >
            <Eye size={13} strokeWidth={2} />
            Preview
          </button>
          <SaveBar pending={pending} message={state.message} ok={state.ok} />
        </div>
      </form>
    </>
  )
}
