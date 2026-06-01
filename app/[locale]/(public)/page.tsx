import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { Hero } from '@/components/public/Hero'
import { StatsStrip } from '@/components/public/StatsStrip'
import { AdventuresCarousel } from '@/components/public/AdventuresCarousel'
import { DispatchesPreview } from '@/components/public/DispatchesPreview'
import { FilmsStrip } from '@/components/public/FilmsStrip'
import { MapPlaceholder } from '@/components/public/MapPlaceholder'
import { NewsletterForm } from '@/components/public/NewsletterForm'

// ISR — revalidate every hour; on-demand revalidation triggered by admin saves (Phase 5)
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
      : 'Less Glamping, More Gravel'

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

  // Parallel data fetching
  const [settingsRes, adventuresRes, postsRes, filmsRes, pinsRes] = await Promise.allSettled([
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
      .from('films')
      .select('*')
      .eq('published', true)
      .order('sort_order', { ascending: true })
      .limit(6),
    supabase.from('map_pins').select('id', { count: 'exact', head: true }),
  ])

  const settings =
    settingsRes.status === 'fulfilled' ? (settingsRes.value.data ?? null) : null
  const adventures =
    adventuresRes.status === 'fulfilled' ? (adventuresRes.value.data ?? []) : []
  const posts = postsRes.status === 'fulfilled' ? (postsRes.value.data ?? []) : []
  const films = filmsRes.status === 'fulfilled' ? (filmsRes.value.data ?? []) : []
  const pinCount =
    pinsRes.status === 'fulfilled' ? (pinsRes.value.count ?? 0) : 0

  // Fallback settings if DB not yet seeded
  const defaultSettings = {
    id: true as const,
    hero_line1: { en: 'LESS GLAMPING.' } as Record<string, unknown>,
    hero_line2: { en: 'MORE GRAVEL.' } as Record<string, unknown>,
    hero_subtitle: {
      en: 'Honest dispatches from the tracks less taken across Africa.',
    } as Record<string, unknown>,
    hero_location: 'KAOKOLAND, NAMIBIA',
    hero_coords: '',
    hero_image: null,
    theme: {} as Record<string, unknown>,
    fonts: { display: 'Montserrat', body: 'Inter' } as Record<string, unknown>,
    socials: {} as Record<string, unknown>,
    stats: [] as unknown[],
    updated_at: null,
  }

  const resolvedSettings = settings ?? defaultSettings

  return (
    <>
      {/* 1. Hero */}
      {/* @ts-expect-error — Json vs typed jsonb; safe at runtime */}
      <Hero settings={resolvedSettings} />

      {/* 2. Stats strip */}
      <StatsStrip stats={resolvedSettings.stats as Parameters<typeof StatsStrip>[0]['stats']} />

      {/* 3. Adventures carousel */}
      <AdventuresCarousel adventures={adventures} />

      {/* 4. Dispatches preview */}
      <DispatchesPreview posts={posts} />

      {/* 5. Map placeholder (Phase 7 → full Google Map) */}
      <MapPlaceholder pinCount={pinCount} />

      {/* 6. Films strip */}
      <FilmsStrip films={films} />

      {/* 7. Newsletter section */}
      <section id="newsletter" aria-label="Newsletter" className="bg-ink py-20">
        <div className="mx-auto max-w-[600px] px-6 text-center">
          <div className="hazard mb-10" aria-hidden="true" />
          <p className="mb-2 text-xs font-700 uppercase tracking-widest text-accent">
            Own your audience
          </p>
          <h2 className="font-display mb-4 text-4xl font-900 uppercase leading-tight tracking-tight text-bone">
            Gravel Dispatches
            <br />
            to Your Inbox
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-khaki">
            No algorithms. No sponsored fluff. Honest dispatches sent when there&apos;s
            something worth saying — not on a schedule because some marketing calendar said so.
          </p>
          <NewsletterForm source="hero" />
          <p className="mt-4 text-[10px] text-khaki-deep">
            Double opt-in. Unsubscribe any time. Your data stays here.
          </p>
        </div>
      </section>
    </>
  )
}
