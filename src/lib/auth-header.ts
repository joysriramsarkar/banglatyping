/**
 * Name of the header that carries the caller's Supabase access token.
 *
 * Shared by the server (`lib/api-auth.ts`) and the browser (`lib/api-client.ts`)
 * so the two sides can never drift apart.
 */
export const SUPABASE_AUTH_HEADER = 'x-supabase-access-token';
