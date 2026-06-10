'use client'

import { useEffect, useState } from 'react'

interface Props {
  departureDate: string // ISO date string YYYY-MM-DD
}

function flavourText(days: number): string {
  if (days > 100) return 'Still plenty of time to overthink the packing list.'
  if (days > 30)  return 'The planning is in full swing.'
  if (days > 14)  return 'Getting real now. Gear is coming out of storage.'
  if (days > 7)   return 'Single digits on the horizon. The bakkie is getting restless.'
  if (days > 1)   return `${days} sleeps. The pre-trip nerves are setting in.`
  if (days === 1) return 'Tomorrow. Tanks full. Nothing left to do but leave.'
  return "Today's the day. Keys are in the ignition."
}

function pad(n: number) { return String(n).padStart(2, '0') }

export function AdventureCountdown({ departureDate }: Props) {
  const target = new Date(departureDate + 'T00:00:00').getTime()

  const [diff, setDiff] = useState(() => target - Date.now())

  useEffect(() => {
    const id = setInterval(() => setDiff(target - Date.now()), 1000)
    return () => clearInterval(id)
  }, [target])

  if (diff <= 0) {
    return (
      <div className="py-6 text-center">
        <p className="font-display text-xs font-700 uppercase tracking-widest text-accent">Departure day</p>
        <p className="mt-2 text-sm text-khaki">Keys are in the ignition.</p>
      </div>
    )
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days    = Math.floor(totalSeconds / 86400)
  const hours   = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return (
    <div className="py-8">
      <p className="mb-6 text-center text-[10px] font-700 uppercase tracking-[0.25em] text-accent">
        Departure in
      </p>

      <div className="flex items-end justify-center gap-3 sm:gap-6">
        {[
          { value: days,    label: days === 1 ? 'day' : 'days' },
          { value: hours,   label: hours === 1 ? 'hr' : 'hrs' },
          { value: minutes, label: 'min' },
          { value: seconds, label: 'sec' },
        ].map(({ value, label }, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="flex h-16 w-14 items-center justify-center rounded border border-accent/30 bg-ink-soft sm:h-20 sm:w-20">
              <span className="font-display text-3xl font-900 leading-none text-bone tabular-nums sm:text-4xl">
                {i === 0 ? value : pad(value)}
              </span>
            </div>
            <p className="mt-2 text-[9px] font-700 uppercase tracking-widest text-khaki-deep">{label}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-xs italic text-khaki-deep/70">
        {flavourText(days)}
      </p>
    </div>
  )
}
