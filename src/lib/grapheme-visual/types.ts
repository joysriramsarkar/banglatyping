/**
 * Grapheme visual system — types.
 *
 * Follows `BanglaTyping_PixelPerfect_যুক্তবর্ণ_রূপরেখা.md` §7.
 *
 * Two ideas are kept strictly apart (see the spec §7 "এই design কেন ভালো"):
 * - `classes` describe the LINGUISTIC structure of a cluster (what it is).
 * - `strategy` decides how the renderer shows it TODAY (what we may draw).
 *
 * A cluster may carry several classes at once (e.g. 'ক্ষ্ম' is both
 * multi-consonant and fused-ligature). `halant-prefix` is a project extension
 * to the spec's list: a bare hasanta or an unfinished C+hasanta typing state
 * (Family C) renders whole, it is never "unknown".
 */

export type GraphemeShapeClass =
  | 'simple'
  | 'kar'
  | 'halant-prefix'
  | 'reph'
  | 'r-phala'
  | 'y-phala'
  | 'b-phala'
  | 'm-phala'
  | 'l-phala'
  | 'nasal-cluster'
  | 'doubled-consonant'
  | 'sibilant-cluster'
  | 'fused-ligature'
  | 'generic-conjunct'
  | 'multi-consonant'
  | 'modifier-composite'
  | 'unknown';

export type GraphemeRenderStrategy =
  | 'whole-glyph'
  | 'heuristic-kar'
  | 'svg-mask'
  | 'stacked-mask'
  | 'simulation'
  | 'safe-fallback';

export type FontProfileId = string;

export interface GlyphMaskAsset {
  /** Stable ID; changing its viewBox or meaning must change the version. */
  id: string;
  version: number;
  /** Name/hash of the bundled font used when the mask was reviewed. */
  fontProfile: FontProfileId;
  viewBox: [number, number, number, number];
  /** White mask regions reveal the overlay; black areas stay on the base. */
  maskUrl: string;
  /** Every stage describes visual intent, not Unicode code-point index. */
  stages: Array<{
    id: string;
    labelBn: string;
    completedThroughTypingStep: number;
    regionIds: string[];
  }>;
  /**
   * NEVER set true without a real reviewed geometry (screenshot QA against
   * the locked font profile). The resolver treats unreviewed masks as absent.
   */
  reviewed: boolean;
}

export interface TeachingStep {
  label: string;
  explanationBn: string;
  expectedTypingStep: number;
}

export interface GraphemeVisualSpec {
  grapheme: string;
  aliases?: string[];
  classes: GraphemeShapeClass[];
  strategy: GraphemeRenderStrategy;
  /** Stable decomposition for teaching, independent of the glyph outline. */
  teachingSteps: TeachingStep[];
  /** Optional exact mask; a mask is never guessed from code-point count. */
  mask?: GlyphMaskAsset;
  /**
   * Tier-2 family approval (e.g. below-base splits, kar heuristics) backed by
   * screenshot fixtures. If false, the renderer shows simulation, never a
   * fake spatial split.
   */
  spatialHighlightApproved: boolean;
  notes?: string;
}

/**
 * Layout-aware typing progress, kept separate from visual stages (§12).
 * `typedKeySteps` is null when the caller does not track physical keystrokes
 * (only the text buffer is known); the UI must never display it then.
 */
export interface TypingVisualProgress {
  /** Completed layout-specific keys/composition steps, or null if untracked. */
  typedKeySteps: number | null;
  /** Target layout's key plan length (0 when unsupported). */
  totalKeySteps: number;
  /** Completed pedagogic visual stages for the current strategy. */
  visualStageIndex: number;
  /** Total pedagogic visual stages for the current strategy. */
  totalVisualStages: number;
  /** The final expected grapheme remains unchanged. */
  targetGrapheme: string;
}

export interface TypingPlan {
  grapheme: string;
  layout: string;
  keys: Array<{
    key: string;
    keyCode: string;
    needsShift: boolean;
    produces: string;
  }>;
  isSupported: boolean;
}

/** Fail-closed rendering decision for one cluster. */
export interface RenderPlan {
  spec: GraphemeVisualSpec;
  /**
   * Strategy after the fail-closed resolver ran:
   * - 'heuristic-clip' — Tier-2 approved family geometry (kar heuristic,
   *   stacked/below-base splits) painted via the tested clip helper.
   * - 'mask-clip' — Tier-3 reviewed per-glyph asset (none approved yet).
   * - Anything else paints NO overlay; progress lives in the step card.
   */
  strategy: 'whole-glyph' | 'heuristic-clip' | 'mask-clip' | 'simulation' | 'safe-fallback';
  /** Whether the green overlay may be painted (approved geometry only). */
  showOverlayClip: boolean;
  /** Whether the step/simulation card is shown underneath. */
  showSimBox: boolean;
}
