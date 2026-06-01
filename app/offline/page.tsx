import type { Metadata } from 'next'
import Link from 'next/link'
import { WifiOff, MapPin, Film, BookOpen } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Offline — Travelling on Gravel',
  robots: { index: false },
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="hazard mb-10 w-24" aria-hidden="true" />

      <WifiOff size={40} className="mb-6 text-khaki-deep" aria-hidden="true" />

      <p className="mb-2 text-xs font-700 uppercase tracking-widest text-accent">You&apos;re offline</p>
      <h1 className="font-display mb-4 text-4xl font-900 uppercase leading-tight tracking-tight text-bone">
        No signal.
        <br />
        Still here.
      </h1>
      <p className="mb-10 max-w-sm text-sm leading-relaxed text-khaki">
        Happens to the best of us — usually somewhere between Kaokoland and a decent cell tower.
        Pages you&apos;ve visited recently are available below.
      </p>

      <div className="mb-10 grid gap-3 sm:grid-cols-3">
        <div className="rounded border border-line bg-ink-soft p-4 text-left">
          <BookOpen size={16} className="mb-2 text-khaki-deep" aria-hidden="true" />
          <p className="text-xs font-700 uppercase tracking-widest text-bone">Dispatches</p>
          <p className="mt-1 text-[11px] text-khaki">Field notes — cached on first visit</p>
        </div>
        <div className="rounded border border-line bg-ink-soft p-4 text-left">
          <MapPin size={16} className="mb-2 text-khaki-deep" aria-hidden="true" />
          <p className="text-xs font-700 uppercase tracking-widest text-bone">Adventures</p>
          <p className="mt-1 text-[11px] text-khaki">Route stories — cached on first visit</p>
        </div>
        <div className="rounded border border-line bg-ink-soft p-4 text-left">
          <Film size={16} className="mb-2 text-khaki-deep" aria-hidden="true" />
          <p className="text-xs font-700 uppercase tracking-widest text-bone">Films</p>
          <p className="mt-1 text-[11px] text-khaki">Requires network to stream</p>
        </div>
      </div>

      <Link
        href="/"
        className="rounded border border-accent px-6 py-2.5 text-xs font-700 uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-bone"
      >
        Try again
      </Link>
    </div>
  )
}
