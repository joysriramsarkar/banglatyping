"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { GraphemeRenderModel, GraphemePart } from "@/lib/bengali-grapheme";

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
}

/**
 * Renders a single Bengali grapheme cluster using the semantic-parts model.
 *
 * পরিকল্পনা.md §৬–৯ অনুযায়ী:
 *
 * - simple/kar: পৃথক <span> দিয়ে typed/current/pending render করা (clipPath নেই)
 *   যেমন: <span class="typed">ট</span><span class="pending">ি</span>
 *
 * - conjunct: full target glyph দেখাবে + নিচে decomposition panel
 *   যেমন: ক্ত এবং "ক ✓ → ক্ ○ → ক্ত ○"
 */
export function GraphemeDisplay({ model, className, isError }: GraphemeDisplayProps) {
  const typedClass = isError
    ? "text-red-500 font-black"
    : "text-green-600 dark:text-green-400 font-black";
  const currentClass = "text-foreground font-black";
  const pendingClass = "text-muted-foreground/35 dark:text-muted-foreground/45";

  function partClass(part: GraphemePart): string {
    switch (part.state) {
      case "typed":    return typedClass;
      case "current":  return currentClass;
      case "pending":  return pendingClass;
    }
  }

  // ── conjunct: full glyph + decomposition panel ──────────────────────────────
  if (model.kind === "conjunct" && model.conjunctSteps && model.conjunctSteps.length > 1) {
    const overallState = model.parts[0]?.state ?? "pending";
    const glyphClass =
      overallState === "typed"
        ? typedClass
        : overallState === "current"
        ? currentClass
        : pendingClass;

    // Find the index of the first incomplete step for "current" highlighting
    const firstIncompleteIdx = model.conjunctSteps.findIndex(s => !s.completed);

    return (
      // Outer wrapper — column layout so the panel sits below the glyph
      // The parent font-size is inherited; we do not override it here.
      <span className={cn("inline-flex flex-col items-center gap-1", className)}>
        {/* Full target glyph */}
        <span className={cn("leading-none select-none", glyphClass)}>
          {model.full}
        </span>

        {/* Decomposition panel — শুধু যুক্তাক্ষরের জন্য */}
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-background/80 border border-border/60 shadow-xs"
          aria-label="যুক্তাক্ষর তৈরির ধাপ"
        >
          {model.conjunctSteps.map((step, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <span className="text-muted-foreground/50 text-xs font-mono select-none">→</span>
              )}
              <span
                className={cn(
                  "text-xs sm:text-sm font-hind font-bold leading-none px-0.5 transition-colors duration-150",
                  step.completed
                    ? "text-green-600 dark:text-green-400"
                    : idx === firstIncompleteIdx
                    ? "text-foreground"
                    : "text-muted-foreground/40"
                )}
              >
                {step.label}
                <span className="ml-0.5 text-[9px] font-mono">
                  {step.completed ? "✓" : "○"}
                </span>
              </span>
            </React.Fragment>
          ))}
        </span>
      </span>
    );
  }

  // ── simple / kar: render parts individually (no clipPath) ───────────────────
  return (
    <span className={cn("inline-flex items-baseline leading-none select-none", className)}>
      {model.parts.map((part, idx) => (
        <span
          key={idx}
          className={cn("leading-none transition-colors duration-100", partClass(part))}
        >
          {part.text}
        </span>
      ))}
    </span>
  );
}
