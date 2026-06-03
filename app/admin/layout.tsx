import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from './AdminSidebar'

export const metadata = { title: 'Base Camp | Travelling on Gravel' }

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') ?? ''

  // Login page — skip all auth checks (middleware handles protection of other routes)
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <>{children}</>
  }

  // Role check — must be admin or editor
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single<{ role: string }>()

  if (!profile || !['admin', 'editor'].includes(profile.role)) {
    // Redirect to login with error — but NOT back into the admin shell
    redirect('/admin/login?error=unauthorized')
  }

  return (
    <div className="min-h-screen bg-ink lg:flex">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
