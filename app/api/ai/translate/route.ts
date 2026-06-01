import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/ai/guard'
import { getOpenAI, MODEL, BRAND_SYSTEM_PROMPT } from '@/lib/ai/client'

const schema = z.object({
  text: z.string().min(1).max(2000),
  from: z.enum(['en', 'de']).default('en'),
  to: z.enum(['en', 'de']).default('de'),
})

export async function POST(request: NextRequest) {
  const user = await requireAuth()
  if (!user) return Response.json({ message: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try { body = await request.json() } catch { body = {} }

  const { data, error } = schema.safeParse(body)
  if (error) return Response.json({ message: 'Invalid input.' }, { status: 422 })

  const { text, from, to } = data
  const fromLang = from === 'de' ? 'German' : 'English'
  const toLang = to === 'de' ? 'German' : 'English'

  if (from === to) {
    return Response.json({ translation: text })
  }

  try {
    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: BRAND_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Translate the following ${fromLang} text to ${toLang}, preserving the brand voice (rugged, honest, dry). Return only the translated text, no explanation:\n\n${text}`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.3,
    })

    const translation = completion.choices[0]?.message?.content?.trim() ?? ''
    return Response.json({ translation })
  } catch (err) {
    console.error('[ai/translate]', err)
    return Response.json({ message: 'AI request failed.' }, { status: 500 })
  }
}
