import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

let _adminClient: ReturnType<typeof createClient> | null = null;

// Service role client for admin operations (server-side only)
export function getSupabaseAdmin() {
  if (!_adminClient) _adminClient = createClient(supabaseUrl, supabaseServiceKey);
  return _adminClient;
}

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get: (_, prop) => getSupabaseAdmin()[prop as keyof ReturnType<typeof createClient>],
});
