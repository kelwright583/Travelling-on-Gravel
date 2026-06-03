import { SiteNav } from '@/components/public/SiteNav'
import { SiteFooter } from '@/components/public/SiteFooter'
import { ScrollRevealObserver } from '@/components/public/ScrollRevealObserver'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
      <ScrollRevealObserver />
    </>
  )
}
