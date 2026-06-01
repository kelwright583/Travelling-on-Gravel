'use client'

import { useRef, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'

interface NewsletterFormProps {
  source?: 'hero' | 'footer' | 'inline'
  compact?: boolean
}

export function NewsletterForm({ source = 'inline', compact = false }: NewsletterFormProps) {
  const t = useTranslations('newsletter')
  const locale = useLocale()

  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  // Honeypot — bots fill this; humans don't
  const honeypotRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (honeypotRef.current?.value) return // Silently reject bots

    setState('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, locale }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.message ?? t('errorGeneric'))
        setState('error')
      } else {
        setState('success')
      }
    } catch {
      setErrorMsg(t('errorGeneric'))
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="text-center">
        <p className="mb-1 text-sm font-700 text-bone">Check your inbox</p>
        <p className="text-xs text-khaki">
          A confirmation link is on its way to <strong className="text-bone">{email}</strong>.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Newsletter signup">
      {/* Honeypot — visually hidden from real users */}
      <input
        ref={honeypotRef}
        type="text"
        name="website"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute opacity-0 pointer-events-none"
        autoComplete="off"
      />

      {!compact && (
        <p className="mb-1 text-[10px] font-600 uppercase tracking-widest text-khaki-deep">
          No algorithms. No sponsored fluff.
        </p>
      )}

      <div className={compact ? 'flex gap-2' : 'flex flex-col gap-3 sm:flex-row'}>
        <label htmlFor={`email-${source}`} className="sr-only">
          Email address
        </label>
        <input
          id={`email-${source}`}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('placeholder')}
          disabled={state === 'loading'}
          className="flex-1 rounded border border-line bg-ink px-4 py-2.5 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="rounded border border-accent bg-accent px-6 py-2.5 text-xs font-700 uppercase tracking-widest text-bone transition-colors hover:bg-accent-soft disabled:opacity-50"
        >
          {state === 'loading' ? t('submitting') : t('submit')}
        </button>
      </div>

      {state === 'error' && (
        <p className="mt-2 text-xs text-red-400" role="alert">
          {errorMsg}
        </p>
      )}
    </form>
  )
}
