import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Map Pins | Base Camp' }

export default async function PinsAdminPage() {
  const supabase = await createClient()
  const { data: pins } = await supabase
    .from('map_pins')
    .select('id, label, lat, lng, category, country')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-700 uppercase tracking-widest text-accent">Base Camp</p>
          <h1 className="font-display text-2xl font-800 uppercase tracking-tight text-bone">
            Map Pins
          </h1>
        </div>
        <Link
          href="/admin/pins/new"
          className="rounded border border-accent px-4 py-2 text-xs font-700 uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-bone"
        >
          + Drop a Pin
        </Link>
      </div>

      {pins && pins.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-ink-soft">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Label</th>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Category</th>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Country</th>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Coords</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pins.map((pin) => (
                <tr key={pin.id} className="group hover:bg-ink-soft transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/pins/${pin.id}`}
                      className="font-600 text-bone group-hover:text-accent transition-colors"
                    >
                      {pin.label}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-khaki-deep">{pin.category ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-khaki-deep">{pin.country ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs text-khaki-deep">
                    {pin.lat.toFixed(4)}, {pin.lng.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-khaki">No pins yet. Drop your first one.</p>
      )}
    </div>
  )
}
