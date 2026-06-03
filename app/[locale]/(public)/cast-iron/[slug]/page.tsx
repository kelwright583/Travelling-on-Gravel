import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import type { IngredientGroup, Step } from '@/lib/recipes/types'
import { RecipeDetail } from './RecipeDetail'

export const revalidate = 60

type Props = { params: Promise<{ locale: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('recipes')
    .select('title, subtitle')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!data) return {}
  const title = typeof data.title === 'object' ? (data.title as { en?: string }).en ?? '' : String(data.title)
  const subtitle = typeof data.subtitle === 'object' ? (data.subtitle as { en?: string }).en ?? '' : ''
  return { title, description: subtitle }
}

export default async function CastIronDetailPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const tc = await getTranslations('castIron')

  const { data: recipe } = await supabase
    .from('recipes')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!recipe) notFound()

  const title = typeof recipe.title === 'object' ? (recipe.title as { en?: string }).en ?? '' : String(recipe.title ?? '')
  const subtitle = typeof recipe.subtitle === 'object' ? (recipe.subtitle as { en?: string }).en ?? '' : ''
  const intro = typeof recipe.intro === 'object' ? (recipe.intro as { en?: string }).en ?? '' : ''
  const ingredients = (recipe.ingredients as unknown as IngredientGroup[]) ?? []
  const steps = (recipe.steps as unknown as Step[]) ?? []
  const tips = (recipe.tips as unknown as { en: string }[]) ?? []
  const equipment = (recipe.equipment as unknown as { en: string }[]) ?? []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: title,
    description: subtitle || intro,
    prepTime: recipe.prep_minutes ? `PT${recipe.prep_minutes}M` : undefined,
    cookTime: recipe.cook_minutes ? `PT${recipe.cook_minutes}M` : undefined,
    recipeYield: recipe.servings ? String(recipe.servings) : undefined,
    recipeIngredient: ingredients.flatMap((g) =>
      g.items.map((item) => {
        const parts = []
        if (item.qty) parts.push(String(item.qty))
        if (item.unit) parts.push(item.unit)
        parts.push(item.item.en)
        return parts.join(' ')
      }),
    ),
    recipeInstructions: steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: s.text.en,
    })),
    image: recipe.cover_image
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${recipe.cover_image}`
      : undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <RecipeDetail
        title={title}
        subtitle={subtitle}
        intro={intro}
        coverImage={recipe.cover_image}
        prepMinutes={recipe.prep_minutes}
        cookMinutes={recipe.cook_minutes}
        servings={recipe.servings}
        difficulty={recipe.difficulty}
        cookMethod={recipe.cook_method}
        ingredients={ingredients}
        steps={steps}
        tips={tips}
        equipment={equipment}
        tags={recipe.tags ?? []}
        tc={{
          prep: tc('prep'),
          cook: tc('cook'),
          total: tc('total'),
          servings: tc('servings'),
          servingsLabel: tc('servingsLabel'),
          ingredients: tc('ingredients'),
          method: tc('method'),
          tips: tc('tips'),
          equipment: tc('equipment'),
          minutes: tc('minutes'),
          noImage: tc('noImage'),
        }}
      />
    </>
  )
}
