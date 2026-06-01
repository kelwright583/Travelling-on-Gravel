import { cn } from '@/lib/utils'

interface SaveBarProps {
  pending: boolean
  message?: string
  ok?: boolean
  label?: string
}

export function SaveBar({ pending, message, ok, label = 'Save' }: SaveBarProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="submit"
        disabled={pending}
        className={cn(
          'rounded border px-5 py-2 text-xs font-700 uppercase tracking-widest transition-colors',
          pending
            ? 'border-line text-khaki-deep cursor-not-allowed'
            : 'border-accent text-accent hover:bg-accent hover:text-bone',
        )}
      >
        {pending ? 'Saving…' : label}
      </button>
      {message && (
        <p
          aria-live="polite"
          className={cn('text-xs', ok ? 'text-green-400' : 'text-red-400')}
        >
          {message}
        </p>
      )}
    </div>
  )
}
