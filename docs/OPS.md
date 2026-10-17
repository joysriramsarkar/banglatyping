# OPS Runbook (1 page)

## Backup

- Nightly `pg_dump` via `scripts/backup-db.sh [backup-dir]` (custom format,
  30-day retention, prunes older dumps). Cron:
  `0 2 * * * cd /srv/banglatyping && DATABASE_URL="$DATABASE_URL"
  ./scripts/backup-db.sh /var/backups/banglatyping >> /var/log/banglatyping-backup.log 2>&1`
- Requires `DATABASE_URL` in the environment; exits non-zero without it.
- Verify: a dump file `banglatyping-YYYYMMDD-HHMMSS.dump` appears after each
  run; alert if none is newer than 26h.

## Restore

1. Stop writers (maintenance mode / scale web to 0).
2. `pg_restore --clean --if-exists -d "$DATABASE_URL" /var/backups/banglatyping/<stamp>.dump`
3. Run `npm run db:check` (connectivity) and smoke-test login + lesson load.
4. Re-enable writers. Record the restore in the incident log.

## RLS check

- `npm run db:check-rls` (wraps `scripts/check-rls.mjs`) after every migration
  and weekly via CI. It must pass before deploy: a failing policy blocks
  release, never ships behind a flag.

## Rotate keys

1. Supabase dashboard → new anon/service keys (or `supabase` CLI).
2. Update secrets store + hosting env (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`).
3. Redeploy, confirm health endpoint + `db:check` green with new keys.
4. Revoke old keys only after 24h of clean traffic.

## CI gates (`.github/workflows/ci.yml`)

`typecheck` → `lint` → `test:ci` → `grapheme:coverage`
(`scripts/check-grapheme-coverage.ts`, fails on unregistered conjuncts) →
`build` → bundle-size report (`continue-on-error`, informational) →
Cloudflare worker build → E2E smoke (chromium + webkit, `--workers=1`).
