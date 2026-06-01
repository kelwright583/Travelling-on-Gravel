import { AdminLoginForm } from './AdminLoginForm'

export const metadata = { title: 'Base Camp Login | Travelling on Gravel' }

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <p className="font-display mb-1 text-xs font-700 uppercase tracking-widest text-accent">
            Base Camp
          </p>
          <h1 className="font-display text-3xl font-900 uppercase tracking-tight text-bone">
            Sign In
          </h1>
        </div>

        <div className="rounded-lg border border-line bg-ink-soft p-8">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  )
}
