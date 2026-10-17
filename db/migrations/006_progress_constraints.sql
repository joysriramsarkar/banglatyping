-- ============================================================================
-- 006_progress_constraints.sql
--
-- Clamp user_progress to physically possible values at the schema level so a
-- forged payload cannot persist absurd rows even if app validation is bypassed.
-- ============================================================================

-- Accuracy is a percentage.
ALTER TABLE user_progress
  DROP CONSTRAINT IF EXISTS user_progress_accuracy_check;
ALTER TABLE user_progress
  ADD CONSTRAINT user_progress_accuracy_check CHECK (accuracy >= 0 AND accuracy <= 100);

-- WPM has a generous upper bound (server validation is stricter at 300).
ALTER TABLE user_progress
  DROP CONSTRAINT IF EXISTS user_progress_wpm_check;
ALTER TABLE user_progress
  ADD CONSTRAINT user_progress_wpm_check CHECK (wpm >= 0 AND wpm <= 400);

-- Sessions must have positive duration.
ALTER TABLE user_progress
  DROP CONSTRAINT IF EXISTS user_progress_time_elapsed_check;
ALTER TABLE user_progress
  ADD CONSTRAINT user_progress_time_elapsed_check CHECK (time_elapsed > 0);

-- lesson_id stays nullable (see 003): general practice sessions store NULL.
-- No action needed; documented here so a future migration does not re-add
-- NOT NULL. Verify with:
--   SELECT is_nullable FROM information_schema.columns
--   WHERE table_name = 'user_progress' AND column_name = 'lesson_id';
-- Expected: YES.

-- character_errors.character must hold full graphemes, not truncated codes.
ALTER TABLE character_errors ALTER COLUMN character TYPE TEXT;

-- Hot read paths.
CREATE INDEX IF NOT EXISTS idx_user_progress_user_session
  ON user_progress(user_id, session_timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_character_errors_user_accuracy
  ON character_errors(user_id, accuracy_rate);

-- Weak-character drill queries only care about low-accuracy rows.
CREATE INDEX IF NOT EXISTS idx_character_errors_weak
  ON character_errors(user_id, accuracy_rate) WHERE accuracy_rate < 70;

-- user_id UUID migration (NON-DESTRUCTIVE): user_progress.user_id and
-- character_errors.user_id are VARCHAR(255) holding Supabase auth UUIDs as
-- text. Add UUID columns + backfill guidance; do NOT alter/drop the legacy
-- columns until every reader is switched and the backfill is verified.
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS user_id_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE;
COMMENT ON COLUMN user_progress.user_id_uuid IS
  'Non-destructive UUID migration target for legacy VARCHAR user_id. Backfill: UPDATE user_progress SET user_id_uuid = user_id::uuid WHERE user_id ~ uuid-pattern; then verify zero NULLs before switching readers. This migration does NOT alter or drop the legacy column.';

ALTER TABLE character_errors
  ADD COLUMN IF NOT EXISTS user_id_uuid UUID REFERENCES auth.users(id) ON DELETE CASCADE;
COMMENT ON COLUMN character_errors.user_id_uuid IS
  'Non-destructive UUID migration target for legacy VARCHAR user_id. Same backfill-and-verify procedure as user_progress.user_id_uuid. This migration does NOT alter or drop the legacy column.';
