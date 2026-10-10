/**
 * Registry coverage gate (PixelPerfect spec §15, §22 acceptance #1/#4/#6).
 *
 * Scans every displayable string in the curriculum, drill data and game word
 * banks, resolves each observed conjunct through the visual registry, and
 * fails when anything would render on the unreviewed safe-fallback path.
 *
 * Run:  npm run grapheme:coverage
 *
 * NOTE: relative imports only — tsx loads this outside the bundler where the
 * `@/` alias may not resolve (see src/lib/grapheme-visual/corpus.ts).
 */

import { collectCorpusConjuncts, collectCorpusKarClusters } from '../src/lib/grapheme-visual/corpus';
import { getRenderPlan } from '../src/lib/grapheme-visual/plan';

const conjuncts = collectCorpusConjuncts();
const karClusters = collectCorpusKarClusters();

const hist: Record<string, number> = {};
for (const { cluster } of conjuncts) {
  const strategy = getRenderPlan(cluster).strategy;
  hist[strategy] = (hist[strategy] ?? 0) + 1;
}

const missing = conjuncts.filter(
  ({ cluster }) =>
    getRenderPlan(cluster).strategy === 'safe-fallback' ||
    getRenderPlan(cluster).spec.classes.includes('unknown'),
);

console.log(`conjunct clusters observed : ${conjuncts.length}`);
console.log(`kar clusters observed      : ${karClusters.length}`);
console.log(`strategy histogram         : ${JSON.stringify(hist)}`);

if (missing.length > 0) {
  console.error(
    `Unregistered conjuncts (${missing.length}): ` +
      missing
        .slice(0, 60)
        .map(({ cluster, count }) => `${cluster} x${count}`)
        .join(' '),
  );
  process.exitCode = 1;
} else {
  console.log('OK: every observed conjunct resolves to a reviewed path.');
}
