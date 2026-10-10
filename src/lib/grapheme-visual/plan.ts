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
 * Locked font profile for mask QA. The app ships NO self-hosted Bengali font;
 * glyphs resolve through the CSS stack below, so no per-glyph Tier-3 mask can
 * be approved until a profile is bundled and locked (spec §11). The resolver
 * therefore downgrades every asset-backed strategy to simulation today.
 */
export const ACTIVE_FONT_PROFILE: FontProfileId = 'noto-sans-bengali-stack-v1';

export const ACTIVE_FONT_STACK = "'Noto Sans Bengali', 'Nirmala UI', Arial, sans-serif";

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
 */
export function deriveVisualProgress(input: VisualProgressInput): TypingVisualProgress {
  const normTarget = normalizeBengaliString(input.target);
  const normTyped = normalizeBengaliString(input.typedInput);
  const totalUnits = Math.max(1, Array.from(normTarget).length);
  let stage: number;
  if (!normTyped) {
    stage = 0;
  } else if (normTyped === normTarget || normTyped.startsWith(normTarget)) {
    stage = totalUnits;
  } else if (normTarget.startsWith(normTyped)) {
    stage = Array.from(normTyped).length;
  } else {
    stage = 0;
  }
  return {
    typedKeySteps: input.keysPressed ?? null,
    totalKeySteps: input.typingPlan.keys.length,
    visualStageIndex: stage,
    totalVisualStages: totalUnits,
    targetGrapheme: normTarget,
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
