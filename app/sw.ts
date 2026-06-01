/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker'
import { Serwist, type PrecacheEntry } from 'serwist'

// Type augment — self.__SW_MANIFEST is injected by serwist at build time
declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: (PrecacheEntry | string)[]
}

const OFFLINE_URL = '/offline'

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  fallbacks: {
    entries: [
      {
        url: OFFLINE_URL,
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
})

serwist.addEventListeners()
