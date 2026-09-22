"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  type GraphemeRenderModel,
  getBengaliGraphemeClip,
} from "@/lib/bengali-grapheme";

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
}

/**
 * Renders a single Bengali grapheme cluster without breaking font shaping:
 *
 * 1. Kar clusters ('কা', 'টি', 'কু') & Transparent conjuncts ('প্ত', 'চ্ছ', 'জ্ব', 'প্র', 'দ্র', 'রু', 'রূ'):
 *    - Unbroken glyph rendering via layered underlay (gray) and overlay with getBengaliGraphemeClip.
 *    - Halant indicator dot ('.') displayed below when halant ('্') is typed for transparent conjuncts.
 *
 * 2. Complex conjuncts ('ক্ত', 'ত্র', 'ট্ট', 'ক্র', 'ক্ষ', 'জ্ঞ'):
 *    - Full target glyph displayed cleanly without breaking text baselines.
 *    - The simulation decomposition box is cleanly handled by ConjunctSimulationBox.
 */
export function GraphemeDisplay({ model, className, isError, showSimulationBox = false }: GraphemeDisplayProps) {
  const typedColor = isError
    ? "text-red-500 font-black"
    : "text-green-600 dark:text-green-400 font-black";

  // ── 1. Complex Conjuncts: Full Glyph (unbroken baseline) ───────────────────
  if (model.isComplex && model.conjunctSteps && model.conjunctSteps.length > 0) {
    const isFullyTyped = (model.currentStep ?? 0) >= (model.totalSteps ?? model.full.length);
    const glyphColor = isFullyTyped ? typedColor : "text-foreground font-black";

    if (showSimulationBox) {
      return (
        <span className={cn("inline-flex flex-col items-center select-none", className)}>
          <span className={cn("leading-none select-none", glyphColor)}>
            {model.full}
          </span>
          <ConjunctSimulationBox model={model} className="mt-2" />
        </span>
      );
    }

    return (
      <span className={cn("relative inline-flex items-center justify-center leading-none select-none", className)}>
        <span className={cn("leading-none select-none", glyphColor)}>
          {model.full}
        </span>
      </span>
    );
  }

  // ── 2. Kar & Transparent Conjuncts: Unbroken Layered Clip-Path ──────────────
  const currentStep = model.currentStep ?? 0;
  const totalSteps = model.totalSteps ?? model.full.length;
  const clipPath = getBengaliGraphemeClip(model.full, currentStep, totalSteps);

  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center leading-none select-none",
        className
      )}
    >
      {/* Base Underlay: Complete unbroken target glyph in muted gray */}
      <span
        className="text-muted-foreground/35 dark:text-muted-foreground/45 select-none leading-none"
        aria-hidden="true"
      >
        {model.full}
      </span>

      {/* Active Overlay: Identical unbroken glyph clipped to reveal typed progress */}
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center select-none pointer-events-none leading-none transition-all duration-150",
          typedColor
        )}
        style={{ clipPath }}
        aria-hidden="true"
      >
        {model.full}
      </span>

      {/* Halant indicator dot: Indicates halant ('্') state for transparent conjuncts */}
      {model.hasPendingHalant && (
        <span
          className="absolute -bottom-2 sm:-bottom-2.5 left-1/2 -translate-x-1/2 flex items-center justify-center font-mono font-black text-xs leading-none text-green-600 dark:text-green-400 select-none animate-pulse"
          title="হসন্ত (্) সক্রিয়"
        >
          ●
        </span>
      )}
    </span>
  );
}
