'use client'

import { useState, useTransition } from 'react'
import { Sparkles, Wand2, ChevronDown, ChevronUp, Check } from 'lucide-react'

interface Suggestion {
  label: string
  text: string
}

interface WritingAssistantProps {
  /** Function that returns the current text of the field to polish */
  getText: () => string
  /** Called when user applies a suggestion */
  onApply: (text: string) => void
  /** Label shown on the polish button */
  fieldLabel?: string
}

export function WritingAssistant({ getText, onApply, fieldLabel = 'this field' }: WritingAssistantProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'polish' | 'brainstorm'>('polish')
  const [brainstormPrompt, setBrainstormPrompt] = useState('')
  const [issues, setIssues] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [error, setError] = useState('')
  const [applied, setApplied] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  function reset() {
    setIssues([])
    setSuggestions([])
    setError('')
    setApplied(null)
  }

  function runPolish() {
    const text = getText()
    if (!text.trim()) { setError('Nothing to polish — write something first.'); return }
    reset()
    startTransition(async () => {
      try {
        const res = await fetch('/api/ai/write-assist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, mode: 'polish' }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Request failed')
        setIssues(data.issues ?? [])
        setSuggestions(data.suggestions ?? [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong')
      }
    })
  }

  function runBrainstorm() {
    if (!brainstormPrompt.trim()) { setError('Describe what you want to say first.'); return }
    reset()
    startTransition(async () => {
      try {
        const res = await fetch('/api/ai/write-assist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: getText(), prompt: brainstormPrompt, mode: 'brainstorm' }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Request failed')
        setSuggestions(data.suggestions ?? [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Something went wrong')
      }
    })
  }

  function applySuggestion(i: number) {
    onApply(suggestions[i].text)
    setApplied(i)
  }

  return (
    <div className="rounded border border-line bg-ink">
      {/* Toggle header */}
      <button
        type="button"
        onClick={() => { setOpen((o) => !o); reset() }}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-xs font-700 uppercase tracking-widest text-khaki-deep transition-colors hover:text-bone"
      >
        <Sparkles size={13} className="text-accent" />
        AI Writing Assistant
        {open ? <ChevronUp size={13} className="ml-auto" /> : <ChevronDown size={13} className="ml-auto" />}
      </button>

      {open && (
        <div className="border-t border-line px-4 pb-4 pt-3 space-y-4">
          {/* Mode tabs */}
          <div className="flex gap-1 rounded border border-line p-0.5 text-[10px] font-700 uppercase tracking-widest">
            <button
              type="button"
              onClick={() => { setMode('polish'); reset() }}
              className={`flex-1 rounded py-1.5 transition-colors ${mode === 'polish' ? 'bg-accent text-bone' : 'text-khaki-deep hover:text-bone'}`}
            >
              Polish / Fix
            </button>
            <button
              type="button"
              onClick={() => { setMode('brainstorm'); reset() }}
              className={`flex-1 rounded py-1.5 transition-colors ${mode === 'brainstorm' ? 'bg-accent text-bone' : 'text-khaki-deep hover:text-bone'}`}
            >
              Stuck? Describe it
            </button>
          </div>

          {mode === 'polish' && (
            <div className="space-y-3">
              <p className="text-xs text-khaki-deep">
                Check spelling, grammar, and tone for {fieldLabel}. Get rewrite suggestions in the brand voice.
              </p>
              <button
                type="button"
                onClick={runPolish}
                disabled={isPending}
                className="flex items-center gap-2 rounded border border-accent px-3 py-1.5 text-xs font-700 uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-bone disabled:opacity-50"
              >
                <Wand2 size={12} />
                {isPending ? 'Reviewing…' : 'Polish this'}
              </button>
            </div>
          )}

          {mode === 'brainstorm' && (
            <div className="space-y-3">
              <p className="text-xs text-khaki-deep">
                Describe what you're trying to say. The AI will offer 3 ways to write it in the brand voice.
              </p>
              <textarea
                value={brainstormPrompt}
                onChange={(e) => setBrainstormPrompt(e.target.value)}
                placeholder="e.g. I want to describe the feeling of arriving at a campsite after a long corrugated road and the silence that hits you when you turn the engine off…"
                rows={3}
                className="w-full rounded border border-line bg-ink-soft px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none resize-y"
              />
              <button
                type="button"
                onClick={runBrainstorm}
                disabled={isPending}
                className="flex items-center gap-2 rounded border border-accent px-3 py-1.5 text-xs font-700 uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-bone disabled:opacity-50"
              >
                <Sparkles size={12} />
                {isPending ? 'Thinking…' : 'Get suggestions'}
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          {/* Issues (polish mode) */}
          {issues.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Issues found</p>
              <ul className="space-y-1">
                {issues.map((issue, i) => (
                  <li key={i} className="flex gap-2 text-xs text-khaki">
                    <span className="text-accent mt-0.5">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">
                {mode === 'polish' ? 'Rewrite options' : 'Options — click to apply'}
              </p>
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  className={`rounded border p-3 transition-colors ${applied === i ? 'border-accent bg-accent/10' : 'border-line hover:border-accent/50'}`}
                >
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">{s.label}</span>
                    <button
                      type="button"
                      onClick={() => applySuggestion(i)}
                      className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-700 uppercase tracking-widest transition-colors ${applied === i ? 'bg-accent text-bone' : 'border border-line text-khaki-deep hover:border-accent hover:text-bone'}`}
                    >
                      {applied === i ? <><Check size={10} /> Applied</> : 'Apply'}
                    </button>
                  </div>
                  <p className="text-xs leading-relaxed text-bone">{s.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
