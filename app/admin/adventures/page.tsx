import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { t } from '@/lib/i18n/types'

export const metadata = { title: 'Adventures | Base Camp' }

export default async function AdventuresAdminPage() {
  const supabase = await createClient()
  const { data: adventures } = await supabase
    .from('adventures')
    .select('id, title, slug, country, published, sort_order')
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-700 uppercase tracking-widest text-accent">Base Camp</p>
          <h1 className="font-display text-2xl font-800 uppercase tracking-tight text-bone">
            Adventures
          </h1>
        </div>
        <Link
          href="/admin/adventures/new"
          className="rounded border border-accent px-4 py-2 text-xs font-700 uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-bone"
        >
          + New Adventure
        </Link>
      </div>

      {adventures && adventures.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-ink-soft">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">
                  Country
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">
                  Order
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {adventures.map((adv) => (
                <tr key={adv.id} className="group hover:bg-ink-soft transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/adventures/${adv.id}`}
                      className="font-600 text-bone group-hover:text-accent transition-colors"
                    >
                      {t(adv.title, 'en') || '(untitled)'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-xs text-khaki-deep">{adv.country ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-khaki-deep">{adv.sort_order ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-700 uppercase tracking-widest ${
                        adv.published
                          ? 'bg-olive/30 text-accent'
                          : 'bg-ink-soft text-khaki-deep'
                      }`}
                    >
                      {adv.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-khaki">No adventures yet. Create your first one.</p>
      )}
    </div>
  )
}
