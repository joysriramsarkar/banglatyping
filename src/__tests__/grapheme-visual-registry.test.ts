/**
 * Grapheme visual registry tests (PixelPerfect spec §16.1 + §22 acceptance).
 *
 * - Family mapping spot checks (spec's own example table).
 * - Fail-closed resolver: unreviewed masks downgrade, never guess.
 * - Corpus completeness: every curriculum conjunct resolves to a reviewed
 *   path — zero safe-fallback in the lessons (acceptance #1, #4, #6).
 */

import { classifyGrapheme } from '@/lib/grapheme-visual/classify';
import { getGraphemeVisualSpec } from '@/lib/grapheme-visual/registry';
import {
  getRenderPlan,
  resolveRenderStrategy,
  getTypingPlan,
  deriveVisualProgress,
  buildConjunctStructureFormula,
} from '@/lib/grapheme-visual/plan';
import { collectCorpusConjuncts } from '@/lib/grapheme-visual/corpus';
import {
  normalizeForComparison,
  normalizeForSegmentation,
  normalizeForRendering,
} from '@/lib/bengali-grapheme';

describe('grapheme family classification', () => {
  it.each([
    ['ক্ল', 'l-phala'],
    ['ক্ষ', 'fused-ligature'],
    ['ক্ষ্ম', 'multi-consonant'],
    ['র্ম', 'reph'],
    ['প্ত', 'generic-conjunct'],
    ['প্র', 'r-phala'],
    ['ক্য', 'y-phala'],
    ['স্ব', 'b-phala'],
    ['স্ম', 'm-phala'],
    ['ট্ট', 'doubled-consonant'],
    ['ন্ত', 'nasal-cluster'],
    ['স্ট', 'sibilant-cluster'],
    ['কা', 'kar'],
    ['ক', 'simple'],
    ['্', 'halant-prefix'],
  ])('%s maps to the expected primary family', (grapheme, family) => {
    expect(classifyGrapheme(grapheme)).toContain(family);
  });

  it('keeps linguistic classes and render strategy apart (multi-class)', () => {
    expect(classifyGrapheme('ক্ষ্ম')).toEqual(
      expect.arrayContaining(['multi-consonant', 'fused-ligature']),
    );
    expect(classifyGrapheme('ট্ট')).toEqual(
      expect.arrayContaining(['doubled-consonant', 'fused-ligature']),
    );
    expect(classifyGrapheme('র্ম')).toEqual(
      expect.arrayContaining(['reph', 'nasal-cluster']),
    );
  });

  it('does not pretend an unknown glyph has a pixel mask', () => {
    const spec = getGraphemeVisualSpec('া');
    expect(spec.classes).toContain('unknown');
    expect(spec.strategy).toBe('safe-fallback');
    expect(spec.spatialHighlightApproved).toBe(false);
  });
});

describe('fail-closed strategy resolver', () => {
  it('downgrades unreviewed svg-mask assets to simulation', () => {
    // Tier-3 skeletons exist but NOTHING is reviewed: no real geometry.
    for (const g of ['ক্ষ', 'জ্ঞ', 'ক্ত']) {
      const spec = getGraphemeVisualSpec(g);
      expect(spec.strategy).toBe('svg-mask');
      expect(spec.mask?.reviewed).toBe(false);
      const plan = getRenderPlan(g);
      expect(plan.strategy).toBe('simulation');
      expect(resolveRenderStrategy(spec)).toBe('simulation');
      expect(plan.showOverlayClip).toBe(false);
      expect(plan.showSimBox).toBe(true);
    }
  });

  it('keeps Tier-2 approved family highlights on the clip path', () => {
    for (const g of ['ক্ল', 'ট্ট', 'প্ত', 'প্র', 'স্বা', 'কা']) {
      const plan = getRenderPlan(g);
      expect(plan.showOverlayClip).toBe(true);
      expect(plan.showSimBox).toBe(false);
    }
  });

  it('never routes an unregistered fused ligature to a guessed mask', () => {
    for (const g of ['ক্ক', 'ক্য', 'ক্স', 'র্ক', 'স্ত্র']) {
      const plan = getRenderPlan(g);
      expect(plan.showOverlayClip).toBe(false);
      expect(plan.showSimBox).toBe(true);
    }
  });
});

describe('typing plan vs visual stages', () => {
  it('resolves layout-aware key plans; BanglaWord ক্ষ is one shortcut key', () => {
    const plan = getTypingPlan('ক্ষ', 'banglaword');
    expect(plan.isSupported).toBe(true);
    expect(plan.keys.length).toBeGreaterThanOrEqual(1);
    // One shortcut key completes three code points: keys !== visual stages.
    const progress = deriveVisualProgress({
      target: 'ক্ষ',
      typedInput: 'ক্ষ',
      typingPlan: plan,
      keysPressed: 1,
    });
    expect(progress.totalVisualStages).toBe(3);
    expect(progress.visualStageIndex).toBe(3);
    expect(progress.typedKeySteps).toBe(1);
  });

  it('reports unsupported layout sequences honestly instead of blank hints', () => {
    const plan = getTypingPlan('ক্ষ্ম', 'probhat');
    expect(plan.grapheme).toBe('ক্ষ্ম');
    // Either supported with keys or honestly unsupported — never undefined.
    expect(typeof plan.isSupported).toBe('boolean');
    if (!plan.isSupported) expect(plan.keys).toEqual([]);
  });

  it('tracks partial visual stages from text', () => {
    const plan = getTypingPlan('ক্ল', 'banglaword');
    expect(
      deriveVisualProgress({ target: 'ক্ল', typedInput: '', typingPlan: plan }).visualStageIndex,
    ).toBe(0);
    expect(
      deriveVisualProgress({ target: 'ক্ল', typedInput: 'ক', typingPlan: plan }).visualStageIndex,
    ).toBe(1);
    expect(
      deriveVisualProgress({ target: 'ক্ল', typedInput: 'ক্ল', typingPlan: plan }).visualStageIndex,
    ).toBe(3);
  });
});

describe('structure formula vs typing steps (spec §13)', () => {
  it('states orthographic structure, not incremental state', () => {
    expect(buildConjunctStructureFormula('ক্ল')).toEqual({ parts: ['ক্', 'ল'], result: 'ক্ল' });
    expect(buildConjunctStructureFormula('র্ম')).toEqual({ parts: ['র্', 'ম'], result: 'র্ম' });
    expect(buildConjunctStructureFormula('ক্ষ্ম')).toEqual({
      parts: ['ক্', 'ষ্', 'ম'],
      result: 'ক্ষ্ম',
    });
    expect(buildConjunctStructureFormula('স্বা')).toEqual({
      parts: ['স্', 'ব', 'া'],
      result: 'স্বা',
    });
  });
});

describe('purpose-split normalization (spec §5R)', () => {
  it('comparison equates nukta spellings and drops joiners', () => {
    expect(normalizeForComparison('ড়')).toBe(normalizeForComparison('ড়'));
    expect(normalizeForComparison('ক্‌ষ')).toBe(normalizeForComparison('ক্ষ'));
  });

  it('rendering preserves shaping controls the comparison drops', () => {
    expect(normalizeForRendering('ক্‌ষ')).toContain('‌');
    expect(normalizeForRendering('ক্‌ষ')).not.toBe(normalizeForComparison('ক্‌ষ'));
  });

  it('segmentation keeps controls with canonical order', () => {
    expect(normalizeForSegmentation('ক্‌ষ')).toContain('‌');
  });
});

describe('curriculum corpus coverage (acceptance #1, #4, #6)', () => {
  it('classifies every observed curriculum conjunct (zero unknown)', () => {
    const conjuncts = collectCorpusConjuncts();
    expect(conjuncts.length).toBeGreaterThan(200);
    const unknown = conjuncts.filter(({ cluster }) =>
      getGraphemeVisualSpec(cluster).classes.includes('unknown'),
    );
    expect(unknown.map((u) => u.cluster)).toEqual([]);
  });

  it('renders every observed curriculum conjunct on a reviewed path (zero safe-fallback)', () => {
    const conjuncts = collectCorpusConjuncts();
    const fallback = conjuncts.filter(
      ({ cluster }) => getRenderPlan(cluster).strategy === 'safe-fallback',
    );
    expect(fallback.map((u) => u.cluster)).toEqual([]);
  });
});
