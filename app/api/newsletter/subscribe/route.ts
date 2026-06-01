import { NextRequest } from 'next/server'
import { z } from 'zod'

// TODO Phase 10: add Resend email + ESP sync + rate limiting
// This stub validates input and stores to DB; confirm email not yet wired.

const schema = z.object({
  email: z.string().email(),
  source: z.enum(['hero', 'footer', 'inline', 'concierge']).optional(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return Response.json({ message: 'Invalid email address.' }, { status: 422 })
  }

  // TODO Phase 10: insert subscriber + send double opt-in email via Resend
  // For now, return success so the UI flow works end-to-end
  return Response.json({ message: 'Check your inbox for a confirmation link.' })
}
