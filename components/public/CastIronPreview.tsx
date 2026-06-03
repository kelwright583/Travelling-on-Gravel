import React from 'react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import type { Database } from '@/db/types'
import type { IngredientGroup } from '@/lib/recipes/types'

type Recipe = Database['public']['Tables']['recipes']['Row']

interface CastIronPreviewProps {
  recipes: Recipe[]
}

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

export async function CastIronPreview({ recipes }: CastIronPreviewProps) {
  const tc = await getTranslations('castIron')

  if (recipes.length === 0) return null

  return (
    <section aria-label="Cast Iron Recipes" className="bg-ink py-20">
      <div className="mx-auto max-w-[1240px] px-6">
        {/* Header */}
        <div className="scroll-reveal mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-xs font-700 uppercase tracking-widest text-accent">
              {tc('eyebrow')}
            </p>
            <h2 className="font-display text-4xl font-900 uppercase leading-none tracking-tight text-bone md:text-5xl">
              {tc('title')}
            </h2>
          </div>
          <Link
            href="/cast-iron"
            className="text-xs font-700 uppercase tracking-widest text-khaki transition-colors hover:text-bone"
          >
            {tc('allRecipes')}
          </Link>
        </div>

        {/* Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {recipes.map((recipe, i) => {
            const title =
              typeof recipe.title === 'object' && recipe.title !== null
                ? (recipe.title as { en?: string }).en ?? ''
                : String(recipe.title ?? '')
            const ingCount = ((recipe.ingredients as unknown as IngredientGroup[]) ?? []).reduce(
              (sum, g) => sum + g.items.length,
              0,
            )
            const total = (recipe.prep_minutes ?? 0) + (recipe.cook_minutes ?? 0)

            return (
              <Link
                key={recipe.id}
                href={`/cast-iron/${recipe.slug}`}
                className="scroll-reveal group block overflow-hidden rounded-lg border border-line bg-ink-soft transition-colors hover:border-accent/40"
                style={{ '--reveal-delay': `${i * 90}ms` } as React.CSSProperties}
              >
                {/* Cover image */}
                <div className="relative aspect-[4/3] bg-olive/20">
                  {recipe.cover_image ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${recipe.cover_image}`}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 900px) 100vw, 420px"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-olive-2/40 to-ink" />
                  )}
                  <div className="absolute right-3 top-3">
                    <span className="rounded bg-ink/80 px-2 py-0.5 text-[10px] font-700 uppercase tracking-widest text-khaki backdrop-blur-sm">
                      {METHOD_LABELS[recipe.cook_method ?? ''] ?? recipe.cook_method}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-display mb-2 text-lg font-800 uppercase leading-tight text-bone transition-colors group-hover:text-accent">
                    {title}
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] font-600 uppercase tracking-widest text-khaki-deep">
                    {total > 0 && <span>{total} {tc('minutes')}</span>}
                    {recipe.servings && <span>{recipe.servings} {tc('servings')}</span>}
                    {ingCount > 0 && <span>{ingCount} ingredients</span>}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
