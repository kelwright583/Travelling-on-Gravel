'use client'

import { cn } from '@/lib/utils'

interface LocalizedInputProps {
  nameEn: string
  nameDe?: string // kept for backwards-compat form submission; field is hidden
  defaultEn?: string
  defaultDe?: string // unused in UI
  label: string
  multiline?: boolean
  rows?: number
  placeholder?: string
  required?: boolean
}

const inputClass =
  'w-full rounded border border-line bg-ink px-3 py-2 text-sm text-bone placeholder:text-khaki-deep focus:border-accent focus:outline-none'

export function LocalizedInput({
  nameEn,
  nameDe,
  defaultEn = '',
  label,
  multiline = false,
  rows = 3,
  placeholder,
  required,
}: LocalizedInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-700 uppercase tracking-widest text-khaki-deep">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </label>

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

      {/* Hidden DE field — keeps existing form actions working without code changes */}
      {nameDe && <input type="hidden" name={nameDe} value="" />}
    </div>
  )
}
