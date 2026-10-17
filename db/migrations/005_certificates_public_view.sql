-- ============================================================================
-- 005_certificates_public_view.sql
--
-- Certificates must resolve to a real row (see 004 C3). This migration makes
-- the public verification surface explicit and minimal:
--   * certificates table exists with sane constraints,
--   * Row Level Security is on,
--   * the public may only read non-identifying columns through the
--     public_certificates VIEW (no user_id),
--   * only the service role can insert (no public INSERT policy).
-- ============================================================================

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verification_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  recipient_name TEXT,
  gpm REAL DEFAULT 0,
  wpm REAL DEFAULT 0,
  accuracy REAL DEFAULT 0,
  layout TEXT,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legacy installs created certificates.user_id as VARCHAR(255) (see 004).
-- Keep that data intact; only add the UUID column when it is missing.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificates' AND column_name = 'user_id_uuid'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'certificates' AND column_name = 'user_id'
      AND data_type = 'character varying'
  ) THEN
    ALTER TABLE certificates ADD COLUMN user_id_uuid UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    COMMENT ON COLUMN certificates.user_id_uuid IS
      'Non-destructive UUID migration target for legacy VARCHAR user_id. Backfill from auth.users before switching readers; this migration does NOT alter or drop the legacy column.';
  END IF;
END
$$;

ALTER TABLE certificates
  DROP CONSTRAINT IF EXISTS certificates_accuracy_check;
ALTER TABLE certificates
  ADD CONSTRAINT certificates_accuracy_check CHECK (accuracy >= 0 AND accuracy <= 100);

ALTER TABLE certificates
  DROP CONSTRAINT IF EXISTS certificates_wpm_check;
ALTER TABLE certificates
  ADD CONSTRAINT certificates_wpm_check CHECK (wpm >= 0 AND wpm <= 400);

ALTER TABLE certificates
  DROP CONSTRAINT IF EXISTS certificates_gpm_check;
ALTER TABLE certificates
  ADD CONSTRAINT certificates_gpm_check CHECK (gpm >= 0 AND gpm <= 400);

CREATE INDEX IF NOT EXISTS idx_certificates_verification_id ON certificates(verification_id);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- No public INSERT/UPDATE/DELETE policy: writes happen only via service_role.
DROP POLICY IF EXISTS "certificates are publicly readable" ON certificates;
DROP POLICY IF EXISTS "owners read their own certificates" ON certificates;

-- Public read surface: non-identifying columns only, no user_id.
CREATE OR REPLACE VIEW public_certificates AS
SELECT
  verification_id,
  recipient_name,
  gpm,
  wpm,
  accuracy,
  layout,
  issued_at
FROM certificates;

-- Views inherit the base table RLS; grant SELECT so anon/authenticated
-- callers can read the view while INSERT stays service_role-only.
GRANT SELECT ON public_certificates TO anon, authenticated;
