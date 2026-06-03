import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const BRAND_VOICE = `You are an editorial assistant for "Travelling on Gravel" — a Southern African overlanding blog written by Rupert, a Zululand-born insurance broker with a German father. The brand voice is rugged, dry-witted, honest, and a bit irreverent — never crude, never glossy. Think campfire storytelling, not lifestyle influencing. The author may mix in German words naturally (e.g. Fernweh, Ordnung, Gemütlichkeit) — preserve these, they're intentional character. Keep the author's distinct voice; don't sanitise it into generic travel writing.`

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { text, mode, prompt: userPrompt } = await req.json() as {
    text?: string
    mode: 'polish' | 'brainstorm'
    prompt?: string
  }

  if (mode === 'polish') {
    if (!text?.trim()) return NextResponse.json({ error: 'No text provided' }, { status: 400 })

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: BRAND_VOICE },
        {
          role: 'user',
          content: `Review the following text for spelling, grammar, and clarity. Then offer 2–3 improved versions that preserve the author's voice. Return JSON: { "issues": ["..."], "suggestions": [{ "label": "...", "text": "..." }] }\n\nText:\n${text}`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1200,
    })

    const result = JSON.parse(completion.choices[0]?.message?.content ?? '{}')
    return NextResponse.json({ ok: true, ...result })
  }

  if (mode === 'brainstorm') {
    if (!userPrompt?.trim()) return NextResponse.json({ error: 'No prompt provided' }, { status: 400 })

    const contextClause = text?.trim()
      ? `\n\nExisting content for context:\n${text.slice(0, 600)}`
      : ''

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: BRAND_VOICE },
        {
          role: 'user',
          content: `The author is stuck and describes what they want to say:\n"${userPrompt}"${contextClause}\n\nWrite 3 options that capture this idea in the brand voice. Return JSON: { "suggestions": [{ "label": "Short description", "text": "Full written version" }] }`,
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1200,
    })

    const result = JSON.parse(completion.choices[0]?.message?.content ?? '{}')
    return NextResponse.json({ ok: true, ...result })
  }

  return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
}
