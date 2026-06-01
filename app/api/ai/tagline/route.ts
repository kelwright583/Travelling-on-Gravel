import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/ai/guard'
import { getOpenAI, MODEL, BRAND_SYSTEM_PROMPT } from '@/lib/ai/client'

const schema = z.object({
  context: z.string().max(500).optional(),
  locale: z.enum(['en', 'de']).default('en'),
})

export async function POST(request: NextRequest) {
  const user = await requireAuth()
  if (!user) return Response.json({ message: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch { body = {} }

  const { data, error } = schema.safeParse(body)
  if (error) return Response.json({ message: 'Invalid input.' }, { status: 422 })

  const { context, locale } = data

  const lang = locale === 'de' ? 'German' : 'English'
  const userPrompt = `Generate 4 punchy hero tagline options for the site, max 6 words each, in ${lang}.${context ? ` Context: ${context}` : ''} Return as a JSON array of strings, nothing else.`

  try {
    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: MODEL,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: BRAND_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 200,
      temperature: 0.9,
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw) as Record<string, unknown>
    // Handle both { taglines: [...] } and { options: [...] } or direct array wrapper
    const taglines =
      (parsed.taglines ?? parsed.options ?? parsed.results ?? Object.values(parsed)[0]) as string[]

    return Response.json({ taglines: Array.isArray(taglines) ? taglines : [] })
  } catch (err) {
    console.error('[ai/tagline]', err)
    return Response.json({ message: 'AI request failed.' }, { status: 500 })
  }
}
