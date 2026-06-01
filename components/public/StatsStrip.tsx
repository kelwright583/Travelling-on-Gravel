'use client'

import { useEffect, useRef, useState } from 'react'
import type { Json } from '@/db/types'
import type { Stat } from '@/lib/i18n/types'
import { t } from '@/lib/i18n/types'

interface StatsStripProps {
  stats: Json
}

function useCountUp(target: number, active: boolean, duration = 1600) {
  const [count, setCount] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active || target === 0) {
      return
    }
    const start = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [active, target, duration])

  return count
}

function StatItem({ stat, active }: { stat: Stat; active: boolean }) {
  const count = useCountUp(stat.value, active)
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <p className="font-display text-4xl font-900 text-bone md:text-5xl">
        {count.toLocaleString()}
        {stat.suffix && <span className="text-accent">{stat.suffix}</span>}
      </p>
      <p className="text-xs font-600 uppercase tracking-widest text-khaki">
        {t(stat.label, 'en')}
      </p>
    </div>
  )
}

export function StatsStrip({ stats }: StatsStripProps) {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const items: Stat[] = Array.isArray(stats) ? (stats as Stat[]) : []
  if (items.length === 0) return null

  return (
    <section ref={ref} aria-label="Statistics" className="border-y border-line bg-ink-soft">
      <div className="mx-auto max-w-[1240px] px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {items.map((stat, i) => (
            <StatItem key={i} stat={stat} active={active} />
          ))}
        </div>
      </div>
    </section>
  )
}
