
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getKeyboardLayoutConfig, type KeyboardLayoutKey } from "@/lib/keyboard-layouts";

export type KeyLayoutData = {
    key: string;
    keyCode: string;
    bn?: string;
    bnShift?: string;
    bnExtra?: string;
    bnShiftExtra?: string;
    width?: string;
    align?: 'left' | 'right';
    special?: 'shift';
    fingerPosition?: number;
    fingerName?: string;
};

// Finger position color mapping
const FINGER_COLORS: Record<number, string> = {
    1: 'bg-red-200 dark:bg-red-900',      // Pinky - Red
    2: 'bg-orange-200 dark:bg-orange-900', // Ring - Orange
    3: 'bg-yellow-200 dark:bg-yellow-900', // Middle - Yellow
    4: 'bg-green-200 dark:bg-green-900',   // Index - Green
    5: 'bg-cyan-200 dark:bg-cyan-900',     // Left Thumb - Cyan
    6: 'bg-cyan-200 dark:bg-cyan-900',     // Right Thumb - Cyan
    7: 'bg-green-200 dark:bg-green-900',   // Index - Green
    8: 'bg-yellow-200 dark:bg-yellow-900', // Middle - Yellow
    9: 'bg-orange-200 dark:bg-orange-900', // Ring - Orange
    10: 'bg-red-200 dark:bg-red-900',      // Pinky - Red
};

const simplifiedKeyboardLayout: Record<string, KeyLayoutData[]> = {
    top: [],
    home: [],
    bottom: [],
    space: [],
};

const Key = ({ data, isHighlighted, needsShift }: { data: KeyLayoutData, isHighlighted: boolean, needsShift: boolean }) => {
    const { key, bn, bnShift, bnExtra, bnShiftExtra, width, align, special, fingerPosition } = data;

    const isShiftKey = special === 'shift';

    const baseKeyClasses = cn(
        "relative flex flex-col items-center justify-center h-16 rounded-md bg-secondary border border-b-4 font-hind transition-colors",
        width || 'w-16',
        fingerPosition && FINGER_COLORS[fingerPosition],
        isShiftKey ? (needsShift && 'bg-primary/20 border-primary text-primary') : (isHighlighted && 'bg-primary/20 border-primary text-primary'),
        align === 'left' && 'mr-auto',
        align === 'right' && 'ml-auto',
    );

    if (special === 'shift' || key === ' ') {
        return (
            <div className={baseKeyClasses}>
                <span className="text-sm font-bold">{bn}</span>
            </div>
        )
    }

    const hasFourChars = bn && bnShift && bnExtra && bnShiftExtra;

    if (hasFourChars) {
       return (
            <div className={cn(baseKeyClasses, "grid grid-cols-2 grid-rows-2 p-1 text-center")}>
                 <span className="text-sm text-muted-foreground self-start justify-self-start">{bnShiftExtra}</span>
                 <span className="text-sm text-muted-foreground self-start justify-self-end">{bnExtra}</span>
                 <span className="text-lg font-bold self-end justify-self-start">{bnShift}</span>
                 <span className="text-lg font-bold self-end justify-self-end">{bn}</span>
            </div>
        )
    }

    const hasThreeChars = bn && bnShift && bnExtra;
    if (hasThreeChars) {
        return (
             <div className={cn(baseKeyClasses, "grid grid-cols-2 grid-rows-2 p-1 text-center")}>
                 <span className="text-sm text-muted-foreground col-span-2 justify-self-center self-start">{bnExtra}</span>
                 <span className="text-lg font-bold self-end justify-self-start">{bnShift}</span>
                 <span className="text-lg font-bold self-end justify-self-end">{bn}</span>
            </div>
         )
    }

    return (
        <div className={baseKeyClasses}>
            <span className={cn(
                "text-sm text-muted-foreground",
                (isHighlighted && needsShift) && "font-bold text-lg text-primary"
            )}>
                {bnShift}
            </span>
            <span className={cn(
                "text-lg font-bold",
                (isHighlighted && !needsShift) && "text-primary text-2xl"
            )}>
                {bn}
            </span>
        </div>
    );
}

export const SimplifiedKeyboard = ({ highlightKeyCode, needsShift, layout = 'avro' }: { highlightKeyCode?: string, needsShift: boolean, layout?: KeyboardLayoutKey | string }) => {
    const layoutConfig = getKeyboardLayoutConfig(layout);
    const rows = {
        top: layoutConfig.top as KeyLayoutData[],
        home: layoutConfig.home as KeyLayoutData[],
        bottom: layoutConfig.bottom as KeyLayoutData[],
        space: layoutConfig.space as KeyLayoutData[],
    };

    return (
        <div className="p-2 sm:p-4 bg-background rounded-lg shadow-inner space-y-1.5 hidden md:block">
            {Object.values(rows).map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center gap-1.5">
                    {row.map(keyData => {
                        let isHighlighted = false;
                        if (highlightKeyCode) {
                            if (keyData.special === 'shift') {
                                isHighlighted = false;
                            } else {
                                isHighlighted = keyData.keyCode === highlightKeyCode;
                            }
                        }

                        return <Key key={keyData.key} data={keyData} isHighlighted={isHighlighted} needsShift={needsShift} />;
                    })}
                </div>
            ))}
        </div>
    );
};
