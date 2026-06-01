import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { t } from '@/lib/i18n/types'

export const metadata = { title: 'Dispatches | Base Camp' }

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function DispatchesAdminPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, published, published_at, updated_at')
    .order('updated_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-700 uppercase tracking-widest text-accent">Base Camp</p>
          <h1 className="font-display text-2xl font-800 uppercase tracking-tight text-bone">
            Dispatches
          </h1>
        </div>
        <Link
          href="/admin/dispatches/new"
          className="rounded border border-accent px-4 py-2 text-xs font-700 uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-bone"
        >
          + New Dispatch
        </Link>
      </div>

      {posts && posts.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-ink-soft">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {posts.map((post) => (
                <tr key={post.id} className="group hover:bg-ink-soft transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/dispatches/${post.id}`}
                      className="font-600 text-bone group-hover:text-accent transition-colors"
                    >
                      {t(post.title, 'en') || '(untitled)'}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-khaki-deep">{post.slug}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-700 uppercase tracking-widest ${
                        post.published
                          ? 'bg-olive/30 text-accent'
                          : 'bg-ink-soft text-khaki-deep'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-khaki-deep">
                    {formatDate(post.published_at ?? post.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-khaki">No dispatches yet. Create your first one.</p>
      )}
    </div>
  )
}
