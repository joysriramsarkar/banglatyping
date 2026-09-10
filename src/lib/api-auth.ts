// Server-side request authentication for API route handlers.
//
// The browser sends the caller's Supabase access token in the
// SUPABASE_AUTH_HEADER header (see lib/api-client.ts). We hand that token to
// Supabase to verify it and learn who is calling, then let each route compare
// the verified user id against the resource it was asked for.
//
// The verified token is handed back so routes can forward it to the database
// layer (lib/db.ts#createRequestClient). That is what makes Row Level Security
// policies work: PostgREST derives auth.uid() from this token.
//
// IMPORTANT: this module runs in server components / route handlers only.
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';
import { SUPABASE_AUTH_HEADER } from './auth-header';

export interface AuthContext {
  /** The verified caller. */
  user: User;
  /** The caller's access token, safe to forward to the database layer. */
  accessToken: string;
}

let _verifier: SupabaseClient | null = null;

/**
 * A single throwaway Supabase client used only to verify access tokens.
 * Sessions are never persisted, so verifying one caller's token can never
 * leak into the next request.
 */
function getAuthVerifier(): SupabaseClient {
  if (!_verifier) {
    _verifier = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }
  return _verifier;
}

/**
 * Verifies the caller and returns their user + access token, or `null` when the
 * request carries no token or an invalid/expired one. Never throws.
 */
export async function authenticate(request: NextRequest): Promise<AuthContext | null> {
  const accessToken = request.headers.get(SUPABASE_AUTH_HEADER);

  if (!accessToken) {
    return null;
  }

  const { data: { user }, error } = await getAuthVerifier().auth.getUser(accessToken);

  if (error || !user) {
    return null;
  }

  return { user, accessToken };
}

/**
 * True when the verified caller is allowed to act on `requestedUserId`.
 * A missing or mismatched id is a rejection — the caller may only ever
 * address their own data.
 */
export function isOwnResource(user: User, requestedUserId: string | null | undefined): boolean {
  return Boolean(requestedUserId) && requestedUserId === user.id;
}
