import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { sendConfirmEmail } from '@/lib/email/resend'

const schema = z.object({
  email: z.string().email(),
  source: z.enum(['hero', 'footer', 'inline', 'concierge']).optional(),
  locale: z.enum(['en', 'de']).optional().default('en'),
  // Honeypot — bots fill this
  website: z.string().max(0).optional(),
})

// Re-send cooldown: don't resend confirm email within this window (ms)
const RESEND_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ message: 'Invalid request.' }, { status: 400 })
  }

  const result = schema.safeParse(body)
  if (!result.success) {
    return Response.json({ message: 'Invalid email address.' }, { status: 422 })
  }

  // Honeypot — if filled, silently succeed
  if (result.data.website) {
    return Response.json({ message: 'Check your inbox for a confirmation link.' })
  }

  const { email, source, locale } = result.data

  try {
    const supabase = await createServiceClient()

    // Check existing subscriber
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, status, confirm_token, created_at')
      .eq('email', email)
      .single()

    if (existing) {
      if (existing.status === 'confirmed') {
        // Already confirmed — friendly message, don't reveal status
        return Response.json({ message: 'Check your inbox for a confirmation link.' })
      }

      if (existing.status === 'pending') {
        // Check cooldown — don't resend if recently created
        const createdAt = new Date(existing.created_at as string).getTime()
        if (Date.now() - createdAt < RESEND_COOLDOWN_MS) {
          return Response.json({ message: 'Check your inbox for a confirmation link.' })
        }
        // Cooldown expired — generate new token and resend
        const { data: updated } = await supabase
          .from('subscribers')
          .update({ confirm_token: crypto.randomUUID(), locale, source })
          .eq('id', existing.id)
          .select('confirm_token')
          .single()

        if (updated?.confirm_token) {
          await sendConfirmEmail(email, updated.confirm_token as string, locale).catch((err) =>
            console.warn('[newsletter] email not sent (check RESEND_API_KEY):', err),
          )
        }
        return Response.json({ message: 'Check your inbox for a confirmation link.' })
      }

      if (existing.status === 'unsubscribed') {
        // Re-subscribe: reset to pending with new token
        const newToken = crypto.randomUUID()
        await supabase
          .from('subscribers')
          .update({ status: 'pending', confirm_token: newToken, locale, source, consent_at: null })
          .eq('id', existing.id)
        await sendConfirmEmail(email, newToken, locale).catch((err) =>
          console.warn('[newsletter] email not sent (check RESEND_API_KEY):', err),
        )
        return Response.json({ message: 'Check your inbox for a confirmation link.' })
      }
    }

    // New subscriber — insert
    const newToken = crypto.randomUUID()
    const { error } = await supabase.from('subscribers').insert({
      email,
      locale,
      source: source ?? null,
      status: 'pending',
      confirm_token: newToken,
    })

    if (error) {
      // Unique violation — race condition, another request beat us
      if (error.code === '23505') {
        return Response.json({ message: 'Check your inbox for a confirmation link.' })
      }
      console.error('[newsletter/subscribe]', error)
      return Response.json({ message: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    await sendConfirmEmail(email, newToken, locale).catch((err) =>
      console.warn('[newsletter] email not sent (check RESEND_API_KEY):', err),
    )
    return Response.json({ message: 'Check your inbox for a confirmation link.' })
  } catch (err) {
    console.error('[newsletter/subscribe]', err)
    return Response.json({ message: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
