'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { PwaInstallButton } from './PwaInstallButton'

export function SiteNav() {
  const t = useTranslations('nav')

  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const navLinks = [
    { href: '/field-work' as const, label: t('fieldWork') },
    { href: '/cast-iron' as const, label: t('castIron') },
    { href: '/adventures' as const, label: t('adventures') },
    { href: '/films' as const, label: t('films') },
    { href: '/map' as const, label: t('map') },
  ]

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close menu on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 900) setMenuOpen(false)
    }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <header
      role="banner"
      className={[
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-ink/95 shadow-[0_1px_0_var(--line)] backdrop-blur-sm'
          : 'bg-transparent',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Travelling on Gravel — home"
          className="flex-shrink-0"
        >
          <Image
            src="/brand/logo-full.png"
            alt="Travelling on Gravel"
            height={44}
            width={44}
            className="h-11 w-auto rounded-full"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-xs font-600 uppercase tracking-widest text-khaki transition-colors hover:text-bone"
            >
              {label}
            </Link>
          ))}
          <Link
            href="/field-work#newsletter"
            className="rounded border border-accent px-4 py-1.5 text-xs font-700 uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-bone"
          >
            {t('subscribe')}
          </Link>
          <PwaInstallButton />
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="flex flex-col gap-1.5 p-2 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span
            className={[
              'block h-px w-6 bg-bone transition-transform duration-200',
              menuOpen ? 'translate-y-[7px] rotate-45' : '',
            ].join(' ')}
          />
          <span
            className={[
              'block h-px w-6 bg-bone transition-opacity duration-200',
              menuOpen ? 'opacity-0' : '',
            ].join(' ')}
          />
          <span
            className={[
              'block h-px w-6 bg-bone transition-transform duration-200',
              menuOpen ? '-translate-y-[7px] -rotate-45' : '',
            ].join(' ')}
          />
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="false"
        aria-label="Mobile navigation"
        className={[
          'overflow-hidden transition-all duration-300 md:hidden',
          menuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0',
          'bg-ink-soft',
        ].join(' ')}
      >
        <nav className="flex flex-col gap-0 px-6 py-4">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="border-b border-line py-4 text-sm font-600 uppercase tracking-widest text-khaki"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/field-work#newsletter"
            className="mt-4 inline-block rounded border border-accent px-4 py-2 text-center text-xs font-700 uppercase tracking-widest text-accent"
            onClick={() => setMenuOpen(false)}
          >
            {t('subscribe')}
          </Link>
        </nav>
      </div>
    </header>
  )
}
