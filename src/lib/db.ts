// Database client configuration for Supabase
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

export function getSupabaseServiceKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_KEY;
}

let _client: SupabaseClient<Database> | null = null;
let _adminClient: SupabaseClient<Database> | null = null;

/**
 * Resets cached Supabase singletons (used in testing environments).
 */
export function resetSupabaseClientsForTesting() {
  _client = null;
  _adminClient = null;
}

/**
 * Builds an anon-key Supabase client. When `accessToken` is provided, it is
 * forwarded as `Authorization: Bearer <token>` so PostgREST derives
 * `auth.uid()` and enforces Row Level Security for this caller only.
 */
function buildAnonClient(accessToken?: string | null): SupabaseClient<Database> {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'Supabase credentials are not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).',
      );
    }
    console.warn('⚠️ Supabase credentials not fully configured');
  }
  return createClient<Database>(url, key, {
    ...(accessToken ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } } : {}),
    auth: {
      // Managed explicitly by the app; do not persist to localStorage.
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Client for authentication and basic public queries.
// NOTE: The Supabase client disables session persistence (persistSession:
// false) because auth state is managed explicitly by the app; enabling the
// default localStorage persistence would duplicate session storage.
//
// SECURITY: the singleton is bound to whichever token first created it. It is
// therefore only safe on the browser (where "the current token" is always the
// local user's). On the server — where one runtime serves many users — code
// MUST use createRequestClient(token) instead; that guard is enforced below.
// `globalThis.__BTP_ALLOW_SERVER_ANON_CLIENT__` lets trusted server-side
// jobs (e.g. scheduled cleanup) opt into an explicit anon-context client.
export function getSupabase(): SupabaseClient<Database> {
  const allowServerAnon = Boolean(
    (globalThis as { __BTP_ALLOW_SERVER_ANON_CLIENT__?: boolean })
      .__BTP_ALLOW_SERVER_ANON_CLIENT__
  );
  if (typeof window === 'undefined' && !allowServerAnon) {
    throw new Error(
      'getSupabase() must not be called during a server request: its cached ' +
        'anon client carries no user token, so RLS cannot identify the caller. ' +
        'Use createRequestClient(accessToken) with the verified caller token ' +
        '(see lib/api-auth.ts) instead.',
    );
  }
  if (!_client) {
    _client = buildAnonClient();
  }
  return _client;
}

/**
 * Privileged admin client for server-side maintenance, migrations, and seeds only.
 * NEVER use in user route handlers or user request context.
 */
export function getSupabaseAdmin(): SupabaseClient<Database> | null {
  const serviceKey = getSupabaseServiceKey();
  const url = getSupabaseUrl();
  if (!_adminClient && serviceKey && url) {
    _adminClient = createClient<Database>(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _adminClient;
}

export const supabase = new Proxy({} as SupabaseClient<Database>, {
  // Browser-only singleton: every property access lazily resolves the
  // client-side anon client via getSupabase(). Never access this proxy from
  // server code paths that need the service-role key — use
  // getSupabaseAdmin() in server-only maintenance scripts instead.
  get: (_, prop) => getSupabase()[prop as keyof SupabaseClient<Database>],
});

/**
 * A Supabase client for database operations.
 *
 * Always enforces the user's privilege boundary:
 * - When an accessToken is provided, forwards `Authorization: Bearer <token>`
 *   so PostgREST sets `auth.uid()` and enforces Row Level Security (RLS).
 *   A fresh, request-scoped client is returned — never a shared singleton —
 *   so one caller's token can never leak into another caller's queries.
 * - When no token is provided, returns the public anonymous client (anon key,
 *   no Authorization header). RLS then applies with `auth.uid() IS NULL`.
 * - NEVER falls back to the service-role admin client during user requests.
 */
export function createRequestClient(accessToken?: string | null): SupabaseClient<Database> {
  if (!accessToken) {
    return getSupabase();
  }
  return buildAnonClient(accessToken);
}

// Type definitions
export interface Lesson {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category?: string;
  description?: string;
  is_word_drill: boolean;
  is_paragraph: boolean;
  content_type: 'text' | 'drills';
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export interface SingleDrill {
  display: string;
  key: string;
  keyCode: string;
  shift: boolean;
  fingerPosition?: number;
  fingerName?: string;
}

export interface LessonDrill {
  id: string;
  lesson_id: string;
  prompt: string;
  steps: SingleDrill[];
  drill_order?: number;
  created_at: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  wpm: number;
  accuracy: number;
  errors: number;
  time_elapsed: number;
  erred_characters: Array<{ char: string; count: number }>;
  session_timestamp: string;
  created_at: string;
}

export interface CharacterError {
  id: string;
  user_id: string;
  character: string;
  error_count: number;
  total_attempts: number;
  accuracy_rate: number;
  last_error_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomDrill {
  id: string;
  user_id: string;
  name?: string;
  characters: string;
  drill_data: { prompt: string; steps: SingleDrill[] }[];
  focus_characters: Record<string, number>; // {char: accuracy_rate}
  generated_at: string;
  last_used_at?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserLessonCompletion {
  id: string;
  user_id: string;
  lesson_id: string;
  times_completed: number;
  best_accuracy: number;
  best_wpm: number;
  last_completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface ParagraphContent {
  id: string;
  title: string;
  content: string;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  category?: string;
  created_at: string;
}

export interface WeakCharacterView {
  user_id: string;
  character: string;
  accuracy_rate: number;
  error_count: number;
  total_attempts: number;
  strength_level: 'Strong' | 'Good' | 'Weak' | 'Very Weak';
}

export interface UserStatistics {
  user_id: string;
  lessons_practiced: number;
  average_accuracy: number;
  average_wpm: number;
  best_wpm: number;
  best_accuracy: number;
  total_sessions: number;
}
