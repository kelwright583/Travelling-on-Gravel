import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Cast Iron | Base Camp' }

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function CastIronAdminPage() {
  const supabase = await createClient()
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, slug, difficulty, cook_method, published, published_at, updated_at, ai_reviewed')
    .order('updated_at', { ascending: false })

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="mb-1 text-xs font-700 uppercase tracking-widest text-accent">Base Camp</p>
          <h1 className="font-display text-2xl font-800 uppercase tracking-tight text-bone">
            Cast Iron
          </h1>
        </div>
        <Link
          href="/admin/cast-iron/new"
          className="rounded border border-accent px-4 py-2 text-xs font-700 uppercase tracking-widest text-accent transition-colors hover:bg-accent hover:text-bone"
        >
          + New Recipe
        </Link>
      </div>

      {recipes && recipes.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-line">
          <table className="w-full text-sm">
            <thead className="border-b border-line bg-ink-soft">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Title</th>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Method</th>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Difficulty</th>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">AI</th>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Status</th>
                <th className="px-4 py-3 text-left text-[10px] font-700 uppercase tracking-widest text-khaki-deep">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recipes.map((recipe) => {
                const title =
                  typeof recipe.title === 'object' && recipe.title !== null
                    ? (recipe.title as { en?: string }).en
                    : String(recipe.title)
                return (
                  <tr key={recipe.id} className="group transition-colors hover:bg-ink-soft">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/cast-iron/${recipe.id}`}
                        className="font-600 text-bone transition-colors group-hover:text-accent"
                      >
                        {title || '(untitled)'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs capitalize text-khaki-deep">
                      {recipe.cook_method?.replace('-', ' ')}
                    </td>
                    <td className="px-4 py-3 text-xs capitalize text-khaki-deep">{recipe.difficulty}</td>
                    <td className="px-4 py-3">
                      {recipe.ai_reviewed ? (
                        <span className="text-xs text-accent">✓</span>
                      ) : (
                        <span className="text-xs text-khaki-deep">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-700 uppercase tracking-widest ${
                          recipe.published ? 'bg-olive/30 text-accent' : 'bg-ink-soft text-khaki-deep'
                        }`}
                      >
                        {recipe.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-khaki-deep">
                      {formatDate(recipe.published_at ?? recipe.updated_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-khaki">No recipes yet. Fire up the cast iron.</p>
      )}
    </div>
  )
}
