-- ============================================================================
-- 007_billing_race.sql
--
-- Billing subscriptions + multiplayer race results.
-- Certificates already exist (see 005) — no duplicate table here.
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'pro', 'institution')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_subscriptions_user_id ON subscriptions(user_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "owners read their own subscriptions" ON subscriptions;
CREATE POLICY "owners read their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Writes happen only via service_role (verified payment callbacks).
-- No public INSERT/UPDATE/DELETE policy.

CREATE TABLE IF NOT EXISTS race_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  wpm REAL NOT NULL DEFAULT 0 CHECK (wpm >= 0 AND wpm <= 400),
  accuracy REAL NOT NULL DEFAULT 0 CHECK (accuracy >= 0 AND accuracy <= 100),
  position INTEGER CHECK (position IS NULL OR position >= 1),
  finished_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_race_results_room_id ON race_results(room_id);
CREATE INDEX IF NOT EXISTS idx_race_results_user_id ON race_results(user_id);

ALTER TABLE race_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "race results are publicly readable" ON race_results;
CREATE POLICY "race results are publicly readable"
  ON race_results FOR SELECT
  USING (true);

-- No public INSERT/UPDATE/DELETE policy: writes happen only via service_role.
