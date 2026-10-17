/**
 * Validate content/lessons/*.json against the zod schema and assert seed
 * parity: every sample id must exist in src/lib/lessons.ts with the same
 * title, level and row.
 *
 * Run with: npx tsx scripts/validate-lessons.ts
 * TODO: extend parity to full drill content once more lessons are extracted.
 */
import fs from 'node:fs';
import path from 'node:path';
import { lessonFileSchema } from '../content/lessons/schema';
import { lessons } from '../src/lib/lessons';

const SAMPLE_PATH = path.resolve(process.cwd(), 'content/lessons/sample.json');

function fail(message: string): never {
  console.error(`validate-lessons: FAIL — ${message}`);
  process.exit(1);
}

const raw = fs.existsSync(SAMPLE_PATH)
  ? fs.readFileSync(SAMPLE_PATH, 'utf8')
  : fail(`sample file missing at ${SAMPLE_PATH}`);

let parsed: unknown;
try {
  parsed = JSON.parse(raw);
} catch {
  fail('sample.json is not valid JSON');
}

const file = lessonFileSchema.safeParse(parsed);
if (!file.success) {
  fail(`schema errors: ${JSON.stringify(file.error.issues, null, 2)}`);
}

for (const sample of file.data.lessons) {
  const seed = lessons.find((l) => l.id === sample.id);
  if (!seed) fail(`id "${sample.id}" not found in src/lib/lessons.ts`);
  if (seed.title !== sample.title) {
    fail(`title mismatch for "${sample.id}": seed=${JSON.stringify(seed.title)} sample=${JSON.stringify(sample.title)}`);
  }
  if (seed.level !== sample.level) {
    fail(`level mismatch for "${sample.id}": seed=${seed.level} sample=${sample.level}`);
  }
  if ((seed.row ?? undefined) !== sample.row) {
    fail(`row mismatch for "${sample.id}": seed=${seed.row} sample=${sample.row}`);
  }
}

console.log(`validate-lessons: OK — ${file.data.lessons.length} sample lesson(s) match seed.`);
