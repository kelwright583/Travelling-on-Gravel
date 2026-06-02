const socials = [
  {
    name: 'Facebook',
    href: 'https://www.facebook.com/',
  },
  {
    name: 'TikTok',
    href: 'https://www.tiktok.com/',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/',
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/',
  },
] as const

function FacebookGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V10H8v3h2.7v8h2.8Z" />
    </svg>
  )
}

function TikTokGlyph() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-current"
    >
      <path d="M14.4 3c.4 1.8 1.5 3.2 3.2 4.1 1 .6 2 .9 3.1 1v3.3c-1.3 0-2.7-.3-3.9-.9-.6-.3-1.1-.6-1.6-1v6.8c0 3.6-2.9 6.5-6.5 6.5S2.2 20 2.2 16.4s2.9-6.5 6.5-6.5c.3 0 .7 0 1 .1v3.4c-.3-.1-.6-.1-1-.1-1.7 0-3.1 1.4-3.1 3.1s1.4 3.1 3.1 3.1 3.1-1.4 3.1-3.1V3h2.6Z" />
    </svg>
  )
}

function InstagramGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M12 7.2A4.8 4.8 0 1 0 12 16.8 4.8 4.8 0 0 0 12 7.2Zm0 7.9A3.1 3.1 0 1 1 12 8.9a3.1 3.1 0 0 1 0 6.2Z" />
      <circle cx="17.1" cy="6.9" r="1.1" />
      <path d="M12 2.8c3 0 3.4 0 4.5.1 1 .1 1.6.2 2 .4.5.2.8.4 1.2.8.4.4.6.7.8 1.2.2.4.3 1 .4 2 .1 1.1.1 1.5.1 4.5s0 3.4-.1 4.5c-.1 1-.2 1.6-.4 2-.2.5-.4.8-.8 1.2-.4.4-.7.6-1.2.8-.4.2-1 .3-2 .4-1.1.1-1.5.1-4.5.1s-3.4 0-4.5-.1c-1-.1-1.6-.2-2-.4a3.3 3.3 0 0 1-2-2c-.2-.4-.3-1-.4-2C2.8 15.4 2.8 15 2.8 12s0-3.4.1-4.5c.1-1 .2-1.6.4-2 .2-.5.4-.8.8-1.2.4-.4.7-.6 1.2-.8.4-.2 1-.3 2-.4 1.1-.1 1.5-.1 4.5-.1Zm0-1.8c-3 0-3.5 0-4.6.1-1.1.1-1.9.2-2.6.5-.7.3-1.3.6-1.9 1.2-.6.6-.9 1.2-1.2 1.9-.3.7-.4 1.5-.5 2.6C1 8.5 1 9 1 12s0 3.5.1 4.6c.1 1.1.2 1.9.5 2.6.3.7.6 1.3 1.2 1.9.6.6 1.2.9 1.9 1.2.7.3 1.5.4 2.6.5C8.5 23 9 23 12 23s3.5 0 4.6-.1c1.1-.1 1.9-.2 2.6-.5.7-.3 1.3-.6 1.9-1.2.6-.6.9-1.2 1.2-1.9.3-.7.4-1.5.5-2.6.1-1.1.1-1.6.1-4.6s0-3.5-.1-4.6c-.1-1.1-.2-1.9-.5-2.6-.3-.7-.6-1.3-1.2-1.9-.6-.6-1.2-.9-1.9-1.2-.7-.3-1.5-.4-2.6-.5C15.5 1 15 1 12 1Z" />
    </svg>
  )
}

function YouTubeGlyph() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
      <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5a3 3 0 0 0-2.1 2.1C2 9 2 12 2 12s0 3 .4 4.8a3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1C22 15 22 12 22 12s0-3-.4-4.8ZM10.2 15.4V8.6L16 12l-5.8 3.4Z" />
    </svg>
  )
}

export function SocialFabs() {
  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2 sm:right-6 sm:bottom-6">
      {socials.map((social) => (
        <a
          key={social.name}
          href={social.href}
          aria-label={social.name}
          target="_blank"
          rel="noreferrer noopener"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white shadow-lg ring-1 ring-black/20 transition hover:scale-105 hover:bg-accent-soft"
        >
          {social.name === 'Facebook' && <FacebookGlyph />}
          {social.name === 'TikTok' && <TikTokGlyph />}
          {social.name === 'Instagram' && <InstagramGlyph />}
          {social.name === 'YouTube' && <YouTubeGlyph />}
        </a>
      ))}
    </div>
  )
}
