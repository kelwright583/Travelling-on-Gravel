import { createClient } from '@/lib/supabase/server'

/**
 * Returns the authenticated user or null.
 * All /api/ai/* routes call this — unauthenticated requests get 401.
 */
export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
