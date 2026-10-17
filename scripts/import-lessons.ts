/**
 * CSV → Supabase upsert stub (no papaparse dependency — manual parse).
 *
 * Expected CSV header: id,title,level,text
 * Usage: npx tsx scripts/import-lessons.ts ./lessons.csv
 *
 * TODO: wire SUPABASE_SERVICE_ROLE_KEY + target table name.
 */

import { readFileSync } from 'node:fs';

export interface LessonRow {
  id: string;
  title: string;
  level: number;
  text: string;
}

export function parseLessonsCsv(csv: string): LessonRow[] {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const header = splitCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const idx = {
    id: header.indexOf('id'),
    title: header.indexOf('title'),
    level: header.indexOf('level'),
    text: header.indexOf('text'),
  };
  if (idx.id === -1 || idx.title === -1) {
    throw new Error('CSV must include at least id,title columns');
  }
  return lines
    .slice(1)
    .map((line) => {
      const cols = splitCsvLine(line);
      return {
        id: cols[idx.id]?.trim() ?? '',
        title: cols[idx.title]?.trim() ?? '',
        level: idx.level === -1 ? 0 : Number(cols[idx.level] ?? 0),
        text: idx.text === -1 ? '' : (cols[idx.text]?.trim() ?? ''),
      };
    })
    .filter((r) => r.id.length > 0);
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

async function main(): Promise<void> {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: npx tsx scripts/import-lessons.ts <lessons.csv>');
    process.exit(1);
  }
  const csv = readFileSync(file, 'utf8');
  const rows = parseLessonsCsv(csv);
  // eslint-disable-next-line no-console -- CLI progress output is intentional
  console.log(`Parsed ${rows.length} lesson rows from ${file}.`);
  // TODO: upsert rows into Supabase (service-role key, table: lessons).
  // eslint-disable-next-line no-console -- CLI progress output is intentional
  console.log('Dry run — no rows uploaded. Implement Supabase upsert here.');
}

const invokedDirectly = process.argv[1]?.endsWith('import-lessons.ts');
if (invokedDirectly) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export default parseLessonsCsv;
