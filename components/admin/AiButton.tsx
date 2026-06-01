'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'

interface AiButtonProps {
  /** API route path, e.g. '/api/ai/translate' */
  endpoint: string
  /** Body to POST to the endpoint — or a function called at click time to build it */
  payload: Record<string, unknown> | (() => Record<string, unknown>)
  /** Called with the successful result object */
  onResult: (result: Record<string, unknown>) => void
  label?: string
  className?: string
}

/**
 * Generic AI assist trigger button.
 * Posts to an /api/ai/* endpoint and surfaces the result via onResult.
 */
export function AiButton({ endpoint, payload, onResult, label = 'AI', className }: AiButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleClick() {
    setLoading(true)
    setError('')
    try {
      const body = typeof payload === 'function' ? payload() : payload
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = (await res.json()) as Record<string, unknown>
      if (!res.ok) {
        setError((data.message as string) ?? 'AI request failed.')
      } else {
        onResult(data)
      }
    } catch {
      setError('Network error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={[
          'inline-flex items-center gap-1.5 rounded border border-accent/50 px-2.5 py-1 text-[11px] font-600 uppercase tracking-widest text-accent transition-colors hover:bg-accent/10 disabled:opacity-50',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label={`Generate with AI: ${label}`}
      >
        <Sparkles size={12} aria-hidden="true" />
        {loading ? 'Generating…' : label}
      </button>
      {error && <span className="text-[11px] text-red-400">{error}</span>}
    </span>
  )
}
