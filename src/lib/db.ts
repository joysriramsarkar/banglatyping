// Database client configuration for Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Supabase credentials not fully configured');
}

let _client: ReturnType<typeof createClient> | null = null;
let _adminClient: ReturnType<typeof createClient> | null = null;

// Client for authentication and basic queries
export function getSupabase() {
  if (!_client) _client = createClient(supabaseUrl, supabaseKey);
  return _client;
}

// Service role client for admin operations (server-side only)
export function getSupabaseAdmin() {
  if (!_adminClient) _adminClient = createClient(supabaseUrl, supabaseServiceKey);
  return _adminClient;
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get: (_, prop) => getSupabase()[prop as keyof ReturnType<typeof createClient>],
});

export const supabaseAdmin = new Proxy({} as ReturnType<typeof createClient>, {
  get: (_, prop) => getSupabaseAdmin()[prop as keyof ReturnType<typeof createClient>],
});

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
