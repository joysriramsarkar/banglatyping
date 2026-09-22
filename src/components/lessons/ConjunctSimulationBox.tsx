"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { GraphemeRenderModel } from "@/lib/bengali-grapheme";

function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}

interface ConjunctSimulationBoxProps {
  model: GraphemeRenderModel;
  className?: string;
}

/**
 * Modern, beautifully styled standalone Conjunct Simulation HUD Card.
 * Renders the component decomposition formula:
 *   [ক] + [ক্] + [র] = [ক্র]
 *   [ক] + [ক্] + [ত] = [ক্ত]
 *   [ষ] + [্] + [ঠ] + [া] = [ষ্ঠা]
 *
 * Docked cleanly underneath prompt cards without breaking word baselines.
 */
export function ConjunctSimulationBox({ model, className }: ConjunctSimulationBoxProps) {
  if (!model.isComplex || !model.conjunctSteps || model.conjunctSteps.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center gap-2 px-4 py-2.5 rounded-2xl",
        "bg-card/95 dark:bg-card/90 border border-primary/25 shadow-md shadow-primary/5 backdrop-blur-md",
        "animate-in fade-in zoom-in-95 duration-200 select-none",
        className
      )}
      aria-label="যুক্তাক্ষর সিমুলেশন স্ক্রিন"
    >
      {/* Simulation Header */}
      <div className="flex items-center gap-1.5 text-xs font-bold text-primary tracking-wide">
        <SparklesIcon className="w-3.5 h-3.5 text-primary animate-pulse" />
        <span>যুক্তাক্ষর সিমুলেশন</span>
      </div>

      {/* Formula Decomposition Steps */}
      <div className="flex items-center flex-wrap justify-center gap-1 sm:gap-1.5">
        {model.conjunctSteps.map((step, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && (
              <span className="text-primary/70 dark:text-primary/60 font-bold text-sm sm:text-base select-none px-0.5">
                +
              </span>
            )}
            <span
              className={cn(
                "text-sm sm:text-base font-hind font-bold leading-none px-2.5 py-1 sm:py-1.5 rounded-lg border transition-all duration-150 flex items-center gap-1.5 shadow-xs",
                step.completed
                  ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/35 font-black"
                  : step.active
                  ? "bg-primary text-primary-foreground border-primary font-black ring-2 ring-primary/40 shadow-sm scale-105"
                  : "bg-muted/40 text-muted-foreground/60 border-border/50 font-medium"
              )}
            >
              <span>{step.label}</span>
              <span className="text-[10px] font-mono leading-none">
                {step.completed ? "✓" : step.active ? "●" : "○"}
              </span>
            </span>
          </React.Fragment>
        ))}

        {/* Equals Sign & Target Ligature */}
        <span className="text-muted-foreground/50 font-bold text-sm select-none px-1">=</span>
        <span className="text-base sm:text-lg font-hind font-black px-3 py-1 rounded-lg bg-primary/10 border border-primary/30 text-primary">
          {model.full}
        </span>
      </div>

      {/* Special Shortcut Hint Badge */}
      {model.specialHint && (
        <div className="text-[11px] sm:text-xs text-amber-700 dark:text-amber-400 font-sans font-medium bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full mt-0.5">
          {model.specialHint}
        </div>
      )}
    </div>
  );
}
