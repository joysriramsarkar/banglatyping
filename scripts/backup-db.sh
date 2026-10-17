#!/usr/bin/env sh
# Database backup via pg_dump with 30-day retention.
# Requires: DATABASE_URL (postgres connection string) in the environment.
# Usage: ./scripts/backup-db.sh [backup-dir]
#
# Cron (nightly 02:00 UTC, appends to system log):
#   0 2 * * *  cd /srv/banglatyping && DATABASE_URL="$DATABASE_URL" ./scripts/backup-db.sh /var/backups/banglatyping >> /var/log/banglatyping-backup.log 2>&1
# See docs/OPS.md for the restore runbook.
set -eu

BACKUP_DIR="${1:-./backups}"
RETENTION_DAYS=30

if [ -z "${DATABASE_URL:-}" ]; then
  echo "error: DATABASE_URL is not set" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
OUTFILE="$BACKUP_DIR/banglatyping-$STAMP.dump"

pg_dump "$DATABASE_URL" --format=custom --file="$OUTFILE"
echo "Backup written to $OUTFILE"

# Prune backups older than the retention window.
find "$BACKUP_DIR" -maxdepth 1 -name 'banglatyping-*.dump' -mtime +"$RETENTION_DAYS" -delete
echo "Pruned backups older than $RETENTION_DAYS days."
