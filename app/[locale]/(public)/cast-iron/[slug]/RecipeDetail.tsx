'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { IngredientGroup, Step } from '@/lib/recipes/types'
import { renderBody } from '@/lib/render-body'

const METHOD_LABELS: Record<string, string> = {
  fire: 'Open Fire',
  coals: 'Coals',
  potjie: 'Potjie',
  'braai-grid': 'Braai Grid',
  skottel: 'Skottel',
  gas: 'Gas',
  'dutch-oven': 'Dutch Oven',
  other: 'Other',
}

type Tc = {
  prep: string
  cook: string
  total: string
  servings: string
  servingsLabel: string
  ingredients: string
  method: string
  tips: string
  equipment: string
  minutes: string
  noImage: string
}

interface Props {
  title: string
  subtitle: string
  intro: string
  coverImage?: string | null
  prepMinutes?: number | null
  cookMinutes?: number | null
  servings?: number | null
  difficulty?: string | null
  cookMethod?: string | null
  ingredients: IngredientGroup[]
  steps: Step[]
  tips: { en: string }[]
  equipment: { en: string }[]
  tags: string[]
  tc: Tc
}

function scaleQty(qty: number | null | undefined, ratio: number): string {
  if (!qty) return ''
  const scaled = qty * ratio
  if (scaled % 1 === 0) return String(scaled)
  // simple fraction display
  const whole = Math.floor(scaled)
  const frac = scaled - whole
  const fracs: [number, string][] = [[0.5, '½'], [0.25, '¼'], [0.75, '¾'], [0.333, '⅓'], [0.667, '⅔']]
  const match = fracs.find(([f]) => Math.abs(frac - f) < 0.05)
  if (match) return whole > 0 ? `${whole}${match[1]}` : match[1]
  return scaled.toFixed(1)
}

export function RecipeDetail({
  title,
  subtitle,
  intro,
  coverImage,
  prepMinutes,
  cookMinutes,
  servings,
  difficulty,
  cookMethod,
  ingredients,
  steps,
  tips,
  equipment,
  tags,
  tc,
}: Props) {
  const baseServings = servings ?? 4
  const [currentServings, setCurrentServings] = useState(baseServings)
  const ratio = currentServings / baseServings

  const total = (prepMinutes ?? 0) + (cookMinutes ?? 0)
  const imgSrc = coverImage
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${coverImage}`
    : null

  return (
    <div className="mx-auto max-w-[900px] px-6 pb-24 pt-32">
      {/* Hero */}
      <div className="mb-10">
        {tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-line px-3 py-0.5 text-[10px] font-700 uppercase tracking-widest text-khaki-deep"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <h1 className="font-display text-4xl font-900 uppercase leading-none tracking-tight text-bone md:text-6xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 text-lg text-khaki">{subtitle}</p>
        )}
      </div>

      {/* Cover image */}
      {imgSrc ? (
        <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-lg">
          <Image
            src={imgSrc}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 900px) 100vw, 900px"
          />
        </div>
      ) : (
        <div className="mb-10 flex aspect-[16/9] items-center justify-center rounded-lg bg-ink-soft">
          <span className="text-sm text-khaki-deep">{tc.noImage}</span>
        </div>
      )}

      {/* At a glance */}
      <div className="mb-10 grid grid-cols-2 gap-3 rounded-lg border border-line p-6 sm:grid-cols-4">
        {prepMinutes != null && prepMinutes > 0 && (
          <div className="text-center">
            <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">{tc.prep}</p>
            <p className="mt-1 font-display text-xl font-800 text-bone">{prepMinutes}<span className="ml-0.5 text-xs text-khaki-deep">{tc.minutes}</span></p>
          </div>
        )}
        {cookMinutes != null && cookMinutes > 0 && (
          <div className="text-center">
            <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">{tc.cook}</p>
            <p className="mt-1 font-display text-xl font-800 text-bone">{cookMinutes}<span className="ml-0.5 text-xs text-khaki-deep">{tc.minutes}</span></p>
          </div>
        )}
        {total > 0 && (
          <div className="text-center">
            <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">{tc.total}</p>
            <p className="mt-1 font-display text-xl font-800 text-bone">{total}<span className="ml-0.5 text-xs text-khaki-deep">{tc.minutes}</span></p>
          </div>
        )}
        {difficulty && (
          <div className="text-center">
            <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Level</p>
            <p className="mt-1 font-display text-xl font-800 capitalize text-bone">{difficulty}</p>
          </div>
        )}
        {cookMethod && (
          <div className="text-center">
            <p className="text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Method</p>
            <p className="mt-1 font-display text-base font-800 text-bone">{METHOD_LABELS[cookMethod] ?? cookMethod}</p>
          </div>
        )}
      </div>

      {/* Intro */}
      {intro && (
        <div className="mb-10 text-sm leading-relaxed text-khaki">{renderBody(intro)}</div>
      )}

      <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
        {/* Ingredients */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-800 uppercase tracking-tight text-bone">
              {tc.ingredients}
            </h2>
          </div>

          {/* Servings stepper */}
          {servings && (
            <div className="mb-6 flex items-center gap-3">
              <button
                onClick={() => setCurrentServings((s) => Math.max(1, s - 1))}
                className="flex h-7 w-7 items-center justify-center rounded border border-line text-bone transition-colors hover:border-accent hover:text-accent"
                aria-label="Fewer servings"
              >
                −
              </button>
              <span className="text-sm font-600 text-bone">{currentServings} {tc.servings}</span>
              <button
                onClick={() => setCurrentServings((s) => s + 1)}
                className="flex h-7 w-7 items-center justify-center rounded border border-line text-bone transition-colors hover:border-accent hover:text-accent"
                aria-label="More servings"
              >
                +
              </button>
            </div>
          )}

          <div className="space-y-6">
            {ingredients.map((group) => (
              <div key={group.id}>
                {group.heading?.en && (
                  <p className="mb-2 text-[10px] font-700 uppercase tracking-widest text-accent">
                    {group.heading.en}
                  </p>
                )}
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li key={item.id} className="flex gap-2 text-sm text-khaki">
                      <span className="min-w-[3rem] text-right font-600 text-bone">
                        {scaleQty(item.qty, ratio)}{item.unit ? ` ${item.unit}` : ''}
                      </span>
                      <span>
                        {item.item.en}
                        {item.note?.en && (
                          <span className="text-khaki-deep">, {item.note.en}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Equipment */}
          {equipment.length > 0 && (
            <div className="mt-8">
              <h3 className="mb-3 text-[10px] font-700 uppercase tracking-widest text-khaki-deep">
                {tc.equipment}
              </h3>
              <ul className="space-y-1">
                {equipment.map((item, i) => (
                  <li key={i} className="text-sm text-khaki">
                    {item.en}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Steps */}
        <div>
          <h2 className="font-display mb-6 text-lg font-800 uppercase tracking-tight text-bone">
            {tc.method}
          </h2>
          <ol className="space-y-8">
            {steps.map((step, i) => (
              <li key={step.id} className="flex gap-4">
                <span className="font-display mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-sm font-800 text-accent">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm leading-relaxed text-khaki">{step.text.en}</p>
                  {step.minutes && (
                    <p className="mt-1 text-[10px] font-600 uppercase tracking-widest text-khaki-deep">
                      {step.minutes} {tc.minutes}
                    </p>
                  )}
                  {step.image && (
                    <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${step.image}`}
                        alt={`Step ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 900px) 100vw, 580px"
                      />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {/* Tips */}
          {tips.length > 0 && (
            <div className="mt-10 rounded-lg border border-accent/20 bg-ink-soft p-6">
              <h3 className="mb-4 text-[10px] font-700 uppercase tracking-widest text-accent">
                {tc.tips}
              </h3>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-khaki">
                    <span className="text-accent">→</span>
                    <span>{tip.en}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
