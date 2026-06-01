import { type NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

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
    a{display:inline-block;color:#8B9E6E;text-decoration:none;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase}
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
    .select('id, status, locale')
    .eq('confirm_token', token)
    .single()

  if (error || !subscriber) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const locale = (subscriber.locale as string) ?? 'en'
  const isDE = locale === 'de'

  if (subscriber.status === 'unsubscribed') {
    return htmlPage(
      isDE ? 'Bereits abgemeldet' : 'Already unsubscribed',
      isDE ? 'Bereits abgemeldet.' : 'Already unsubscribed.',
      isDE
        ? 'Du hast dich bereits abgemeldet. Keine weiteren E-Mails von uns.'
        : 'You\'re already unsubscribed. No more emails from us.',
      locale,
    )
  }

  await supabase
    .from('subscribers')
    .update({ status: 'unsubscribed' })
    .eq('id', subscriber.id)

  return htmlPage(
    isDE ? 'Abgemeldet' : 'Unsubscribed',
    isDE ? 'Du wurdest abgemeldet.' : 'You\'ve been unsubscribed.',
    isDE
      ? 'Schade, dass du gehst. Du kannst dich jederzeit wieder anmelden.'
      : 'Sorry to see you go. You can always sign up again if you change your mind.',
    locale,
  )
}
