'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface LocalizedInputProps {
  nameEn: string
  nameDe: string
  defaultEn?: string
  defaultDe?: string
  label: string
  multiline?: boolean
  rows?: number
  placeholder?: string
  required?: boolean
}

export function LocalizedInput({
  nameEn,
  nameDe,
  defaultEn = '',
  defaultDe = '',
  label,
  multiline = false,
  rows = 3,
  placeholder,
  required,
}: LocalizedInputProps) {
  const [locale, setLocale] = useState<'en' | 'de'>('en')

  const inputClass =
    'w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none'

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-700 uppercase tracking-widest text-khaki-deep">
          {label}
          {required && <span className="ml-1 text-accent">*</span>}
        </label>
        <div className="flex rounded border border-line text-[10px] font-700 uppercase tracking-widest overflow-hidden">
          {(['en', 'de'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocale(l)}
              className={cn(
                'px-2 py-1 transition-colors',
                locale === l ? 'bg-accent text-bone' : 'text-khaki-deep hover:text-bone',
              )}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* EN field — always mounted, hidden when DE tab active */}
      <div className={locale === 'en' ? '' : 'hidden'}>
        {multiline ? (
          <textarea
            name={nameEn}
            defaultValue={defaultEn}
            placeholder={placeholder}
            rows={rows}
            required={required}
            className={cn(inputClass, 'resize-y')}
          />
        ) : (
          <input
            type="text"
            name={nameEn}
            defaultValue={defaultEn}
            placeholder={placeholder}
            required={required}
            className={inputClass}
          />
        )}
      </div>

      {/* DE field — always mounted, hidden when EN tab active */}
      <div className={locale === 'de' ? '' : 'hidden'}>
        {multiline ? (
          <textarea
            name={nameDe}
            defaultValue={defaultDe}
            placeholder={`${placeholder ?? ''} (Deutsch)`}
            rows={rows}
            className={cn(inputClass, 'resize-y')}
          />
        ) : (
          <input
            type="text"
            name={nameDe}
            defaultValue={defaultDe}
            placeholder={`${placeholder ?? ''} (Deutsch)`}
            className={inputClass}
          />
        )}
      </div>
    </div>
  )
}
