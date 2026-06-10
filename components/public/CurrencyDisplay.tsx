'use client'

import { useEffect, useState } from 'react'

const CURRENCY_LABELS: Record<string, string> = {
  ZAR: 'ZAR — South African Rand',
  USD: 'USD — US Dollar',
  EUR: 'EUR — Euro',
  GBP: 'GBP — British Pound',
  AUD: 'AUD — Australian Dollar',
  NAD: 'NAD — Namibian Dollar',
  BWP: 'BWP — Botswana Pula',
  ZMW: 'ZMW — Zambian Kwacha',
  MZN: 'MZN — Mozambican Metical',
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  ZAR: 'R', USD: '$', EUR: '€', GBP: '£', AUD: 'A$',
  NAD: 'N$', BWP: 'P', ZMW: 'K', MZN: 'MT',
}

interface Props {
  amountZar: number
  label?: string
}

export function CurrencyDisplay({ amountZar, label = 'Estimated trip budget' }: Props) {
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [currency, setCurrency] = useState('ZAR')
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    fetch('/api/fx')
      .then((r) => r.json())
      .then((d: { rates: Record<string, number>; fallback?: boolean }) => {
        setRates(d.rates)
        if (d.fallback) setFallback(true)
      })
      .catch(() => setFallback(true))
  }, [])

  const converted = rates ? Math.round(amountZar * (rates[currency] ?? 1)) : amountZar
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency

  return (
    <div className="rounded-lg border border-line bg-ink p-5">
      <p className="mb-3 text-[10px] font-700 uppercase tracking-widest text-khaki-deep">{label}</p>

      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="font-display text-3xl font-900 text-bone">
            {symbol}{converted.toLocaleString()}
          </p>
          {currency !== 'ZAR' && (
            <p className="mt-0.5 text-xs text-khaki-deep">R{amountZar.toLocaleString()} ZAR</p>
          )}
        </div>

        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          className="rounded border border-line bg-ink-soft px-2 py-1.5 text-xs text-bone focus:border-accent focus:outline-none"
        >
          {Object.entries(CURRENCY_LABELS).map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
      </div>

      {fallback && (
        <p className="mt-2 text-[10px] text-khaki-deep/50">Approximate rates — live data unavailable</p>
      )}
      {!fallback && rates && (
        <p className="mt-2 text-[10px] text-khaki-deep/50">Live exchange rates via Frankfurter API</p>
      )}
    </div>
  )
}
