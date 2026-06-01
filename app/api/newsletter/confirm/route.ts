import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { syncToEsp } from '@/lib/email/esp'

function htmlPage(title: string, headline: string, body: string, locale: string) {
  return new Response(
    `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — Travelling on Gravel</title>
  <style>
    body{margin:0;padding:0;background:#1A1A14;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh}
    .card{max-width:480px;padding:48px 40px;background:#212116;border:1px solid #2E2E26;border-radius:8px;text-align:center}
    .eyebrow{font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#8B9E6E;margin:0 0 12px}
    h1{margin:0 0 16px;font-size:28px;font-weight:900;text-transform:uppercase;color:#EDE8DC;letter-spacing:-.02em}
    p{margin:0 0 32px;font-size:14px;line-height:1.6;color:#A89E85}
    a{display:inline-block;background:#8B9E6E;color:#EDE8DC;text-decoration:none;padding:12px 28px;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
  </style>
</head>
<body>
  <div class="card">
    <p class="eyebrow">Travelling on Gravel</p>
    <h1>${headline}</h1>
    <p>${body}</p>
    <a href="/">Back to the trail</a>
  </div>
</body>
</html>`,
    { headers: { 'Content-Type': 'text/html' } },
  )
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const supabase = await createServiceClient()

  const { data: subscriber, error } = await supabase
    .from('subscribers')
    .select('id, email, status, locale')
    .eq('confirm_token', token)
    .single()

  if (error || !subscriber) {
    return htmlPage(
      'Invalid link',
      'Link expired.',
      'This confirmation link is invalid or has already been used.',
      'en',
    )
  }

  const locale = (subscriber.locale as string) ?? 'en'
  const isDE = locale === 'de'

  if (subscriber.status === 'confirmed') {
    return htmlPage(
      isDE ? 'Bereits bestätigt' : 'Already confirmed',
      isDE ? 'Du bist bereits dabei.' : 'You\'re already in.',
      isDE
        ? 'Dein Abonnement wurde bereits bestätigt. Berichte kommen bald.'
        : 'Your subscription was already confirmed. Dispatches are on their way.',
      locale,
    )
  }

  // Confirm the subscriber
  await supabase
    .from('subscribers')
    .update({ status: 'confirmed', consent_at: new Date().toISOString() })
    .eq('id', subscriber.id)

  // Sync to ESP (fire and forget — don't block the response)
  syncToEsp(subscriber.email as string, locale).catch((err) =>
    console.error('[newsletter/confirm ESP sync]', err),
  )

  return htmlPage(
    isDE ? 'Bestätigt' : 'Confirmed',
    isDE ? 'Du bist dabei.' : 'You\'re in.',
    isDE
      ? 'Dein Abonnement ist bestätigt. Wir melden uns, wenn es etwas Erzählenswertes gibt.'
      : 'Your subscription is confirmed. We\'ll be in touch when there\'s something worth saying.',
    locale,
  )
}
