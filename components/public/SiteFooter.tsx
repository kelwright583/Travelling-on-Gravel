import Link from 'next/link'

const footerNav = [
  { href: '/dispatches', label: 'Dispatches' },
  { href: '/adventures', label: 'Adventures' },
  { href: '/films', label: 'Films' },
  { href: '/map', label: 'Map' },
]

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer role="contentinfo" className="mt-auto border-t border-line bg-ink-soft">
      <div className="mx-auto max-w-[1240px] px-6 py-12">
        <div className="mb-8 grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <p className="font-display mb-3 text-sm font-800 uppercase tracking-widest text-bone">
              Travelling on Gravel
            </p>
            <p className="max-w-xs text-xs leading-relaxed text-khaki">
              Less glamping. More gravel. Honest dispatches from the tracks less taken across
              Africa.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation">
            <p className="mb-3 text-xs font-700 uppercase tracking-widest text-khaki-deep">
              Explore
            </p>
            <ul className="space-y-2">
              {footerNav.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-xs text-khaki transition-colors hover:text-bone"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Newsletter teaser */}
          <div>
            <p className="mb-3 text-xs font-700 uppercase tracking-widest text-khaki-deep">
              Dispatches to your inbox
            </p>
            <p className="mb-4 text-xs leading-relaxed text-khaki">
              No algorithms. No sponsored fluff. Just honest gravel dispatches.
            </p>
            <Link
              href="/#newsletter"
              className="inline-block rounded border border-accent px-4 py-2 text-xs font-700 uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-bone"
            >
              Subscribe
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-line pt-6 text-xs text-khaki-deep md:flex-row md:items-center">
          <p>&copy; {year} Travelling on Gravel. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-khaki">
              Privacy Policy
            </Link>
            <Link href="/admin" className="hover:text-khaki">
              Base Camp
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
