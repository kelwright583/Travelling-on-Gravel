import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import type { AiNotes, IngredientGroup, Step } from '@/lib/recipes/types'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { recipeId } = await req.json()
  if (!recipeId) return NextResponse.json({ error: 'Missing recipeId' }, { status: 400 })

  const { data: recipe, error } = await supabase
    .from('recipes')
    .select('title, intro, ingredients, steps, tips, equipment, difficulty, cook_method')
    .eq('id', recipeId)
    .single()

  if (error || !recipe) return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })

  const title = typeof recipe.title === 'object' ? (recipe.title as { en?: string }).en ?? '' : String(recipe.title)
  const intro = typeof recipe.intro === 'object' ? (recipe.intro as { en?: string }).en ?? '' : ''
  const ingredients = (recipe.ingredients as unknown as IngredientGroup[]) ?? []
  const steps = (recipe.steps as unknown as Step[]) ?? []
  const tips = (recipe.tips as unknown as { en: string }[]) ?? []
  const equipment = (recipe.equipment as unknown as { en: string }[]) ?? []

  const ingredientLines = ingredients
    .flatMap((g) => g.items.map((item) => `${item.qty ?? ''} ${item.unit ?? ''} ${item.item.en}`.trim()))
    .join('\n')
  const stepLines = steps.map((s, i) => `${i + 1}. ${s.text.en}`).join('\n')
  const tipLines = tips.map((t) => `- ${t.en}`).join('\n')

  const prompt = `You are a culinary editor reviewing an outdoor cooking recipe for the "Travelling on Gravel" website — a Southern African overlanding blog focused on braai, potjie, campfire, and cast iron cooking.

Recipe: ${title}
Cook method: ${recipe.cook_method}
Difficulty: ${recipe.difficulty}
Intro: ${intro}

Ingredients:
${ingredientLines}

Steps:
${stepLines}

Tips:
${tipLines}

Equipment: ${equipment.map((e) => e.en).join(', ')}

Please review this recipe and return a JSON object with these fields:
- summary: 1-2 sentence editorial summary of the recipe
- warnings: array of critical issues (safety, missing crucial steps, ingredient errors)
- suggestions: array of improvement suggestions (technique, flavour, clarity)
- missing: array of things that seem missing (equipment not listed, steps not mentioned, etc.)
- voice: brief note on whether the writing tone matches an authentic outdoor cooking blog
- formatted: object with optional "intro" (suggested rewrite of intro if needed) and "steps" (array of suggested step rewrites if any steps are unclear)

Return ONLY valid JSON.`

  try {
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    })

    const text = completion.choices[0]?.message?.content ?? '{}'
    const aiNotes: AiNotes = JSON.parse(text)

    return NextResponse.json({ ok: true, aiNotes })
  } catch (err) {
    console.error('[AI recipe review]', err)
    return NextResponse.json({ error: 'AI review failed' }, { status: 500 })
  }
}
