'use client'

import { useState, useCallback, useTransition } from 'react'
import Link from 'next/link'
import { FormField } from '@/components/admin/FormField'
import { PostCoverPicker } from '@/components/admin/PostCoverPicker'
import { AiButton } from '@/components/admin/AiButton'
import { WritingAssistant } from '@/components/admin/WritingAssistant'
import { MarkdownBodyEditor } from '@/components/admin/MarkdownBodyEditor'
import {
  createRecipe,
  updateRecipe,
  deleteRecipe,
  saveAiNotes,
  type RecipeState,
  type RecipePayload,
} from './actions'
import {
  UNITS,
  COOK_METHODS,
  DIFFICULTIES,
  PRESET_TAGS,
  type IngredientGroup,
  type Ingredient,
  type Step,
  type AiNotes,
} from '@/lib/recipes/types'
import type { Tables } from '@/db/types'

type Recipe = Tables<'recipes'>

// --- small helpers ---

function nanoid() {
  return Math.random().toString(36).slice(2, 10)
}

function parseFraction(val: string): number | null {
  val = val.trim()
  if (!val) return null
  if (val.includes('/')) {
    const [n, d] = val.split('/')
    const result = Number(n) / Number(d)
    return isNaN(result) ? null : result
  }
  const n = Number(val)
  return isNaN(n) ? null : n
}

function formatQty(qty: number | null | undefined): string {
  if (qty == null) return ''
  if (qty < 1 && qty > 0) {
    const fracs: [number, string][] = [[0.25,'1/4'],[0.333,'1/3'],[0.5,'1/2'],[0.667,'2/3'],[0.75,'3/4']]
    for (const [val, str] of fracs) {
      if (Math.abs(qty - val) < 0.01) return str
    }
  }
  return String(qty)
}

function locStr(v: unknown, locale: 'en' | 'de' = 'en'): string {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return ''
  return String((v as Record<string,unknown>)[locale] ?? '')
}

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

// --- sub-components ---

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display mb-4 border-b border-line pb-2 text-xs font-700 uppercase tracking-widest text-accent">
      {children}
    </h2>
  )
}

function TextInput({ label, name, defaultValue, placeholder, required, hint }: {
  label: string; name: string; defaultValue?: string; placeholder?: string; required?: boolean; hint?: string
}) {
  return (
    <FormField label={label} hint={hint}>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        required={required}
        className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
      />
    </FormField>
  )
}

function TextareaInput({ label, name, defaultValue, placeholder, rows = 4 }: {
  label: string; name: string; defaultValue?: string; placeholder?: string; rows?: number
}) {
  return (
    <FormField label={label}>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
      />
    </FormField>
  )
}

// --- ingredients builder ---

function IngredientRow({
  item, groupId, onChange, onRemove, customUnits, onAddCustomUnit,
}: {
  item: Ingredient; groupId: string
  onChange: (groupId: string, id: string, field: string, value: unknown) => void
  onRemove: (groupId: string, id: string) => void
  customUnits: string[]
  onAddCustomUnit: (unit: string) => void
}) {
  const [unitValue, setUnitValue] = useState<string>(item.unit ?? '')
  const [showOther, setShowOther] = useState(false)
  const [otherText, setOtherText] = useState('')

  function handleSelectChange(val: string) {
    if (val === '__other__') {
      setShowOther(true)
      setOtherText('')
    } else {
      setUnitValue(val)
      onChange(groupId, item.id, 'unit', val || null)
    }
  }

  function commitOther() {
    const trimmed = otherText.trim()
    if (!trimmed) { setShowOther(false); return }
    onAddCustomUnit(trimmed)
    setUnitValue(trimmed)
    setShowOther(false)
    onChange(groupId, item.id, 'unit', trimmed)
  }

  return (
    <div className="grid grid-cols-[80px_120px_1fr_1fr_24px] gap-2 items-start">
      <input
        type="text"
        placeholder="Qty"
        defaultValue={formatQty(item.qty)}
        onBlur={(e) => onChange(groupId, item.id, 'qty', parseFraction(e.target.value))}
        className="rounded border border-line bg-ink px-2 py-1.5 text-xs text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
      />
      {showOther ? (
        <input
          type="text"
          placeholder="e.g. squeeze"
          value={otherText}
          onChange={(e) => setOtherText(e.target.value)}
          onBlur={commitOther}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitOther() } if (e.key === 'Escape') { setShowOther(false) } }}
          autoFocus
          className="rounded border border-accent bg-ink px-2 py-1.5 text-xs text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
        />
      ) : (
        <select
          value={unitValue}
          onChange={(e) => handleSelectChange(e.target.value)}
          className="rounded border border-line bg-ink px-2 py-1.5 text-xs text-bone focus:border-accent focus:outline-none"
        >
          <option value="">Unit</option>
          {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          {customUnits.map((u) => <option key={`c-${u}`} value={u}>{u}</option>)}
          <option value="__other__">Other…</option>
        </select>
      )}
      <input
        type="text"
        placeholder="Ingredient"
        defaultValue={item.item.en}
        onBlur={(e) => onChange(groupId, item.id, 'item.en', e.target.value)}
        className="rounded border border-line bg-ink px-2 py-1.5 text-xs text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
      />
      <input
        type="text"
        placeholder="Note (optional)"
        defaultValue={item.note?.en ?? ''}
        onBlur={(e) => onChange(groupId, item.id, 'note.en', e.target.value)}
        className="rounded border border-line bg-ink px-2 py-1.5 text-xs text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
      />
      <button
        type="button"
        onClick={() => onRemove(groupId, item.id)}
        className="mt-1.5 text-xs text-red-400 hover:text-red-300"
        aria-label="Remove ingredient"
      >
        ✕
      </button>
    </div>
  )
}

function IngredientsBuilder({
  groups, setGroups,
}: { groups: IngredientGroup[]; setGroups: (g: IngredientGroup[]) => void }) {
  const [customUnits, setCustomUnits] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try { return JSON.parse(localStorage.getItem('tog_custom_units') ?? '[]') } catch { return [] }
  })

  const handleAddCustomUnit = useCallback((unit: string) => {
    setCustomUnits((prev) => {
      if ([...UNITS as readonly string[], ...prev].includes(unit)) return prev
      const updated = [...prev, unit]
      localStorage.setItem('tog_custom_units', JSON.stringify(updated))
      return updated
    })
  }, [])

  const updateIngredient = useCallback((groupId: string, itemId: string, field: string, value: unknown) => {
    setGroups(groups.map((g) => {
      if (g.id !== groupId) return g
      return {
        ...g,
        items: g.items.map((item) => {
          if (item.id !== itemId) return item
          if (field === 'item.en') return { ...item, item: { ...item.item, en: value as string } }
          if (field === 'note.en') return { ...item, note: { en: value as string } }
          return { ...item, [field]: value }
        }),
      }
    }))
  }, [groups, setGroups])

  const removeIngredient = useCallback((groupId: string, itemId: string) => {
    setGroups(groups.map((g) => g.id !== groupId ? g : { ...g, items: g.items.filter((i) => i.id !== itemId) }))
  }, [groups, setGroups])

  const addIngredient = (groupId: string) => {
    setGroups(groups.map((g) => g.id !== groupId ? g : {
      ...g, items: [...g.items, { id: nanoid(), qty: null, unit: null, item: { en: '' } }],
    }))
  }

  const addGroup = () => {
    setGroups([...groups, { id: nanoid(), items: [{ id: nanoid(), qty: null, unit: null, item: { en: '' } }] }])
  }

  const removeGroup = (groupId: string) => {
    setGroups(groups.filter((g) => g.id !== groupId))
  }

  const updateGroupHeading = (groupId: string, heading: string) => {
    setGroups(groups.map((g) => g.id !== groupId ? g : { ...g, heading: { en: heading } }))
  }

  return (
    <div className="space-y-6">
      {groups.map((group, _gi) => (
        <div key={group.id} className="rounded-lg border border-line p-4">
          <div className="mb-3 flex items-center gap-2">
            <input
              type="text"
              placeholder={groups.length > 1 ? 'Group heading (e.g. For the marinade)' : 'Group heading (optional)'}
              defaultValue={group.heading?.en ?? ''}
              onBlur={(e) => updateGroupHeading(group.id, e.target.value)}
              className="flex-1 rounded border border-line bg-ink px-2 py-1.5 text-xs text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
            />
            {groups.length > 1 && (
              <button type="button" onClick={() => removeGroup(group.id)} className="text-xs text-red-400 hover:text-red-300">
                Remove group
              </button>
            )}
          </div>
          {/* Header row */}
          <div className="mb-1 grid grid-cols-[80px_120px_1fr_1fr_24px] gap-2 px-0">
            {['Qty','Unit','Ingredient','Note',''].map((h) => (
              <p key={h} className="text-[10px] font-600 uppercase tracking-widest text-khaki-deep">{h}</p>
            ))}
          </div>
          <div className="space-y-2">
            {group.items.map((item) => (
              <IngredientRow
                key={item.id}
                item={item}
                groupId={group.id}
                onChange={updateIngredient}
                onRemove={removeIngredient}
                customUnits={customUnits}
                onAddCustomUnit={handleAddCustomUnit}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => addIngredient(group.id)}
            className="mt-3 text-xs font-600 uppercase tracking-widest text-accent hover:text-accent-soft"
          >
            + Add ingredient
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addGroup}
        className="text-xs font-600 uppercase tracking-widest text-khaki-deep hover:text-bone"
      >
        + Add ingredient group
      </button>
    </div>
  )
}

// --- steps builder ---

function StepsBuilder({ steps, setSteps }: { steps: Step[]; setSteps: (s: Step[]) => void }) {
  const update = (id: string, field: string, value: unknown) => {
    setSteps(steps.map((s) => {
      if (s.id !== id) return s
      if (field === 'text.en') return { ...s, text: { ...s.text, en: value as string } }
      return { ...s, [field]: value }
    }))
  }

  const remove = (id: string) => setSteps(steps.filter((s) => s.id !== id))

  const add = () => setSteps([...steps, { id: nanoid(), text: { en: '' } }])

  return (
    <div className="space-y-4">
      {steps.map((step, i) => (
        <div key={step.id} className="flex gap-3">
          <span className="font-display mt-2 min-w-[28px] text-center text-lg font-700 text-accent">
            {i + 1}
          </span>
          <div className="flex-1 space-y-2">
            <textarea
              placeholder={`Step ${i + 1} instructions…`}
              defaultValue={step.text.en}
              rows={3}
              onBlur={(e) => update(step.id, 'text.en', e.target.value)}
              className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
            />
            <div className="flex items-center gap-3">
              <input
                type="number"
                placeholder="Timer (min)"
                defaultValue={step.minutes ?? ''}
                min={0}
                onChange={(e) => update(step.id, 'minutes', e.target.value ? Number(e.target.value) : null)}
                className="w-28 rounded border border-line bg-ink px-2 py-1.5 text-xs text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
              />
              <span className="text-xs text-khaki-deep">min (optional)</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => remove(step.id)}
            className="mt-2 text-xs text-red-400 hover:text-red-300"
            aria-label="Remove step"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="text-xs font-600 uppercase tracking-widest text-accent hover:text-accent-soft"
      >
        + Add step
      </button>
    </div>
  )
}

// --- simple list builder (tips / equipment) ---

function ListBuilder({
  items, setItems, placeholder,
}: { items: string[]; setItems: (i: string[]) => void; placeholder: string }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            defaultValue={item}
            placeholder={placeholder}
            onBlur={(e) => {
              const next = [...items]
              next[i] = e.target.value
              setItems(next)
            }}
            className="flex-1 rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setItems(items.filter((_, j) => j !== i))}
            className="text-xs text-red-400 hover:text-red-300"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setItems([...items, ''])}
        className="text-xs font-600 uppercase tracking-widest text-accent hover:text-accent-soft"
      >
        + Add
      </button>
    </div>
  )
}

// --- tags ---

function TagsBuilder({ tags, setTags }: { tags: string[]; setTags: (t: string[]) => void }) {
  const [custom, setCustom] = useState('')
  const toggle = (tag: string) => {
    setTags(tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag])
  }
  const addCustom = () => {
    const t = custom.trim()
    if (t && !tags.includes(t)) setTags([...tags, t])
    setCustom('')
  }
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {PRESET_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`rounded-full border px-3 py-1 text-xs font-600 transition-colors ${
              tags.includes(tag)
                ? 'border-accent bg-accent text-bone'
                : 'border-line text-khaki-deep hover:border-accent/60 hover:text-bone'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
          placeholder="Custom tag…"
          className="flex-1 rounded border border-line bg-ink px-3 py-1.5 text-xs text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={addCustom}
          className="rounded border border-accent px-3 py-1.5 text-xs font-600 text-accent hover:bg-accent hover:text-bone"
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 rounded-full bg-ink-soft px-3 py-1 text-xs text-bone">
              {tag}
              <button type="button" onClick={() => toggle(tag)} className="text-khaki-deep hover:text-red-400">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// --- AI review panel ---

function AiReviewPanel({
  recipeId, getPayload,
}: { recipeId?: string; getPayload: () => RecipePayload }) {
  const [aiNotes, setAiNotes] = useState<AiNotes | null>(null)
  const [pending, startTransition] = useTransition()

  const run = () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/ai/recipe-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(getPayload()),
        })
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json() as AiNotes
        setAiNotes(data)
        if (recipeId && data) {
          await saveAiNotes(recipeId, data)
        }
      } catch (e) {
        console.error(e)
      }
    })
  }

  return (
    <div className="rounded-lg border border-line p-4">
      <p className="mb-3 text-xs text-khaki-deep">
        AI reviews cooking logic, food safety, and brand voice. Advisory only — never blocks publishing.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={run}
        className="rounded border border-accent px-4 py-2 text-xs font-700 uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-bone disabled:opacity-50"
      >
        {pending ? 'Reviewing…' : 'Run AI Review'}
      </button>

      {aiNotes && (
        <div className="mt-4 space-y-3 text-xs">
          {aiNotes.summary && (
            <div className="rounded bg-ink p-3">
              <p className="mb-1 font-700 uppercase tracking-widest text-khaki-deep">Summary</p>
              <p className="text-bone">{aiNotes.summary}</p>
            </div>
          )}
          {aiNotes.warnings && aiNotes.warnings.length > 0 && (
            <div className="rounded bg-ink p-3">
              <p className="mb-2 font-700 uppercase tracking-widest text-red-400">Warnings</p>
              <ul className="space-y-1 text-khaki">
                {aiNotes.warnings.map((w, i) => <li key={i}>⚠ {w}</li>)}
              </ul>
            </div>
          )}
          {aiNotes.suggestions && aiNotes.suggestions.length > 0 && (
            <div className="rounded bg-ink p-3">
              <p className="mb-2 font-700 uppercase tracking-widest text-accent">Suggestions</p>
              <ul className="space-y-1 text-khaki">
                {aiNotes.suggestions.map((s, i) => <li key={i}>→ {s}</li>)}
              </ul>
            </div>
          )}
          {aiNotes.missing && aiNotes.missing.length > 0 && (
            <div className="rounded bg-ink p-3">
              <p className="mb-2 font-700 uppercase tracking-widest text-khaki-deep">Missing</p>
              <ul className="space-y-1 text-khaki">
                {aiNotes.missing.map((m, i) => <li key={i}>• {m}</li>)}
              </ul>
            </div>
          )}
          {aiNotes.voice && (
            <div className="rounded bg-ink p-3">
              <p className="mb-1 font-700 uppercase tracking-widest text-khaki-deep">Voice Note</p>
              <p className="text-khaki">{aiNotes.voice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// --- main editor ---

const initial: RecipeState = { message: '', ok: false }

export function RecipeEditor({ recipe }: { recipe?: Recipe }) {
  const [ingredients, setIngredients] = useState<IngredientGroup[]>(
    Array.isArray(recipe?.ingredients) && recipe.ingredients.length > 0
      ? (recipe.ingredients as unknown as IngredientGroup[])
      : [{ id: nanoid(), items: [{ id: nanoid(), qty: null, unit: null, item: { en: '' } }] }],
  )
  const [steps, setSteps] = useState<Step[]>(
    Array.isArray(recipe?.steps) && recipe.steps.length > 0
      ? (recipe.steps as unknown as Step[])
      : [{ id: nanoid(), text: { en: '' } }],
  )
  const [tips, setTips] = useState<string[]>(
    Array.isArray(recipe?.tips) ? (recipe.tips as { en: string }[]).map((t) => t.en) : [],
  )
  const [equipment, setEquipment] = useState<string[]>(
    Array.isArray(recipe?.equipment) ? (recipe.equipment as { en: string }[]).map((e) => e.en) : [],
  )
  const [tags, setTags] = useState<string[]>(recipe?.tags ?? [])
  const [slug, setSlug] = useState(recipe?.slug ?? '')
  const [titleEn, setTitleEn] = useState(locStr(recipe?.title))
  const [state, setState] = useState<RecipeState>(initial)
  const [saving, startSave] = useTransition()

  const buildPayload = useCallback((): RecipePayload => {
    const form = document.querySelector<HTMLFormElement>('#recipe-form')
    const get = (name: string) =>
      (form?.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`[name="${name}"]`)?.value ?? '').trim()

    return {
      title_en: get('title_en') || titleEn,
      subtitle_en: get('subtitle_en') || undefined,
      intro_en: get('intro_en') || undefined,
      slug: get('slug') || slug,
      cover_image: (get('cover_image') || recipe?.cover_image) ?? null,
      prep_minutes: get('prep_minutes') ? Number(get('prep_minutes')) : null,
      cook_minutes: get('cook_minutes') ? Number(get('cook_minutes')) : null,
      servings: get('servings') ? Number(get('servings')) : null,
      difficulty: get('difficulty') || 'medium',
      cook_method: get('cook_method') || 'fire',
      ingredients,
      steps,
      tips: tips.filter(Boolean).map((t) => ({ en: t })),
      equipment: equipment.filter(Boolean).map((e) => ({ en: e })),
      tags,
      published: (form?.querySelector<HTMLInputElement>('[name="published"]')?.checked) ?? false,
      cover_overlay: (form?.querySelector<HTMLInputElement>('[name="cover_overlay"]')?.checked) ?? false,
      published_at: get('published_at') || null,
    }
  }, [ingredients, steps, tips, equipment, tags, recipe?.cover_image, slug, titleEn])

  const handleSave = () => {
    startSave(async () => {
      const payload = buildPayload()
      const action = recipe ? updateRecipe.bind(null, recipe.id) : createRecipe
      const result = await action(state, payload)
      setState(result)
    })
  }

  return (
    <div className="max-w-4xl">
      {/* Back / delete */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/cast-iron" className="text-xs font-600 uppercase tracking-widest text-khaki-deep hover:text-bone transition-colors">
          ← All Recipes
        </Link>
        {recipe && (
          <form
            action={deleteRecipe.bind(null, recipe.id)}
            onSubmit={(e) => { if (!confirm('Delete this recipe permanently?')) e.preventDefault() }}
          >
            <button type="submit" className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
          </form>
        )}
      </div>

      <div id="recipe-form" className="space-y-10">

        {/* ── THE DISH ── */}
        <section>
          <SectionHeading>The Dish</SectionHeading>
          <div className="space-y-4">
            <FormField label="Title" hint="The dish name">
              <input
                type="text"
                name="title_en"
                defaultValue={locStr(recipe?.title)}
                placeholder="Potjie No. 3"
                required
                onChange={(e) => {
                  setTitleEn(e.target.value)
                  if (!recipe) setSlug(slugify(e.target.value))
                }}
                className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
              />
            </FormField>
            <TextInput label="Subtitle" name="subtitle_en" defaultValue={locStr(recipe?.subtitle)} placeholder="Short tagline — the hook" />
            <FormField label="Slug" hint="Auto-filled. URL-safe, lowercase, hyphens.">
              <input
                type="text"
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                pattern="[a-z0-9-]+"
                className="w-full rounded border border-line bg-ink px-3 py-2 font-mono text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
              />
            </FormField>
            <PostCoverPicker name="cover_image" defaultValue={recipe?.cover_image} label="Cover Photo" />
            <div className="space-y-2">
              <MarkdownBodyEditor
                label="Intro / Story"
                name="intro_en"
                defaultValue={locStr(recipe?.intro)}
                placeholder="The story behind the dish — where you made it, why it matters."
                rows={6}
              />
              <WritingAssistant
                getText={() => (document.querySelector<HTMLTextAreaElement>('[name="intro_en"]')?.value ?? '')}
                onApply={(text) => {
                  const el = document.querySelector<HTMLTextAreaElement>('[name="intro_en"]')
                  if (el) el.value = text
                }}
                fieldLabel="the intro"
              />
            </div>
          </div>
        </section>

        {/* ── AT A GLANCE ── */}
        <section>
          <SectionHeading>At a Glance</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label="Prep time (min)">
              <input
                type="number"
                name="prep_minutes"
                defaultValue={recipe?.prep_minutes ?? ''}
                min={0}
                placeholder="20"
                className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
              />
            </FormField>
            <FormField label="Cook time (min)">
              <input
                type="number"
                name="cook_minutes"
                defaultValue={recipe?.cook_minutes ?? ''}
                min={0}
                placeholder="90"
                className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
              />
            </FormField>
            <FormField label="Servings">
              <input
                type="number"
                name="servings"
                defaultValue={recipe?.servings ?? ''}
                min={1}
                placeholder="4"
                className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
              />
            </FormField>
            <FormField label="Difficulty">
              <select
                name="difficulty"
                defaultValue={recipe?.difficulty ?? 'medium'}
                className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone focus:border-accent focus:outline-none"
              >
                {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </FormField>
            <FormField label="Cook method">
              <select
                name="cook_method"
                defaultValue={recipe?.cook_method ?? 'fire'}
                className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone focus:border-accent focus:outline-none"
              >
                {COOK_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </FormField>
          </div>
        </section>

        {/* ── INGREDIENTS ── */}
        <section>
          <SectionHeading>Ingredients</SectionHeading>
          <IngredientsBuilder groups={ingredients} setGroups={setIngredients} />
        </section>

        {/* ── METHOD ── */}
        <section>
          <SectionHeading>Method</SectionHeading>
          <StepsBuilder steps={steps} setSteps={setSteps} />
        </section>

        {/* ── TIPS & EQUIPMENT ── */}
        <section>
          <SectionHeading>Tips &amp; Equipment</SectionHeading>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-600 uppercase tracking-widest text-khaki-deep">Tips</p>
              <ListBuilder items={tips} setItems={setTips} placeholder="Tip or note…" />
            </div>
            <div>
              <p className="mb-3 text-xs font-600 uppercase tracking-widest text-khaki-deep">Equipment</p>
              <ListBuilder items={equipment} setItems={setEquipment} placeholder="e.g. Cast iron pot, 10L" />
            </div>
          </div>
        </section>

        {/* ── TAGS ── */}
        <section>
          <SectionHeading>Tags</SectionHeading>
          <TagsBuilder tags={tags} setTags={setTags} />
        </section>

        {/* ── AI REVIEW ── */}
        <section>
          <SectionHeading>AI Review</SectionHeading>
          <AiReviewPanel recipeId={recipe?.id} getPayload={buildPayload} />
        </section>

        {/* ── PUBLISH ── */}
        <section>
          <SectionHeading>Publish</SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Published date">
              <input
                type="date"
                name="published_at"
                defaultValue={recipe?.published_at?.slice(0, 10) ?? ''}
                className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone focus:border-accent focus:outline-none"
              />
            </FormField>
            <FormField label="Status">
              <div className="flex flex-col gap-2 pt-5">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="published"
                    defaultChecked={recipe?.published ?? false}
                    className="h-4 w-4 rounded border-line accent-accent"
                  />
                  <span className="text-sm text-bone">Published</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    name="cover_overlay"
                    defaultChecked={recipe?.cover_overlay ?? false}
                    className="h-4 w-4 rounded border-line accent-accent"
                  />
                  <span className="text-sm text-bone">Card image overlay</span>
                </label>
              </div>
            </FormField>
          </div>
          <div className="mt-6">
            <AiButton
              endpoint="/api/ai/alt-text"
              payload={() => ({ image: recipe?.cover_image ?? null, context: titleEn })}
              onResult={() => {}}
              label="Generate alt text for cover"
            />
          </div>
        </section>

        {/* Save bar */}
        <div className="sticky bottom-0 border-t border-line bg-ink py-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="rounded border border-accent bg-accent px-6 py-2.5 text-xs font-700 uppercase tracking-widest text-bone transition-colors hover:bg-accent-soft disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Recipe'}
            </button>
            {state.message && (
              <p className={`text-xs ${state.ok ? 'text-olive-2' : 'text-red-400'}`}>
                {state.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
