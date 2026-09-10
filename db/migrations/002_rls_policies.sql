-- Row Level Security
--
-- Migration 001 created every table but never enabled RLS, so the public `anon`
-- key (which the Next.js app ships to the browser) could read and write every
-- row of every table. This migration closes that.
--
-- Two kinds of table:
--   * reference content  -> readable by anyone, writable by no one
--   * per-user data      -> only the row's owner, for every operation
--
-- Per-user rows are matched against auth.uid(), which PostgREST derives from the
-- caller's access token. The app forwards that token via
-- lib/db.ts#createRequestClient, so these policies are what actually enforce
-- ownership at the database layer. The API routes check the same thing in code;
-- this is the second line of defence.
--
-- NOTE: user_id columns are VARCHAR(255) (a leftover of an earlier Firebase
-- schema) holding the Supabase auth user id, hence the ::text casts.

-- ---------------------------------------------------------------------------
-- Reference content: public read, no writes through the API
-- ---------------------------------------------------------------------------

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE paragraph_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lessons are publicly readable" ON lessons;
CREATE POLICY "lessons are publicly readable" ON lessons
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "lesson_drills are publicly readable" ON lesson_drills;
CREATE POLICY "lesson_drills are publicly readable" ON lesson_drills
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "paragraph_content is publicly readable" ON paragraph_content;
CREATE POLICY "paragraph_content is publicly readable" ON paragraph_content
  FOR SELECT USING (true);

-- ---------------------------------------------------------------------------
-- Per-user data: owner only
-- ---------------------------------------------------------------------------

ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_drills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lesson_completion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owners manage their own progress" ON user_progress;
CREATE POLICY "owners manage their own progress" ON user_progress
  FOR ALL
  USING (user_id = (auth.uid())::text)
  WITH CHECK (user_id = (auth.uid())::text);

DROP POLICY IF EXISTS "owners manage their own character errors" ON character_errors;
CREATE POLICY "owners manage their own character errors" ON character_errors
  FOR ALL
  USING (user_id = (auth.uid())::text)
  WITH CHECK (user_id = (auth.uid())::text);

DROP POLICY IF EXISTS "owners manage their own custom drills" ON custom_drills;
CREATE POLICY "owners manage their own custom drills" ON custom_drills
  FOR ALL
  USING (user_id = (auth.uid())::text)
  WITH CHECK (user_id = (auth.uid())::text);

DROP POLICY IF EXISTS "owners manage their own lesson completion" ON user_lesson_completion;
CREATE POLICY "owners manage their own lesson completion" ON user_lesson_completion
  FOR ALL
  USING (user_id = (auth.uid())::text)
  WITH CHECK (user_id = (auth.uid())::text);

-- ---------------------------------------------------------------------------
-- Views
--
-- A plain view runs with its owner's rights, so it bypasses the policies on the
-- tables underneath it -- these two views would have leaked every user's data
-- even with RLS switched on. security_invoker makes them run as the caller
-- instead, so the base-table policies apply. Requires PostgreSQL 15+, which is
-- what Supabase runs.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW user_weak_characters
WITH (security_invoker = true) AS
SELECT
  user_id,
  character,
  accuracy_rate,
  error_count,
  total_attempts,
  CASE
    WHEN accuracy_rate >= 95 THEN 'Strong'
    WHEN accuracy_rate >= 80 THEN 'Good'
    WHEN accuracy_rate >= 60 THEN 'Weak'
    ELSE 'Very Weak'
  END as strength_level
FROM character_errors
WHERE accuracy_rate < 95
ORDER BY accuracy_rate ASC;

CREATE OR REPLACE VIEW user_statistics
WITH (security_invoker = true) AS
SELECT
  user_id,
  COUNT(DISTINCT lesson_id) as lessons_practiced,
  ROUND(CAST(AVG(accuracy) AS NUMERIC), 2) as average_accuracy,
  ROUND(CAST(AVG(wpm) AS NUMERIC), 2) as average_wpm,
  MAX(wpm) as best_wpm,
  MAX(accuracy) as best_accuracy,
  COUNT(*) as total_sessions
FROM user_progress
GROUP BY user_id;
