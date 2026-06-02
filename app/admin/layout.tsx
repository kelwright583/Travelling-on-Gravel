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
    <div className="flex min-h-screen bg-ink">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <main className="flex-1 overflow-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
