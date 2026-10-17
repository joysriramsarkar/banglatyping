/**
 * Grapheme visual system — strategy resolver, typing plans, visual progress (§9, §12, §18–§19).
 *
 * Fail-closed rule (§9.2): an `svg-mask`/`stacked-mask` strategy renders a
 * spatial highlight ONLY with an approved, font-matching asset/heuristic.
 * Anything else degrades to simulation — a wrong mask is worse than none.
 */

import { normalizeBengaliString } from '../bengali-grapheme';
import { getKeySequenceForGrapheme } from '../keyboard-layouts';
import { getGraphemeVisualSpec } from './registry';
import type {
  FontProfileId,
  GraphemeVisualSpec,
  RenderPlan,
  TypingPlan,
  TypingVisualProgress,
} from './types';

/**
 * Locked font profile for mask QA. Grapheme cells render through the bundled
 * Hind Siliguri v14 Bengali subsets (public/fonts, "BT Grapheme") on every
 * device — UI typography is untouched. Tier-3 per-glyph assets still need
 * individual screenshot review before `reviewed: true`.
 */
export const ACTIVE_FONT_PROFILE: FontProfileId = 'bt-grapheme-hind-siliguri-v14';

export const ACTIVE_FONT_STACK = "'BT Grapheme', 'Noto Sans Bengali', 'Nirmala UI', Arial, sans-serif";

export function resolveRenderStrategy(
  spec: GraphemeVisualSpec,
  fontProfile: FontProfileId = ACTIVE_FONT_PROFILE,
): RenderPlan['strategy'] {
  switch (spec.strategy) {
    case 'svg-mask':
      if (spec.mask?.reviewed && spec.mask.fontProfile === fontProfile) return 'mask-clip';
      return 'simulation';
    case 'stacked-mask':
      if (spec.spatialHighlightApproved) return 'heuristic-clip';
      return 'simulation';
    case 'heuristic-kar':
      return 'heuristic-clip';
    case 'whole-glyph':
      return 'whole-glyph';
    case 'simulation':
      return 'simulation';
    case 'safe-fallback':
    default:
      return 'safe-fallback';
  }
}

/** Fail-closed rendering decision for one cluster (spec §18 `getRenderPlan`). */
export function getRenderPlan(cluster: string, fontProfile?: FontProfileId): RenderPlan {
  const spec = getGraphemeVisualSpec(cluster);
  const strategy = resolveRenderStrategy(spec, fontProfile);
  return {
    spec,
    strategy,
    showOverlayClip: strategy === 'heuristic-clip' || strategy === 'mask-clip',
    showSimBox: strategy === 'simulation' || strategy === 'safe-fallback',
  };
}

/** Layout-aware key plan for one grapheme (spec §12). */
export function getTypingPlan(grapheme: string, layout?: string): TypingPlan {
  const norm = normalizeBengaliString(grapheme);
  const keys = getKeySequenceForGrapheme(norm, layout);
  return {
    grapheme: norm,
    layout: layout ?? 'banglaword',
    keys: keys.map((k) => ({
      key: k.key,
      keyCode: k.keyCode,
      needsShift: k.needsShift,
      produces: k.produces,
    })),
    isSupported: keys.length > 0,
  };
}

export interface VisualProgressInput {
  target: string;
  typedInput: string;
  typingPlan: TypingPlan;
  /** Physical keystrokes accepted for the current item, if tracked. */
  keysPressed?: number | null;
}

/**
 * Derive what the EYES should show from what the HANDS did (spec §12/§19).
 * Key steps (layout plan) and visual stages (grapheme units) are separate:
 * one BanglaWord shortcut key can complete several code points at once.
 *
 * Progress uses the LONGEST COMMON PREFIX between typed and target, so a
 * wrong keystroke preserves everything correct up to the divergence instead
 * of resetting the stage to 0. `errorAt` is the code-point index (Array.from
 * units, NOT grapheme clusters) where typed first diverges from target, or
 * null when there is no error — typing proceeds code-point by code-point
 * inside a cluster (ক, then ্, then ল), while a grapheme cluster is the whole
 * visible unit (ক্ল). The renderer maps errorAt to the error glyph for the
 * red underline; stage math keeps counting in code points for continuity
 * with the existing totalVisualStages.
 */
export function deriveVisualProgress(input: VisualProgressInput): TypingVisualProgress {
  const normTarget = normalizeBengaliString(input.target);
  const normTyped = normalizeBengaliString(input.typedInput);
  const targetUnits = Array.from(normTarget);
  const typedUnits = Array.from(normTyped);
  const totalUnits = Math.max(1, targetUnits.length);

  // Longest common prefix in code points.
  let lcp = 0;
  while (
    lcp < targetUnits.length &&
    lcp < typedUnits.length &&
    targetUnits[lcp] === typedUnits[lcp]
  ) {
    lcp++;
  }

  let stage: number;
  let errorAt: number | null;
  if (!normTyped) {
    stage = 0;
    errorAt = null;
  } else if (lcp >= targetUnits.length) {
    // Typed covers the whole target (exact or with trailing extra input).
    stage = totalUnits;
    errorAt = null;
  } else if (lcp >= typedUnits.length) {
    // Proper prefix: still composing, nothing wrong yet.
    stage = lcp;
    errorAt = null;
  } else {
    // Divergence: keep progress up to the LCP, flag the error position.
    stage = lcp;
    errorAt = lcp;
  }
  return {
    typedKeySteps: input.keysPressed ?? null,
    totalKeySteps: input.typingPlan.keys.length,
    visualStageIndex: stage,
    totalVisualStages: totalUnits,
    targetGrapheme: normTarget,
    errorAt,
  };
}

/**
 * Orthographic structure formula for teaching (spec §13-B), distinct from the
 * incremental typing steps (§13-A): "ক্ + ল → ক্ল", NOT "ক + ক্ + ল".
 * Each hasanta folds onto its preceding consonant: "ক্ + ষ্ + ম → ক্ষ্ম".
 */
export function buildConjunctStructureFormula(cluster: string): { parts: string[]; result: string } {
  const norm = normalizeBengaliString(cluster);
  const units = Array.from(norm);
  const result = norm;
  if (units.length < 2 || !units.includes('্')) return { parts: [norm], result };
  const isMark = (u: string): boolean => {
    const cp = u.codePointAt(0) ?? 0;
    return (cp >= 0x0981 && cp <= 0x0983) || (cp >= 0x09be && cp <= 0x09cc);
  };
  const parts: string[] = [];
  let current = '';
  for (const u of units) {
    // A kar/mark starts its own part (ষ্ + ঠ + া), a halant folds left (ক্).
    if (isMark(u) && current && !current.endsWith('্')) {
      parts.push(current);
      current = u;
      continue;
    }
    current += u;
    if (u === '্') {
      parts.push(current);
      current = '';
    }
  }
  if (current) parts.push(current);
  return { parts: parts.length > 0 ? parts : [norm], result };
}
