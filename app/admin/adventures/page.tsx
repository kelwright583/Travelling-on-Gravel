import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { t } from '@/lib/i18n/types'

export const metadata = { title: 'Adventures | Base Camp' }

export default async function AdventuresAdminPage() {
  const supabase = await createClient()
  const { data: adventures } = await supabase
    .from('adventures')
    .select('id, title, slug, country, published, sort_order, status, start_date, end_date')
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
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Title</th>
                <th className="hidden px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep sm:table-cell">Country</th>
                <th className="hidden px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep md:table-cell">Dates</th>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Trip status</th>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {adventures.map((adv) => {
                const tripStatus = (adv as { status?: string }).status ?? 'planning'
                const statusMeta: Record<string, { label: string; cls: string }> = {
                  planning: { label: 'Planning', cls: 'bg-ink-soft text-khaki-deep' },
                  active: { label: 'On the road', cls: 'bg-yellow-400/10 text-yellow-400' },
                  completed: { label: 'Completed', cls: 'bg-olive/30 text-accent' },
                }
                const sm = statusMeta[tripStatus] ?? statusMeta.planning
                const startDate = (adv as { start_date?: string }).start_date
                const endDate = (adv as { end_date?: string }).end_date
                return (
                  <tr key={adv.id} className="group transition-colors hover:bg-ink-soft">
                    <td className="px-4 py-3">
                      <Link href={`/admin/adventures/${adv.id}`} className="font-600 text-bone transition-colors group-hover:text-accent">
                        {t(adv.title, 'en') || '(untitled)'}
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-khaki-deep sm:table-cell">{adv.country ?? '—'}</td>
                    <td className="hidden px-4 py-3 text-xs text-khaki-deep md:table-cell">
                      {startDate ? new Date(startDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      {startDate && endDate && ' → '}
                      {endDate ? new Date(endDate).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-700 uppercase tracking-widest ${sm.cls}`}>
                        {sm.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-700 uppercase tracking-widest ${adv.published ? 'bg-olive/30 text-accent' : 'bg-ink-soft text-khaki-deep'}`}>
                        {adv.published ? 'Live' : 'Draft'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-khaki">No adventures yet. Create your first one.</p>
      )}
    </div>
  )
}
