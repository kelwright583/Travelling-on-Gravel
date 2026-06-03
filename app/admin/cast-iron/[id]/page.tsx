import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RecipeEditor } from '../RecipeEditor'

export const metadata = { title: 'Edit Recipe | Base Camp' }

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: recipe } = await supabase.from('recipes').select('*').eq('id', id).single()

  if (!recipe) notFound()

  const title =
    typeof recipe.title === 'object' && recipe.title !== null
      ? (recipe.title as { en?: string }).en
      : String(recipe.title)

  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-800 uppercase tracking-tight text-bone">
        {title || 'Edit Recipe'}
      </h1>
      <RecipeEditor recipe={recipe} />
    </div>
  )
}
