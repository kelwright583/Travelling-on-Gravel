import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/ai/guard'
import { getOpenAI, MODEL, BRAND_SYSTEM_PROMPT } from '@/lib/ai/client'

const schema = z.object({
  content: z.string().min(20).max(10000),
  locale: z.enum(['en', 'de']).default('en'),
})

export async function POST(request: NextRequest) {
  const user = await requireAuth()
  if (!user) return Response.json({ message: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch { body = {} }

  const { data, error } = schema.safeParse(body)
  if (error) return Response.json({ message: 'Invalid input.' }, { status: 422 })

  const { content, locale } = data
  const lang = locale === 'de' ? 'German' : 'English'

  try {
    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: BRAND_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Write a 1–2 sentence excerpt/summary in ${lang} for the following content. Keep it punchy and in the brand voice. Return only the excerpt, no quotes or labels:\n\n${content}`,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    })

    const excerpt = completion.choices[0]?.message?.content?.trim() ?? ''
    return Response.json({ excerpt })
  } catch (err) {
    console.error('[ai/summarize]', err)
    return Response.json({ message: 'AI request failed.' }, { status: 500 })
  }
}
