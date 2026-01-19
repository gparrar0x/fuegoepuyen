import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  if (typeof window === 'undefined') {
    // Return a dummy client for SSR/build - will be replaced on client
    return null as unknown as ReturnType<typeof createBrowserClient<Database>>;
  }

  if (client) {
    return client;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase environment variables not configured');
    return null as unknown as ReturnType<typeof createBrowserClient<Database>>;
  }

  client = createBrowserClient<Database>(supabaseUrl, supabaseKey);
  return client;
}
