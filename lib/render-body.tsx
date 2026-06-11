import type { ReactNode } from 'react'

/**
 * Parse inline markdown within a single line of text.
 * Supports: **bold**, *italic*, ***bold italic***
 */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const regex = /\*\*\*(.+?)\*\*\*|\*\*(.+?)\*\*|\*(.+?)\*/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index))

    if (match[1]) {
      nodes.push(<strong key={match.index}><em>{match[1]}</em></strong>)
    } else if (match[2]) {
      nodes.push(<strong key={match.index}>{match[2]}</strong>)
    } else if (match[3]) {
      nodes.push(<em key={match.index}>{match[3]}</em>)
    }

    last = regex.lastIndex
  }

  if (last < text.length) nodes.push(text.slice(last))
  return nodes
}

/**
 * Render a plain-text body with lightweight markdown support.
 *
 * Supported syntax:
 *   # Heading 1    → large section heading
 *   ## Heading 2   → sub-section heading
 *   ### Heading 3  → smaller callout heading
 *   **bold**       → bold text
 *   *italic*       → italic text
 *   ***bold italic***
 *   blank line     → vertical spacer
 */
export function renderBody(text: string): ReactNode[] {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('### ')) {
      return (
        <h4 key={i} className="font-display mb-2 mt-5 text-base font-700 uppercase tracking-wide text-bone">
          {renderInline(line.slice(4))}
        </h4>
      )
    }
    if (line.startsWith('## ')) {
      return (
        <h3 key={i} className="font-display mb-3 mt-6 text-xl font-700 uppercase text-bone">
          {renderInline(line.slice(3))}
        </h3>
      )
    }
    if (line.startsWith('# ')) {
      return (
        <h2 key={i} className="font-display mb-4 mt-8 text-2xl font-800 uppercase text-bone">
          {renderInline(line.slice(2))}
        </h2>
      )
    }
    if (line.trim() === '') return <div key={i} className="h-4" />
    return <p key={i} className="mb-4">{renderInline(line)}</p>
  })
}
