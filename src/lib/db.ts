// Database client configuration for Supabase
import { createClient } from '@supabase/supabase-js';

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

export function getSupabaseServiceKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_KEY;
}

let _client: ReturnType<typeof createClient> | null = null;
let _adminClient: ReturnType<typeof createClient> | null = null;

/**
 * Resets cached Supabase singletons (used in testing environments).
 */
export function resetSupabaseClientsForTesting() {
  _client = null;
  _adminClient = null;
}

// Client for authentication and basic public queries
export function getSupabase() {
  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!_client) {
    if (!url || !key) {
      console.warn('⚠️ Supabase credentials not fully configured');
    }
    _client = createClient(url, key);
  }
  return _client;
}

/**
 * Privileged admin client for server-side maintenance, migrations, and seeds only.
 * NEVER use in user route handlers or user request context.
 */
export function getSupabaseAdmin() {
  const serviceKey = getSupabaseServiceKey();
  const url = getSupabaseUrl();
  if (!_adminClient && serviceKey && url) {
    _adminClient = createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _adminClient;
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get: (_, prop) => getSupabase()[prop as keyof ReturnType<typeof createClient>],
});

/**
 * A Supabase client for database operations.
 *
 * Always enforces the user's privilege boundary:
 * - When an accessToken is provided, forwards `Authorization: Bearer <token>`
 *   so PostgREST sets `auth.uid()` and enforces Row Level Security (RLS).
 * - When no token is provided, returns the public anonymous client.
 * - NEVER falls back to service role admin client during normal user requests.
 */
export function createRequestClient(accessToken?: string | null): ReturnType<typeof createClient> {
  if (!accessToken) {
    return getSupabase();
  }

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();

  return createClient(url, key, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
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
