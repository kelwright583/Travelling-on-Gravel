import type { Metadata } from 'next'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import type { IngredientGroup } from '@/lib/recipes/types'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Cast Iron',
  description: 'Outdoor recipes cooked over fire, coals, and open flame — from the Travelling on Gravel kitchen.',
}

function totalMinutes(prep: number | null, cook: number | null) {
  return (prep ?? 0) + (cook ?? 0)
}

function ingredientCount(ingredients: IngredientGroup[]) {
  return ingredients.reduce((sum, g) => sum + g.items.length, 0)
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

export default async function CastIronPage() {
  const supabase = await createClient()
  const tc = await getTranslations('castIron')

  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, slug, title, subtitle, cover_image, prep_minutes, cook_minutes, servings, difficulty, cook_method, ingredients, tags')
    .eq('published', true)
    .order('published_at', { ascending: false })

  return (
    <div className="mx-auto max-w-[1240px] px-6 pb-20 pt-32">
      <div className="mb-12">
        <p className="mb-2 text-xs font-700 uppercase tracking-widest text-accent">
          {tc('eyebrow')}
        </p>
        <h1 className="font-display text-5xl font-900 uppercase leading-none tracking-tight text-bone md:text-7xl">
          {tc('title')}
        </h1>
        <p className="mt-4 max-w-xl text-sm text-khaki">{tc('tagline')}</p>
      </div>

      {recipes && recipes.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => {
            const title =
              typeof recipe.title === 'object' && recipe.title !== null
                ? (recipe.title as { en?: string }).en ?? ''
                : String(recipe.title ?? '')
            const subtitle =
              typeof recipe.subtitle === 'object' && recipe.subtitle !== null
                ? (recipe.subtitle as { en?: string }).en ?? ''
                : ''
            const total = totalMinutes(recipe.prep_minutes, recipe.cook_minutes)
            const ingCount = ingredientCount((recipe.ingredients as unknown as IngredientGroup[]) ?? [])

            return (
              <Link
                key={recipe.id}
                href={`/cast-iron/${recipe.slug}`}
                className="group block overflow-hidden rounded-lg border border-line bg-ink-soft transition-colors hover:border-accent/40"
              >
                <div className="relative aspect-[4/3] bg-olive/20">
                  {recipe.cover_image ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${recipe.cover_image}`}
                      alt={title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs text-khaki-deep">{tc('noImage')}</span>
                    </div>
                  )}
                  <div className="absolute right-3 top-3">
                    <span className="rounded bg-ink/80 px-2 py-0.5 text-[10px] font-700 uppercase tracking-widest text-khaki backdrop-blur-sm">
                      {recipe.cook_method ? (METHOD_LABELS[recipe.cook_method] ?? recipe.cook_method) : ''}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h2 className="font-display mb-1 text-lg font-800 uppercase leading-tight text-bone group-hover:text-accent">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="mb-3 text-xs text-khaki">{subtitle}</p>
                  )}
                  <div className="flex items-center gap-4 text-[10px] font-600 uppercase tracking-widest text-khaki-deep">
                    {total > 0 && (
                      <span>{total} {tc('minutes')}</span>
                    )}
                    {recipe.servings && (
                      <span>{recipe.servings} {tc('servings')}</span>
                    )}
                    {ingCount > 0 && (
                      <span>{ingCount} ingredients</span>
                    )}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-khaki">{tc('empty')}</p>
      )}
    </div>
  )
}
