'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { LocalizedInput } from '@/components/admin/LocalizedInput'
import { FormField } from '@/components/admin/FormField'
import { SaveBar } from '@/components/admin/SaveBar'
import { PostCoverPicker } from '@/components/admin/PostCoverPicker'
import { AiButton } from '@/components/admin/AiButton'
import { WritingAssistant } from '@/components/admin/WritingAssistant'
import { createPost, updatePost, deletePost, type PostState } from './actions'
import type { Tables } from '@/db/types'

type Post = Tables<'posts'>

const PRESET_TAGS = [
  'Planning',
  'On the road',
  'Campsite',
  'Gear & kit',
  'Must haves',
  'Insights',
  'Lessons learnt',
  'Unsolicited rants',
  'Wildlife',
  'People & culture',
  'Border crossings',
  'Vehicle & recovery',
  'Water & fuel',
  'Photography',
  'Africa offbeat',
]

function TagsBuilder({ tags, setTags }: { tags: string[]; setTags: (t: string[]) => void }) {
  const [custom, setCustom] = useState('')

  function toggle(tag: string) {
    setTags(tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag])
  }

  function addCustom() {
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
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-ink-soft px-3 py-1 text-xs text-bone"
            >
              {tag}
              <button
                type="button"
                onClick={() => toggle(tag)}
                className="text-khaki-deep hover:text-red-400"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function locStr(v: unknown): string {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return ''
  return String((v as Record<string, unknown>)['en'] ?? '')
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function getField(name: string) {
  return document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)?.value ?? ''
}

function setField(name: string, value: string) {
  const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${name}"]`)
  if (el) el.value = value
}

const initial: PostState = { message: '', ok: false }

export function PostEditor({ post }: { post?: Post }) {
  const saveAction = post ? updatePost.bind(null, post.id) : createPost
  const [state, formAction, pending] = useActionState(saveAction, initial)
  const deleteAction = post ? deletePost.bind(null, post.id) : null
  const [tags, setTags] = useState<string[]>(post?.tags ?? [])
  const [slug, setSlug] = useState(post?.slug ?? '')

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/field-work"
          className="text-xs font-600 uppercase tracking-widest text-khaki-deep hover:text-bone transition-colors"
        >
          ← All Field Work
        </Link>
        {deleteAction && (
          <form
            action={deleteAction}
            onSubmit={(e) => {
              if (!confirm('Delete this post permanently?')) e.preventDefault()
            }}
          >
            <button type="submit" className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Delete
            </button>
          </form>
        )}
      </div>

      <form action={formAction} className="space-y-6">
        {/* Serialised tags — read by action */}
        <input type="hidden" name="tags_json" value={JSON.stringify(tags)} />
        <LocalizedInput
          label="Title"
          nameEn="title_en"
          nameDe="title_de"
          defaultEn={locStr(post?.title)}
          placeholder="Post title"
          required
          onChange={(val) => { if (!post) setSlug(slugify(val)) }}
        />

        <FormField label="Slug" hint="Auto-generated from title. Edit only if you need a custom URL.">
          <input
            type="text"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated-from-title"
            pattern="[a-z0-9-]+"
            required
            className="w-full rounded border border-line bg-ink px-3 py-2 font-mono text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
          />
        </FormField>

        <PostCoverPicker name="cover_image" defaultValue={post?.cover_image} label="Cover Photo" />

        <div className="space-y-2">
          <LocalizedInput
            label="Excerpt"
            nameEn="excerpt_en"
            nameDe="excerpt_de"
            defaultEn={locStr(post?.excerpt)}
            placeholder="Short teaser shown on the listing page…"
            multiline
            rows={3}
          />
          <AiButton
            endpoint="/api/ai/summarize"
            payload={() => ({ content: getField('body_en'), locale: 'en' })}
            onResult={(r) => setField('excerpt_en', (r.excerpt as string) ?? '')}
            label="Auto-summarise from body"
          />
        </div>

        <div className="space-y-2">
          <LocalizedInput
            label="Body (Markdown)"
            nameEn="body_en"
            nameDe="body_de"
            defaultEn={locStr(post?.body)}
            placeholder="Full post content in Markdown…"
            multiline
            rows={16}
          />
          <WritingAssistant
            getText={() => getField('body_en')}
            onApply={(text) => setField('body_en', text)}
            fieldLabel="the body"
          />
        </div>

        <FormField label="Tags" hint="Categorise this post — select presets or add your own">
          <TagsBuilder tags={tags} setTags={setTags} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Published date">
            <input
              type="date"
              name="published_at"
              defaultValue={post?.published_at?.slice(0, 10) ?? ''}
              className="w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone focus:border-accent focus:outline-none"
            />
          </FormField>
          <FormField label="Status">
            <div className="flex flex-col gap-2 pt-5">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="published"
                  defaultChecked={post?.published ?? false}
                  className="h-4 w-4 rounded border-line accent-accent"
                />
                <span className="text-sm text-bone">Published</span>
              </label>
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  name="cover_overlay"
                  defaultChecked={post?.cover_overlay ?? true}
                  className="h-4 w-4 rounded border-line accent-accent"
                />
                <span className="text-sm text-bone">Card image overlay</span>
              </label>
            </div>
          </FormField>
        </div>

        <SaveBar pending={pending} message={state.message} ok={state.ok} />
      </form>
    </div>
  )
}
