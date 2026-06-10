import { NextResponse } from 'next/server'

// Free, no-auth exchange rate API — caches response for 1 hour at the CDN layer
export const revalidate = 3600

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'NAD', 'BWP', 'ZMW', 'MZN']

export async function GET() {
  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=ZAR&to=${CURRENCIES.join(',')}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) throw new Error('Rate fetch failed')
    const data = await res.json() as { rates: Record<string, number> }
    return NextResponse.json({ base: 'ZAR', rates: { ZAR: 1, ...data.rates } })
  } catch {
    // Fallback approximate rates so the UI doesn't break if API is down
    return NextResponse.json({
      base: 'ZAR',
      rates: { ZAR: 1, USD: 0.054, EUR: 0.050, GBP: 0.043, AUD: 0.084, NAD: 1.0, BWP: 0.74, ZMW: 1.45, MZN: 3.47 },
      fallback: true,
    })
  }
}
