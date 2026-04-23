import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Public anon client for unauthenticated read-only endpoints.
 * Enforces RLS — cannot bypass policies.
 * Use for public API routes that expose data intended to be world-readable
 * (e.g. verified fire reports, CAP feeds, health checks).
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
