import { Resend } from 'resend'

function getClient() {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('RESEND_API_KEY is not configured.')
  return new Resend(key)
}

const FROM = process.env.RESEND_FROM ?? 'Travelling on Gravel <onboarding@resend.dev>'

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}

export async function sendConfirmEmail(email: string, token: string, locale: string) {
  const base = siteUrl()
  const confirmUrl = `${base}/api/newsletter/confirm?token=${token}`
  const unsubUrl = `${base}/api/newsletter/unsubscribe?token=${token}`

  const isDE = locale === 'de'

  const subject = isDE
    ? 'Bitte bestätige dein Abonnement — Travelling on Gravel'
    : 'Confirm your subscription — Travelling on Gravel'

  const headline = isDE ? 'Du bist fast dabei.' : 'You\'re almost in.'
  const body = isDE
    ? 'Klicke auf den Button, um dein Abonnement zu bestätigen und Berichte direkt in deinen Posteingang zu bekommen.'
    : 'Click the button below to confirm your subscription and get honest dispatches from overland Africa delivered to your inbox.'
  const cta = isDE ? 'Abonnement bestätigen' : 'Confirm subscription'
  const footer = isDE
    ? `Falls du dich nicht angemeldet hast, kannst du diese E-Mail ignorieren. <a href="${unsubUrl}" style="color:#8B9E6E">Abmelden</a>`
    : `If you didn't sign up, you can safely ignore this email. <a href="${unsubUrl}" style="color:#8B9E6E">Unsubscribe</a>`

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#1A1A14;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:40px auto;padding:40px;background:#212116;border:1px solid #2E2E26;border-radius:8px">
    <tr><td>
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:#8B9E6E">Travelling on Gravel</p>
      <h1 style="margin:0 0 24px;font-size:28px;font-weight:900;text-transform:uppercase;color:#EDE8DC;letter-spacing:-.02em">${headline}</h1>
      <p style="margin:0 0 32px;font-size:14px;line-height:1.6;color:#A89E85">${body}</p>
      <a href="${confirmUrl}" style="display:inline-block;background:#8B9E6E;color:#EDE8DC;text-decoration:none;padding:14px 32px;border-radius:4px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase">${cta}</a>
      <p style="margin:40px 0 0;font-size:11px;color:#6B6454">${footer}</p>
    </td></tr>
  </table>
</body>
</html>`

  await getClient().emails.send({
    from: FROM,
    to: email,
    subject,
    html,
  })
}
