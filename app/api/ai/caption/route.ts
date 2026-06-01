import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/ai/guard'
import { getOpenAI, MODEL, BRAND_SYSTEM_PROMPT } from '@/lib/ai/client'

const schema = z.object({
  context: z.string().max(500),
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

  try {
    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: BRAND_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Write a short, punchy photo caption in ${lang} (1–2 sentences, max 150 chars) for: ${context}. Return only the caption text, no quotes.`,
        },
      ],
      max_tokens: 100,
      temperature: 0.8,
    })

    const caption = completion.choices[0]?.message?.content?.trim() ?? ''
    return Response.json({ caption })
  } catch (err) {
    console.error('[ai/caption]', err)
    return Response.json({ message: 'AI request failed.' }, { status: 500 })
  }
}
