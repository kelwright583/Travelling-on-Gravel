interface FormFieldProps {
  label: string
  htmlFor?: string
  hint?: string
  children: React.ReactNode
}

export function FormField({ label, htmlFor, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-xs font-700 uppercase tracking-widest text-khaki-deep"
      >
        {label}
      </label>
      {children}
      {hint && <p className="text-[10px] text-khaki-deep">{hint}</p>}
    </div>
  )
}
