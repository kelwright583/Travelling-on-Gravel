import { SiteNav } from '@/components/public/SiteNav'
import { SiteFooter } from '@/components/public/SiteFooter'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main id="main-content" tabIndex={-1} className="flex flex-1 flex-col">
        {children}
      </main>
      <SiteFooter />
    </>
  )
}
