/**
 * ESP (Email Service Provider) sync stub.
 *
 * Wire this up to ConvertKit, Buttondown, or Mailchimp once the provider is confirmed.
 * Called after a subscriber confirms their double opt-in.
 *
 * For ConvertKit:   POST https://api.convertkit.com/v3/forms/{formId}/subscribe
 * For Buttondown:   POST https://api.buttondown.email/v1/subscribers
 * For Mailchimp:    PUT  https://us1.api.mailchimp.com/3.0/lists/{listId}/members/{hash}
 */
export async function syncToEsp(email: string, locale: string): Promise<void> {
  const provider = process.env.NEWSLETTER_PROVIDER

  if (!provider || provider === 'none') {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ESP stub] Would sync ${email} (${locale}) to ESP`)
    }
    return
  }

  if (provider === 'convertkit') {
    const apiKey = process.env.NEWSLETTER_API_KEY
    const formId = process.env.NEWSLETTER_LIST_ID
    if (!apiKey || !formId) return

    await fetch(`https://api.convertkit.com/v3/forms/${formId}/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey, email, fields: { locale } }),
    })
    return
  }

  if (provider === 'buttondown') {
    const apiKey = process.env.NEWSLETTER_API_KEY
    if (!apiKey) return

    await fetch('https://api.buttondown.email/v1/subscribers', {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, metadata: { locale } }),
    })
    return
  }
}
