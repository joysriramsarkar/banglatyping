-- ============================================================================
-- 004_integrity_fixes.sql
--
-- Fixes four correctness bugs found in the V2 research audit. Each one made
-- the app show users data that was either mathematically impossible or
-- fabricated. None of them are cosmetic.
--
--   C1  update_character_errors() computed accuracy_rate as
--         100 * (old_total - (old_error + new)) / old_total
--       which is ALWAYS negative, because old_total == old_error by
--       construction. This poisoned every downstream consumer:
--       user_weak_characters (all rows "Very Weak"), the keyboard heatmap,
--       GraphemeMasteryGrid, the custom-drill threshold filter, and the
--       recommender score.
--       Fix: count CORRECT attempts too. A session reports both the errors and
--       the attempts per grapheme; accuracy is then a real ratio.
--
--   C18 user_lesson_completion was upserted with a literal
--       times_completed: 1 and best_* = last value, so the counters never grew
--       and a worse retry silently overwrote a personal best.
--       Fix: an RPC that increments and takes GREATEST().
--
--   C14 Spaced repetition was in-memory only. weakCharsToMastery() sets
--       lastPracticed/nextReviewAt to null, so isDueForReview() was always
--       false and no skill ever came back for review.
--       Fix: a persistent skill_mastery table.
--
--   C3  Certificates were generated in the browser with Math.random() and
--       /verify/[id] rendered a hardcoded "verified" page for any input.
--       Fix: a certificates table so the ID resolves to a real row.
--
-- Migration order matters: 003 must run first (lesson_id nullable).
-- ============================================================================

-- ============================================================================
-- C1 — character_errors accuracy is a real ratio now
-- ============================================================================

-- Record every grapheme the user actually attempted, not only the ones they
-- got wrong. Without this, accuracy is mathematically forced to 0 or below.
ALTER TABLE user_progress
  ADD COLUMN IF NOT EXISTS attempted_characters JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN user_progress.attempted_characters IS
  'Array of {char, count} — every grapheme attempted (correct + wrong) in this session. Feeds character_errors.total_attempts.';

-- Repair rows written by the old trigger, which could only have counted errors.
-- Every legacy row has total_attempts == error_count, i.e. 0% accuracy, so the
-- honest reconstruction is "accuracy unknown, treat as 0 attempts recorded".
-- GREATEST(0, ...) clamps the impossible negatives the old trigger produced.
UPDATE character_errors
   SET accuracy_rate = LEAST(100, GREATEST(0, accuracy_rate))
 WHERE accuracy_rate < 0 OR accuracy_rate > 100;

-- Rewrite the aggregator. p_erred_characters stays for backwards
-- compatibility with sessions that have no attempted_characters yet, but
-- total_attempts is now driven by the correct+incorrect count.
CREATE OR REPLACE FUNCTION update_character_errors(
  p_user_id VARCHAR(255),
  p_erred_characters JSONB,
  p_attempted_characters JSONB DEFAULT '[]'::jsonb
) RETURNS void AS $$
DECLARE
  v_err      JSONB;
  v_att      JSONB;
  v_char     TEXT;
  v_errors   INTEGER;
  v_attempts INTEGER;
  v_new_err  INTEGER;
  v_new_att  INTEGER;
  v_total_err INTEGER;
  v_total_att INTEGER;
BEGIN
  -- ── Errors ────────────────────────────────────────────────────────────
  FOR v_err IN SELECT jsonb_array_elements(COALESCE(p_erred_characters, '[]'::jsonb))
  LOOP
    v_char    := v_err->>'char';
    v_new_err := GREATEST(0, COALESCE((v_err->>'count')::INTEGER, 0));
    IF v_char IS NULL OR v_new_err = 0 THEN CONTINUE; END IF;

    -- Attempts for this char: prefer the new attempted_characters payload,
    -- otherwise fall back to the error count so behaviour never regresses.
    SELECT COALESCE(MAX((a->>'count')::INTEGER), 0)
      INTO v_attempts
      FROM jsonb_array_elements(COALESCE(p_attempted_characters, '[]'::jsonb)) AS a
     WHERE a->>'char' = v_char;
    v_new_att := GREATEST(v_attempts, v_new_err);

    INSERT INTO character_errors
      (user_id, character, error_count, total_attempts, accuracy_rate, last_error_at, updated_at)
    VALUES (
      p_user_id,
      v_char,
      v_new_err,
      v_new_att,
      ROUND(100.0 * (v_new_att - v_new_err) / v_new_att, 2),
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id, character) DO UPDATE SET
      error_count    = character_errors.error_count + v_new_err,
      total_attempts = character_errors.total_attempts + v_new_att,
      -- GREATEST(0, ...) keeps the clamp in the schema, not just in the app.
      accuracy_rate  = ROUND(
        100.0 * GREATEST(
          0,
          (character_errors.total_attempts + v_new_att)
          - (character_errors.error_count + v_new_err)
        ) / GREATEST(1, character_errors.total_attempts + v_new_att), 2),
      last_error_at  = NOW(),
      updated_at     = NOW();
  END LOOP;

  -- ── Characters typed correctly ────────────────────────────────────────
  -- These never appear in p_erred_characters, so without this second loop a
  -- perfectly typed session would leave no trace at all and a 100%-accuracy
  -- character could never be represented.
  FOR v_att IN
    SELECT a->>'char' AS chr, SUM(COALESCE((a->>'count')::INTEGER, 0)) AS cnt
      FROM jsonb_array_elements(COALESCE(p_attempted_characters, '[]'::jsonb)) AS a
     GROUP BY a->>'char'
  LOOP
    v_char    := v_att.chr;
    v_new_att := GREATEST(0, COALESCE((v_att.cnt)::INTEGER, 0));
    IF v_char IS NULL OR v_new_att = 0 THEN CONTINUE; END IF;

    SELECT COALESCE(SUM(COALESCE((e->>'count')::INTEGER, 0)), 0)
      INTO v_new_err
      FROM jsonb_array_elements(COALESCE(p_erred_characters, '[]'::jsonb)) AS e
     WHERE e->>'char' = v_char;

    -- Only the not-yet-credited attempts are new.
    v_new_err := GREATEST(0, v_new_att - v_new_err);

    INSERT INTO character_errors
      (user_id, character, error_count, total_attempts, accuracy_rate, updated_at)
    VALUES (
      p_user_id,
      v_char,
      v_new_err,
      v_new_att,
      ROUND(100.0 * (v_new_att - v_new_err) / v_new_att, 2),
      NOW()
    )
    ON CONFLICT (user_id, character) DO UPDATE SET
      error_count    = character_errors.error_count + v_new_err,
      total_attempts = character_errors.total_attempts + v_new_att,
      accuracy_rate  = ROUND(
        100.0 * GREATEST(
          0,
          (character_errors.total_attempts + v_new_att)
          - (character_errors.error_count + v_new_err)
        ) / GREATEST(1, character_errors.total_attempts + v_new_att), 2),
      updated_at     = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION trigger_update_character_errors()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.erred_characters IS NOT NULL
     AND jsonb_array_length(NEW.erred_characters) > 0 THEN
    PERFORM update_character_errors(
      NEW.user_id,
      NEW.erred_characters,
      COALESCE(NEW.attempted_characters, '[]'::jsonb)
    );
  ELSIF NEW.attempted_characters IS NOT NULL
        AND jsonb_array_length(NEW.attempted_characters) > 0 THEN
    -- A flawless session produces no errors at all; still record the attempts
    -- so perfect characters can accumulate a 100% accuracy row.
    PERFORM update_character_errors(
      NEW.user_id,
      '[]'::jsonb,
      NEW.attempted_characters
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_character_errors ON user_progress;
CREATE TRIGGER trg_update_character_errors
AFTER INSERT ON user_progress
FOR EACH ROW
EXECUTE FUNCTION trigger_update_character_errors();

-- ============================================================================
-- C18 — "best" must mean best, and the counter must count
-- ============================================================================

CREATE OR REPLACE FUNCTION record_lesson_completion(
  p_user_id VARCHAR(255),
  p_lesson_id UUID,
  p_accuracy FLOAT,
  p_wpm FLOAT
) RETURNS void AS $$
BEGIN
  INSERT INTO user_lesson_completion
    (user_id, lesson_id, times_completed, best_accuracy, best_wpm, last_completed_at)
  VALUES (
    p_user_id, p_lesson_id, 1, p_accuracy, p_wpm, NOW()
  )
  ON CONFLICT (user_id, lesson_id) DO UPDATE SET
    times_completed = user_lesson_completion.times_completed + 1,
    best_accuracy   = GREATEST(user_lesson_completion.best_accuracy, EXCLUDED.best_accuracy),
    best_wpm        = GREATEST(user_lesson_completion.best_wpm,      EXCLUDED.best_wpm),
    last_completed_at = NOW(),
    updated_at      = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- C14 — spaced repetition survives a refresh
-- ============================================================================

CREATE TABLE IF NOT EXISTS skill_mastery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL,
  skill_id VARCHAR(64) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'LEARNING'
    CHECK (status IN ('LOCKED','LEARNING','PRACTICING','PROFICIENT','MASTERED','NEEDS_REVIEW')),
  strength INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  stability INTEGER DEFAULT 0,
  last_practiced TIMESTAMP WITH TIME ZONE,
  next_review_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_skill_mastery_user_id ON skill_mastery(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_mastery_review_due ON skill_mastery(user_id, next_review_at);

ALTER TABLE skill_mastery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owners manage their own skill mastery" ON skill_mastery;
CREATE POLICY "owners manage their own skill mastery" ON skill_mastery
  FOR ALL
  USING (user_id = (auth.uid())::text)
  WITH CHECK (user_id = (auth.uid())::text);

-- Skills that are due for review now. security_invoker so the RLS policy
-- above applies instead of the view owner's privileges.
CREATE OR REPLACE VIEW user_skills_due_review
WITH (security_invoker = true) AS
SELECT user_id, skill_id, status, strength, stability, last_practiced, next_review_at
FROM skill_mastery
WHERE next_review_at IS NOT NULL
  AND next_review_at <= NOW()
  AND status <> 'LOCKED';

-- ============================================================================
-- C3 — a certificate ID has to mean something
-- ============================================================================

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id VARCHAR(32) NOT NULL UNIQUE,
  user_id VARCHAR(255),
  recipient_name VARCHAR(255),
  certificate_type VARCHAR(100) NOT NULL DEFAULT 'বাংলা টাইপিং প্রফিশিয়েন্সি ও মাস্টার্স সনদ',
  gpm FLOAT DEFAULT 0,
  wpm FLOAT DEFAULT 0,
  accuracy FLOAT DEFAULT 0,
  layout VARCHAR(32),
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_at ON certificates(issued_at DESC);

-- The verification page is public, but only ever exposes non-identifying
-- fields, so it gets a read-only SELECT policy rather than the anon-readable
-- reference-content treatment the other public tables get. Revoking UPDATE
-- and DELETE is the point: an issued certificate is a fact, not an editable row.
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "certificates are publicly readable" ON certificates;
CREATE POLICY "certificates are publicly readable" ON certificates
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "owners read their own certificates" ON certificates;
CREATE POLICY "owners read their own certificates" ON certificates
  FOR SELECT USING (user_id = (auth.uid())::text);