/**
 * Minimal Supabase Database type for banglatyping.
 *
 * Table keys are the snake_case table/view names used in code
 * (via `.from('…')`). Each table exposes Row/Insert/Update.
 * Views expose Row only (read-only).
 *
 * NOTE: rows are `type` aliases (not interfaces) so they stay
 * assignable to the client's `Record<string, unknown>` constraint,
 * and every table/view carries `Relationships` to satisfy GenericSchema.
 */

export type ErredCharacterJson = {
  char: string;
  count: number;
};

export type DrillStepJson = {
  display: string;
  key: string;
  keyCode: string;
  shift: boolean;
  fingerPosition?: number;
  fingerName?: string;
};

export type DrillJson = {
  prompt: string;
  steps: DrillStepJson[];
};

export type UserProgressRow = {
  id: string;
  user_id: string;
  lesson_id: string | null;
  wpm: number;
  accuracy: number;
  errors: number;
  time_elapsed: number;
  erred_characters: ErredCharacterJson[];
  attempted_characters: ErredCharacterJson[] | null;
  session_timestamp: string;
  created_at: string;
};

export type CharacterErrorRow = {
  id: string;
  user_id: string;
  character: string;
  error_count: number;
  total_attempts: number;
  accuracy_rate: number;
  last_error_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UserLessonCompletionRow = {
  id: string;
  user_id: string;
  lesson_id: string;
  times_completed: number;
  best_accuracy: number;
  best_wpm: number;
  last_completed_at: string;
  created_at: string;
  updated_at: string;
};

export type CertificateRow = {
  id: string;
  verification_id: string;
  user_id: string | null;
  recipient_name: string | null;
  gpm: number | null;
  wpm: number | null;
  accuracy: number | null;
  layout: string | null;
  issued_at: string | null;
};

export type PublicCertificateRow = {
  verification_id: string;
  recipient_name: string | null;
  gpm: number | null;
  wpm: number | null;
  accuracy: number | null;
  layout: string | null;
  issued_at: string | null;
};

export type SkillMasteryRow = {
  id: string;
  user_id: string;
  skill_id: string;
  status: string;
  strength: number | null;
  success_count: number | null;
  failure_count: number | null;
  stability: number | null;
  last_practiced: string | null;
  next_review_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CustomDrillRow = {
  id: string;
  user_id: string;
  name: string | null;
  characters: string;
  drill_data: DrillJson[];
  focus_characters: Record<string, number>;
  generated_at: string;
  last_used_at: string | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
};

export type LessonRow = {
  id: string;
  title: string;
  level: string;
  category: string | null;
  description: string | null;
  is_word_drill: boolean;
  is_paragraph: boolean;
  content_type: string;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
};

export type LessonDrillRow = {
  id: string;
  lesson_id: string;
  prompt: string;
  steps: DrillStepJson[];
  drill_order: number | null;
  created_at: string;
};

export type TestResultRow = {
  id: string;
  user_id: string;
  lesson_id: string | null;
  wpm: number;
  accuracy: number;
  created_at: string;
};

export type WeakCharacterViewRow = {
  user_id: string;
  character: string;
  accuracy_rate: number;
  error_count: number;
  total_attempts: number;
  strength_level: string;
};

export type UserStatisticsViewRow = {
  user_id: string;
  lessons_practiced: number;
  average_accuracy: number;
  average_wpm: number;
  best_wpm: number;
  best_accuracy: number;
  total_sessions: number;
};

export type SubscriptionRow = {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type RaceResultRow = {
  id: string;
  room_id: string;
  user_id: string | null;
  wpm: number;
  accuracy: number;
  position: number | null;
  finished_at: string;
};

type Table<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
};

type View<T> = {
  Row: T;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      user_progress: Table<UserProgressRow>;
      character_errors: Table<CharacterErrorRow>;
      user_lesson_completion: Table<UserLessonCompletionRow>;
      certificates: Table<CertificateRow>;
      skill_mastery: Table<SkillMasteryRow>;
      custom_drills: Table<CustomDrillRow>;
      lessons: Table<LessonRow>;
      lesson_drills: Table<LessonDrillRow>;
      test_results: Table<TestResultRow>;
      subscriptions: Table<SubscriptionRow>;
      race_results: Table<RaceResultRow>;
    };
    Views: {
      public_certificates: View<PublicCertificateRow>;
      user_weak_characters: View<WeakCharacterViewRow>;
      user_statistics: View<UserStatisticsViewRow>;
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
