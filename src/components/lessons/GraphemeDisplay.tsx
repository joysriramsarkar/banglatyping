"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  type GraphemeRenderModel,
  getBengaliGraphemeClip,
  normalizeForRendering,
} from "@/lib/bengali-grapheme";
import { getRenderPlan } from "@/lib/grapheme-visual/plan";
import type { RenderPlan, TypingVisualProgress } from "@/lib/grapheme-visual/types";

import { ConjunctSimulationBox } from "./ConjunctSimulationBox";

export { ConjunctSimulationBox };

interface GraphemeDisplayProps {
  model: GraphemeRenderModel;
  /**
   * Extra className for the root wrapper (e.g. font-size classes).
   * The component itself does not set font size — it inherits from parent.
   */
  className?: string;
  /**
   * For error state in WordDrill — turns typed chars red instead of green
   */
  isError?: boolean;
  /**
   * Optional flag to render simulation HUD inline (default false to keep word baselines intact)
   */
  showSimulationBox?: boolean;
  /** Pre-resolved visual plan; resolved internally from the spec when omitted. */
  plan?: RenderPlan;
  /** Layout-aware progress for the accessible stage label; optional. */
  progress?: TypingVisualProgress | null;
}

/**
 * Renders a single Bengali grapheme cluster as ONE intact text run (§9.1):
 * the target cluster is never split into per-codepoint spans, so font shaping
 * cannot break. Base and overlay paint the identical string stacked in one
 * grid cell, so they can never misalign into a double glyph.
 *
 * Routing comes from the visual registry's fail-closed plan:
 * - heuristic-clip (Tier-2 kar + approved stacked/below-base splits): gray
 *   underlay + green overlay through the tested clip helper.
 * - simulation / safe-fallback: full glyph intact, progress in the step card.
 * - whole-glyph: single span, green only when fully typed.
 */
export function GraphemeDisplay({ model, className, isError, showSimulationBox = false, plan, progress }: GraphemeDisplayProps) {
  const typedColor = isError
    ? "text-red-500 font-black"
    : "text-green-600 dark:text-green-400 font-black";

  const renderPlan = plan ?? getRenderPlan(model.full);
  // Display text preserves shaping controls (spec §5R); logic keeps model.full.
  const displayText = normalizeForRendering(model.full);

  const stageIndex = progress?.visualStageIndex ?? model.currentStep ?? 0;
  const stageTotal = progress?.totalVisualStages ?? model.totalSteps ?? model.full.length;
  const accessibleLabel =
    stageTotal > 1
      ? `${model.full}, ধাপ ${stageIndex}/${stageTotal}`
      : model.full;

  // ── Simulation / safe-fallback: full glyph intact, no overlay ─────────────
  if (renderPlan.strategy === 'simulation' || renderPlan.strategy === 'safe-fallback') {
    const hasSteps = model.conjunctSteps && model.conjunctSteps.length > 0;
    const isFullyTyped = (model.currentStep ?? 0) >= (model.totalSteps ?? model.full.length);
    const glyphColor = isFullyTyped || isError ? typedColor : "text-foreground font-black";

    if (showSimulationBox && hasSteps) {
      return (
        <span className={cn("bt-grapheme", className)} data-grapheme={model.full} data-strategy={renderPlan.strategy}>
          <span className={cn("bt-grapheme__base", glyphColor)} data-part="base" aria-hidden="true">
            {displayText}
          </span>
          <ConjunctSimulationBox
            model={model}
            className="mt-2"
            unreviewed={renderPlan.strategy === 'safe-fallback'}
          />
          <span className="sr-only">{accessibleLabel}</span>
        </span>
      );
    }

    return (
      <span className={cn("bt-grapheme", className)} data-grapheme={model.full} data-strategy={renderPlan.strategy}>
        <span className={cn("bt-grapheme__base", glyphColor)} data-part="base" aria-hidden="true">
          {displayText}
        </span>
        <span className="sr-only">{accessibleLabel}</span>
      </span>
    );
  }

  // ── Whole glyph: single span, green only when complete ────────────────────
  if (renderPlan.strategy === 'whole-glyph') {
    const isFullyTyped = (model.currentStep ?? 0) >= (model.totalSteps ?? model.full.length);
    return (
      <span className={cn("bt-grapheme", className)} data-grapheme={model.full} data-strategy={renderPlan.strategy}>
        <span
          className={cn(
            "bt-grapheme__base",
            isFullyTyped ? typedColor : "text-foreground font-black"
          )}
          data-part="base"
          aria-hidden="true"
        >
          {displayText}
        </span>
        <span className="sr-only">{accessibleLabel}</span>
      </span>
    );
  }

  // ── Tier-2 approved clip: unbroken layered highlight ──────────────────────
  const currentStep = model.currentStep ?? 0;
  const totalSteps = model.totalSteps ?? model.full.length;
  const clipPath = getBengaliGraphemeClip(model.full, currentStep, totalSteps);

  return (
    <span className={cn("bt-grapheme", className)} data-grapheme={model.full} data-strategy={renderPlan.strategy}>
      {/* Base: complete intact target glyph in muted gray */}
      <span
        className="bt-grapheme__base text-muted-foreground/35 dark:text-muted-foreground/45"
        data-part="base"
        aria-hidden="true"
      >
        {displayText}
      </span>

      {/* Overlay: identical intact glyph, approved region revealed */}
      <span
        className={cn("bt-grapheme__overlay", typedColor)}
        data-part="overlay"
        style={{ clipPath }}
        aria-hidden="true"
      >
        {displayText}
      </span>

      {/* Halant indicator dot: pending hasanta state for conjuncts */}
      {model.hasPendingHalant && (
        <span
          className="absolute -bottom-2 sm:-bottom-2.5 left-1/2 -translate-x-1/2 flex items-center justify-center font-mono font-black text-xs leading-none text-green-600 dark:text-green-400 select-none animate-pulse"
          title="হসন্ত (্) সক্রিয়"
        >
          ●
        </span>
      )}
      <span className="sr-only">{accessibleLabel}</span>
    </span>
  );
}
