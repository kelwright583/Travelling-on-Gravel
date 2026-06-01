'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { LocalizedInput } from '@/components/admin/LocalizedInput'
import { FormField } from '@/components/admin/FormField'
import { SaveBar } from '@/components/admin/SaveBar'
import { createPost, updatePost, deletePost, type PostState } from './actions'
import type { Tables } from '@/db/types'

type Post = Tables<'posts'>

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

const initial: PostState = { message: '', ok: false }

export function PostEditor({ post }: { post?: Post }) {
  const saveAction = post ? updatePost.bind(null, post.id) : createPost
  const [state, formAction, pending] = useActionState(saveAction, initial)
  const deleteAction = post ? deletePost.bind(null, post.id) : null

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/admin/dispatches"
          className="text-xs font-600 uppercase tracking-widest text-khaki-deep hover:text-bone transition-colors"
        >
          ← All Dispatches
        </Link>
        {deleteAction && (
          <form
            action={deleteAction}
            onSubmit={(e) => {
              if (!confirm('Delete this dispatch permanently?')) e.preventDefault()
            }}
          >
            <button
              type="submit"
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
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
          defaultEn={locStr(post?.title)}
          defaultDe={locStr(post?.title, 'de')}
          placeholder="Dispatch title"
          required
        />

        <FormField
          label="Slug"
          hint="URL-safe, lowercase, hyphens only. Auto-filled from title on blur."
        >
          <input
            type="text"
            name="slug"
            defaultValue={post?.slug ?? ''}
            placeholder="my-dispatch-slug"
            pattern="[a-z0-9-]+"
            required
            className="w-full rounded border border-line bg-ink px-3 py-2 font-mono text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none"
            onBlur={(e) => {
              if (e.target.value) return
              const titleInput = e.target.form?.querySelector<HTMLInputElement>(
                'input[name="title_en"]',
              )
              if (titleInput?.value) e.target.value = slugify(titleInput.value)
            }}
          />
        </FormField>

        <LocalizedInput
          label="Excerpt"
          nameEn="excerpt_en"
          nameDe="excerpt_de"
          defaultEn={locStr(post?.excerpt)}
          defaultDe={locStr(post?.excerpt, 'de')}
          placeholder="Short teaser shown on the listing page…"
          multiline
          rows={3}
        />

        <LocalizedInput
          label="Body (Markdown)"
          nameEn="body_en"
          nameDe="body_de"
          defaultEn={locStr(post?.body)}
          defaultDe={locStr(post?.body, 'de')}
          placeholder="Full post content in Markdown…"
          multiline
          rows={16}
        />

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
            <label className="flex cursor-pointer items-center gap-3 pt-5">
              <input
                type="checkbox"
                name="published"
                defaultChecked={post?.published ?? false}
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
