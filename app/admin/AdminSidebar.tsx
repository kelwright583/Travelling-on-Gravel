'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Image,
  FileText,
  Film,
  Map,
  Palette,
  Settings,
  LogOut,
  ExternalLink,
  Mountain,
  Flame,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/hero', label: 'Hero', icon: Mountain },
  { href: '/admin/photos', label: 'Photos', icon: Image },
  { href: '/admin/field-work', label: 'Field Work', icon: FileText },
  { href: '/admin/cast-iron', label: 'Cast Iron', icon: Flame },
  { href: '/admin/adventures', label: 'Adventures', icon: Map },
  { href: '/admin/films', label: 'Films', icon: Film },
  { href: '/admin/pins', label: 'Map Pins', icon: Map },
  { href: '/admin/theme', label: 'Theme', icon: Palette },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="sticky top-0 flex h-screen w-56 flex-col border-r border-line bg-ink-soft">
      {/* Logo */}
      <div className="border-b border-line px-5 py-5">
        <p className="font-display text-xs font-800 uppercase tracking-widest text-accent">
          Base Camp
        </p>
        <p className="mt-0.5 text-[10px] text-khaki-deep">Travelling on Gravel</p>
      </div>

      {/* Nav */}
      <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto py-3">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-5 py-2.5 text-xs font-600 uppercase tracking-widest transition-colors',
                active ? 'text-bone bg-ink' : 'text-khaki hover:text-bone hover:bg-ink/50',
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={14} strokeWidth={2} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer actions */}
      <div className="border-t border-line p-3 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-2 py-2 text-xs text-khaki-deep hover:text-khaki transition-colors rounded"
        >
          <ExternalLink size={13} />
          View Site
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded px-2 py-2 text-xs text-khaki-deep hover:text-red-400 transition-colors"
        >
          <LogOut size={13} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
