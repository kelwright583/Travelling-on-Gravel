'use client'

import { useRef, useCallback } from 'react'

interface Props {
  name: string
  defaultValue?: string
  rows?: number
  placeholder?: string
  label?: string
  onGetText?: () => void // unused — kept for API compat
}

interface WrapTool {
  kind: 'wrap'
  label: string
  title: string
  prefix: string
  suffix: string
  cls?: string
}
interface LineTool {
  kind: 'line'
  label: string
  title: string
  prefix: string
  cls?: string
}
interface Divider {
  kind: 'divider'
}

type Tool = WrapTool | LineTool | Divider

const TOOLS: Tool[] = [
  { kind: 'wrap', label: 'B',  title: 'Bold',          prefix: '**', suffix: '**', cls: 'font-bold' },
  { kind: 'wrap', label: 'I',  title: 'Italic',        prefix: '*',  suffix: '*',  cls: 'italic' },
  { kind: 'wrap', label: 'S',  title: 'Strikethrough', prefix: '~~', suffix: '~~', cls: 'line-through' },
  { kind: 'divider' },
  { kind: 'line', label: 'H1', title: 'Heading 1 — large section title',    prefix: '# ' },
  { kind: 'line', label: 'H2', title: 'Heading 2 — subheading',             prefix: '## ' },
  { kind: 'line', label: 'H3', title: 'Heading 3 — small callout heading',  prefix: '### ' },
]

export function MarkdownBodyEditor({ name, defaultValue = '', rows = 16, placeholder, label }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const applyWrap = useCallback((prefix: string, suffix: string) => {
    const el = ref.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e, value } = el
    const selected = value.slice(s, e)
    const insert = selected ? `${prefix}${selected}${suffix}` : `${prefix}${suffix}`
    el.value = value.slice(0, s) + insert + value.slice(e)
    el.focus()
    const cursor = selected ? s + insert.length : s + prefix.length
    el.setSelectionRange(selected ? s + prefix.length : cursor, selected ? s + prefix.length + selected.length : cursor)
  }, [])

  const applyLine = useCallback((prefix: string) => {
    const el = ref.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e, value } = el
    const lineStart = value.lastIndexOf('\n', s - 1) + 1
    // Toggle: remove prefix if already present, otherwise add it
    const lineText = value.slice(lineStart)
    if (lineText.startsWith(prefix)) {
      el.value = value.slice(0, lineStart) + value.slice(lineStart + prefix.length)
      el.setSelectionRange(Math.max(lineStart, s - prefix.length), Math.max(lineStart, e - prefix.length))
    } else {
      el.value = value.slice(0, lineStart) + prefix + value.slice(lineStart)
      el.setSelectionRange(s + prefix.length, e + prefix.length)
    }
    el.focus()
  }, [])

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span className="text-xs font-700 uppercase tracking-widest text-khaki-deep">{label}</span>
      )}
      <div className="flex flex-col overflow-hidden rounded border border-line">
        {/* ── Toolbar ── */}
        <div className="flex items-center gap-0.5 border-b border-line bg-ink-soft px-2 py-1.5">
          {TOOLS.map((tool, i) => {
            if (tool.kind === 'divider') {
              return <div key={i} className="mx-1.5 h-4 w-px bg-line" />
            }
            return (
              <button
                key={i}
                type="button"
                title={tool.title}
                onClick={() =>
                  tool.kind === 'wrap'
                    ? applyWrap(tool.prefix, tool.suffix)
                    : applyLine(tool.prefix)
                }
                className={`rounded px-2.5 py-1 text-xs text-khaki transition-colors hover:bg-ink hover:text-bone active:bg-accent/10 ${tool.cls ?? ''}`}
              >
                {tool.label}
              </button>
            )
          })}
          <span className="ml-auto text-[10px] text-khaki-deep/50">Markdown</span>
        </div>

        {/* ── Textarea ── */}
        <textarea
          ref={ref}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={rows}
          className="w-full resize-y bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:outline-none"
        />
      </div>
    </div>
  )
}
