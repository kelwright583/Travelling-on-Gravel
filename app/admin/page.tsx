import { createClient } from '@/lib/supabase/server'
import { Image, FileText, Film, MapPin, Users } from 'lucide-react'
import Link from 'next/link'

const quickActions = [
  { href: '/admin/dispatches/new', label: 'New Dispatch' },
  { href: '/admin/adventures/new', label: 'New Adventure' },
  { href: '/admin/films/new', label: 'Add Film' },
  { href: '/admin/pins', label: 'Drop a Pin' },
]

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch KPI counts in parallel
  const [photos, posts, films, pins, subscribers] = await Promise.all([
    supabase.from('media_assets').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('films').select('*', { count: 'exact', head: true }),
    supabase.from('map_pins').select('*', { count: 'exact', head: true }),
    supabase
      .from('subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'confirmed'),
  ])

  const tiles = [
    {
      label: 'Photos',
      count: photos.count ?? 0,
      icon: Image,
      href: '/admin/photos',
      color: 'text-khaki',
    },
    {
      label: 'Dispatches',
      count: posts.count ?? 0,
      icon: FileText,
      href: '/admin/dispatches',
      color: 'text-olive-2',
    },
    {
      label: 'Films',
      count: films.count ?? 0,
      icon: Film,
      href: '/admin/films',
      color: 'text-accent',
    },
    {
      label: 'Map Pins',
      count: pins.count ?? 0,
      icon: MapPin,
      href: '/admin/pins',
      color: 'text-khaki',
    },
    {
      label: 'Subscribers',
      count: subscribers.count ?? 0,
      icon: Users,
      href: '/admin/settings',
      color: 'text-accent',
    },
  ]

  return (
    <div>
      <h1 className="font-display mb-8 text-2xl font-800 uppercase tracking-tight text-bone">
        Dashboard
      </h1>

      {/* KPI tiles */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map(({ label, count, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="group rounded-lg border border-line bg-ink-soft p-5 transition-colors hover:border-accent/40"
          >
            <Icon size={20} className={`mb-3 ${color}`} />
            <p className="text-2xl font-700 text-bone">{count.toLocaleString()}</p>
            <p className="mt-0.5 text-xs text-khaki-deep">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-display mb-4 text-xs font-700 uppercase tracking-widest text-khaki-deep">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded border border-accent px-4 py-2 text-xs font-700 uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-bone"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
