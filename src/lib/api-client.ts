// Browser-side helper for calling our own API routes.
//
// Every route that touches a user's data expects the caller's Supabase access
// token (see lib/api-auth.ts). Use `apiFetch` instead of `fetch` for those
// calls and the token is attached for you.
import { supabase } from './db';
import { SUPABASE_AUTH_HEADER } from './auth-header';

/** Returns the header carrying the current session's access token. */
export async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return { [SUPABASE_AUTH_HEADER]: session?.access_token ?? '' };
}

/**
 * `fetch()` with the caller's Supabase token attached.
 * Any headers passed in `init` are preserved.
 */
export async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const auth = await authHeaders();

  for (const [name, value] of Object.entries(auth)) {
    headers.set(name, value);
  }

  return fetch(url, { ...init, headers });
}
