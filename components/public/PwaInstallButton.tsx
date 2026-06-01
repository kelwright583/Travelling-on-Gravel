'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * Shows a native "Install app" button when the browser fires beforeinstallprompt.
 * On iOS Safari (which doesn't fire the event), nothing is shown.
 */
export function PwaInstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (!prompt) return null

  async function handleInstall() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setPrompt(null)
  }

  return (
    <button
      type="button"
      onClick={handleInstall}
      className="inline-flex items-center gap-1.5 rounded border border-line px-3 py-1.5 text-[11px] font-600 uppercase tracking-widest text-khaki-deep transition-colors hover:border-accent hover:text-accent"
      aria-label="Install Travelling on Gravel as an app"
    >
      <Download size={12} aria-hidden="true" />
      Install app
    </button>
  )
}
