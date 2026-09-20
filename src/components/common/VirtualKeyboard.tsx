"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  getKeyboardLayoutConfig,
  type ResolvedKeyInfo,
  FINGER_BENGALI_NAMES,
} from "@/lib/keyboard-layouts";
import { Badge } from "@/components/ui/badge";

export type KeyLayoutData = {
  key: string;
  keyCode: string;
  bn?: string;
  bnShift?: string;
  bnExtra?: string;
  bnShiftExtra?: string;
  width?: string;
  align?: "left" | "right";
  special?: "shift";
  fingerPosition?: number;
  fingerName?: string;
};

// Distinct finger color palette for finger zone mapping
const FINGER_COLORS: Record<number, string> = {
  1: "bg-red-100 dark:bg-red-950/40 border-red-200 dark:border-red-900/50", // Left Pinky
  2: "bg-orange-100 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/50", // Left Ring
  3: "bg-yellow-100 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-900/50", // Left Middle
  4: "bg-green-100 dark:bg-green-950/40 border-green-200 dark:border-green-900/50", // Left Index
  5: "bg-cyan-100 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900/50", // Left Thumb
  6: "bg-cyan-100 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900/50", // Right Thumb
  7: "bg-green-100 dark:bg-green-950/40 border-green-200 dark:border-green-900/50", // Right Index
  8: "bg-yellow-100 dark:bg-yellow-950/40 border-yellow-200 dark:border-yellow-900/50", // Right Middle
  9: "bg-orange-100 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900/50", // Right Ring
  10: "bg-red-100 dark:bg-red-950/40 border-red-200 dark:border-red-900/50", // Right Pinky
};

const Key = ({
  data,
  isHighlighted,
  needsShift,
  isShiftHighlighted,
}: {
  data: KeyLayoutData;
  isHighlighted: boolean;
  needsShift: boolean;
  isShiftHighlighted: boolean;
}) => {
  const { key, bn, bnShift, bnExtra, bnShiftExtra, width, align, special, fingerPosition } = data;
  const isShiftKey = special === "shift";

  if (isShiftKey) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center h-11 sm:h-12 md:h-13 lg:h-14 rounded-xl border font-mono font-bold text-xs sm:text-sm transition-all select-none shadow-xs shrink-0",
          width || "w-14 sm:w-16 md:w-20 lg:w-22 xl:w-24",
          align === "left" && "mr-auto",
          align === "right" && "ml-auto",
          isShiftHighlighted
            ? "bg-amber-500 text-white border-amber-600 ring-4 ring-amber-400 ring-offset-1 animate-pulse font-black shadow-lg z-20"
            : "bg-secondary/70 text-muted-foreground border-border"
        )}
      >
        <span>Shift ⇧</span>
      </div>
    );
  }

  if (key === " ") {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center h-10 sm:h-11 md:h-12 lg:h-13 rounded-xl border font-medium text-xs sm:text-sm transition-all select-none shadow-xs",
          width || "w-[75%] sm:w-[80%] md:w-[85%] max-w-2xl lg:max-w-3xl xl:max-w-4xl",
          isHighlighted
            ? "bg-primary text-primary-foreground border-primary ring-4 ring-primary/40 ring-offset-2 font-bold shadow-lg z-20 animate-pulse"
            : "bg-secondary/60 text-muted-foreground border-border hover:bg-secondary"
        )}
      >
        <span>স্পেসবার (Spacebar)</span>
      </div>
    );
  }

  const baseKeyClasses = cn(
    "relative flex flex-col items-center justify-center h-11 sm:h-12 md:h-13 lg:h-14 rounded-xl border font-hind transition-all select-none shadow-xs shrink-0",
    width || "w-9 sm:w-10 md:w-11 lg:w-12 xl:w-13",
    fingerPosition && FINGER_COLORS[fingerPosition],
    isHighlighted
      ? "bg-primary text-primary-foreground border-primary ring-4 ring-primary/40 ring-offset-2 scale-105 font-bold shadow-xl z-20 duration-150"
      : "hover:bg-secondary/90 border-border/80 text-foreground"
  );

  const hasFourChars = bn && bnShift && bnExtra && bnShiftExtra;
  if (hasFourChars) {
    return (
      <div className={cn(baseKeyClasses, "grid grid-cols-2 grid-rows-2 p-1 text-center")}>
        <span className="text-[9px] sm:text-[10px] text-muted-foreground self-start justify-self-start">{bnShiftExtra}</span>
        <span className="text-[9px] sm:text-[10px] text-muted-foreground self-start justify-self-end">{bnExtra}</span>
        <span className={cn("text-xs sm:text-sm font-bold self-end justify-self-start", isHighlighted && needsShift && "text-white font-black text-sm sm:text-base")}>
          {bnShift}
        </span>
        <span className={cn("text-xs sm:text-sm font-bold self-end justify-self-end", isHighlighted && !needsShift && "text-white font-black text-sm sm:text-base")}>
          {bn}
        </span>
      </div>
    );
  }

  return (
    <div className={baseKeyClasses}>
      <span
        className={cn(
          "text-[10px] sm:text-xs leading-none",
          isHighlighted && needsShift
            ? "font-extrabold text-white text-sm sm:text-base scale-110 drop-shadow-sm"
            : isHighlighted
            ? "text-primary-foreground/70"
            : "text-muted-foreground/80"
        )}
      >
        {bnShift}
      </span>
      <span
        className={cn(
          "text-sm sm:text-base md:text-lg lg:text-xl font-bold font-headline leading-tight mt-0.5",
          isHighlighted && !needsShift
            ? "font-extrabold text-white text-lg sm:text-xl md:text-2xl scale-110 drop-shadow-sm"
            : isHighlighted
            ? "text-primary-foreground"
            : "text-foreground"
        )}
      >
        {bn}
      </span>
      <span className="absolute top-0.5 left-1 text-[8px] sm:text-[9px] font-mono opacity-40 uppercase">
        {data.key}
      </span>
    </div>
  );
};

interface SimplifiedKeyboardProps {
  highlightKeyCode?: string;
  needsShift?: boolean;
  resolvedKeyInfo?: ResolvedKeyInfo | null;
  showFingerGuide?: boolean;
  layout?: string;
  className?: string;
}

export const SimplifiedKeyboard = ({
  highlightKeyCode,
  needsShift = false,
  resolvedKeyInfo,
  showFingerGuide = true,
  layout,
  className,
}: SimplifiedKeyboardProps) => {
  const layoutConfig = getKeyboardLayoutConfig(layout);
  const rows = {
    top: layoutConfig.top as KeyLayoutData[],
    home: layoutConfig.home as KeyLayoutData[],
    bottom: layoutConfig.bottom as KeyLayoutData[],
    space: layoutConfig.space as KeyLayoutData[],
  };

  const activeTargetKeyCode = resolvedKeyInfo?.keyCode || highlightKeyCode;
  const isShiftNeeded = needsShift || !!resolvedKeyInfo?.needsShift;

  const activeFingerLabel =
    resolvedKeyInfo?.bengaliFingerLabel ||
    (resolvedKeyInfo?.fingerPosition ? FINGER_BENGALI_NAMES[resolvedKeyInfo.fingerPosition] : undefined);

  return (
    <div className={cn("p-3 sm:p-4 md:p-5 bg-card border rounded-2xl shadow-xs space-y-3", className)}>
      {/* Active Finger & Key Instruction Banner */}
      {showFingerGuide && (highlightKeyCode || resolvedKeyInfo) && (
        <div className="flex flex-wrap items-center justify-between gap-2 py-2 px-3 sm:px-4 bg-secondary/60 rounded-xl border text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground font-medium">কী চাপবেন:</span>
            <Badge className="bg-primary text-primary-foreground font-bold px-2.5 py-0.5 text-sm sm:text-base">
              {resolvedKeyInfo?.char || highlightKeyCode?.replace("Key", "") || "Space"}
            </Badge>

            {resolvedKeyInfo?.key && (
              <span className="text-xs sm:text-sm font-mono text-muted-foreground bg-background px-2 py-0.5 rounded border">
                কীবোর্ড: [{resolvedKeyInfo.key.toUpperCase()}]
              </span>
            )}

            {isShiftNeeded && (
              <Badge variant="destructive" className="animate-pulse text-xs gap-1 font-bold py-0.5">
                ⇧ Shift বোতাম চাপুন
              </Badge>
            )}

            {resolvedKeyInfo?.processHint && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-semibold px-2.5 py-0.5 text-xs sm:text-sm">
                প্রসেস: {resolvedKeyInfo.processHint}
              </Badge>
            )}
          </div>

          {activeFingerLabel && (
            <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary">
              <span>আঙুল:</span>
              <span className="underline decoration-primary font-bold">{activeFingerLabel}</span>
            </div>
          )}
        </div>
      )}

      {/* Keyboard Grid */}
      <div className="space-y-1.5 overflow-x-auto px-1 sm:px-2 pb-1 max-w-full">
        {/* Top Row */}
        <div className="flex justify-center gap-1 sm:gap-1.5 md:gap-2">
          {rows.top.map((keyData) => {
            const isHighlighted = activeTargetKeyCode === keyData.keyCode;
            return (
              <Key
                key={keyData.keyCode}
                data={keyData}
                isHighlighted={isHighlighted}
                needsShift={isShiftNeeded}
                isShiftHighlighted={false}
              />
            );
          })}
        </div>

        {/* Home Row */}
        <div className="flex justify-center gap-1 sm:gap-1.5 md:gap-2">
          {rows.home.map((keyData) => {
            const isHighlighted = activeTargetKeyCode === keyData.keyCode;
            return (
              <Key
                key={keyData.keyCode}
                data={keyData}
                isHighlighted={isHighlighted}
                needsShift={isShiftNeeded}
                isShiftHighlighted={false}
              />
            );
          })}
        </div>

        {/* Bottom Row */}
        <div className="flex justify-center gap-1 sm:gap-1.5 md:gap-2">
          {rows.bottom.map((keyData) => {
            const isShiftKey = keyData.special === "shift";
            const isHighlighted = activeTargetKeyCode === keyData.keyCode;
            return (
              <Key
                key={keyData.keyCode || keyData.key}
                data={keyData}
                isHighlighted={isHighlighted}
                needsShift={isShiftNeeded}
                isShiftHighlighted={isShiftKey && isShiftNeeded}
              />
            );
          })}
        </div>

        {/* Space Row */}
        <div className="flex justify-center pt-1">
          {rows.space.map((keyData) => {
            const isSpaceHighlighted =
              activeTargetKeyCode === "Space" ||
              activeTargetKeyCode === "space" ||
              (!activeTargetKeyCode && resolvedKeyInfo?.char === " ");
            return (
              <Key
                key={keyData.keyCode || keyData.key}
                data={keyData}
                isHighlighted={isSpaceHighlighted}
                needsShift={isShiftNeeded}
                isShiftHighlighted={false}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
