import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { Hero } from '@/components/public/Hero'
import { StatsStrip } from '@/components/public/StatsStrip'
import { AdventuresCarousel } from '@/components/public/AdventuresCarousel'
import { FieldWorkPreview } from '@/components/public/FieldWorkPreview'
import { CastIronPreview } from '@/components/public/CastIronPreview'
import { FilmsStrip } from '@/components/public/FilmsStrip'
import { MapPlaceholder } from '@/components/public/MapPlaceholder'
import { NewsletterForm } from '@/components/public/NewsletterForm'

// ISR — revalidate every hour; on-demand revalidation triggered by admin saves
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('site_settings')
    .select('hero_line1, hero_subtitle')
    .single()

  const line1 =
    settings?.hero_line1 &&
    typeof settings.hero_line1 === 'object' &&
    !Array.isArray(settings.hero_line1)
      ? String((settings.hero_line1 as Record<string, unknown>)['en'] ?? '')
      : 'Travelling on Gravel'

  return {
    title: 'Travelling on Gravel — Overland Africa',
    description: line1,
    openGraph: {
      title: 'Travelling on Gravel',
      description: line1,
      type: 'website',
    },
  }
}

export default async function HomePage() {
  const supabase = await createClient()
  const t = await getTranslations('newsletter')

  // Parallel data fetching
  const [settingsRes, adventuresRes, postsRes, recipesRes, filmsRes, pinsRes] =
    await Promise.allSettled([
      supabase.from('site_settings').select('*').single(),
      supabase
        .from('adventures')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .limit(6),
      supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(3),
      supabase
        .from('recipes')
        .select('id, slug, title, subtitle, cover_image, prep_minutes, cook_minutes, total_minutes, servings, difficulty, cook_method, ingredients, tags, published_at')
        .eq('published', true)
        .order('published_at', { ascending: false })
        .limit(3),
      supabase
        .from('films')
        .select('*')
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .limit(6),
      supabase.from('map_pins').select('id, label, lat, lng, category, country, note, related_post_id'),
    ])

  const settings =
    settingsRes.status === 'fulfilled' ? (settingsRes.value.data ?? null) : null
  const adventures =
    adventuresRes.status === 'fulfilled' ? (adventuresRes.value.data ?? []) : []
  const posts = postsRes.status === 'fulfilled' ? (postsRes.value.data ?? []) : []
  const recipes = recipesRes.status === 'fulfilled' ? (recipesRes.value.data ?? []) : []
  const films = filmsRes.status === 'fulfilled' ? (filmsRes.value.data ?? []) : []
  const rawPins = pinsRes.status === 'fulfilled' ? (pinsRes.value.data ?? []) : []
  const mapPins = rawPins.map((p) => ({
    id: p.id,
    label: p.label,
    lat: p.lat,
    lng: p.lng,
    category: p.category,
    country: p.country,
    note: p.note ? String((p.note as Record<string, unknown>)['en'] ?? '') : null,
    related_post_id: p.related_post_id,
  }))

  if (!settings) {
    console.warn('[HomePage] site_settings not seeded — rendering empty states')
  }

  return (
    <>
      {/* 1. Hero */}
      <Hero settings={settings} />

      {/* 2. Stats strip */}
      <StatsStrip stats={(settings?.stats ?? []) as Parameters<typeof StatsStrip>[0]['stats']} />

      {/* 3. Adventures carousel */}
      <AdventuresCarousel adventures={adventures} />

      {/* 4. Field Work preview */}
      <FieldWorkPreview posts={posts} />

      {/* 5. Cast Iron preview */}
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <CastIronPreview recipes={recipes as any} />

      {/* 6. Map section — embedded Google Map */}
      <MapPlaceholder pins={mapPins} />

      {/* 7. Films strip */}
      <FilmsStrip films={films} />

      {/* 8. Newsletter section */}
      <section id="newsletter" aria-label="Newsletter" className="bg-ink py-20">
        <div className="mx-auto max-w-[600px] px-6 text-center">
          <div className="hazard mb-10" aria-hidden="true" />
          <p className="mb-2 text-xs font-700 uppercase tracking-widest text-accent">
            {t('eyebrow')}
          </p>
          <h2 className="font-display mb-4 text-4xl font-900 uppercase leading-tight tracking-tight text-bone">
            {t('heading').split('\n').map((line, i) => (
              <span key={i} className={i > 0 ? 'block' : undefined}>{line}</span>
            ))}
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-khaki">
            {t('body')}
          </p>
          <NewsletterForm source="hero" />
          <p className="mt-4 text-[10px] text-khaki-deep">{t('consent')}</p>
        </div>
      </section>
    </>
  )
}
