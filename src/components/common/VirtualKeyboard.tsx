
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

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
    top: [
        {key: 'q', keyCode: 'KeyQ', bn: 'ক্ষ', bnShift: 'ঁ', fingerPosition: 1, fingerName: 'Pinky'},
        {key: 'w', keyCode: 'KeyW', bn: 'ঙ', bnShift: 'ঃ', fingerPosition: 2, fingerName: 'Ring'},
        {key: 'e', keyCode: 'KeyE', bn: 'ে', bnShift: 'ৈ', bnExtra: 'এ', bnShiftExtra: 'ঐ', fingerPosition: 3, fingerName: 'Middle'},
        {key: 'r', keyCode: 'KeyR', bn: 'র', bnShift: 'ড়', fingerPosition: 4, fingerName: 'Index'},
        {key: 't', keyCode: 'KeyT', bn: 'ট', bnShift: 'ঠ', fingerPosition: 4, fingerName: 'Index'},
        {key: 'y', keyCode: 'KeyY', bn: 'য', bnShift: 'য়', fingerPosition: 7, fingerName: 'Index'},
        {key: 'u', keyCode: 'KeyU', bn: 'ু', bnShift: 'ূ', bnExtra: 'উ', bnShiftExtra: 'ঊ', fingerPosition: 7, fingerName: 'Index'},
        {key: 'i', keyCode: 'KeyI', bn: 'ি', bnShift: 'ী', bnExtra: 'ই', bnShiftExtra: 'ঈ', fingerPosition: 8, fingerName: 'Middle'},
        {key: 'o', keyCode: 'KeyO', bn: 'ো', bnShift: 'ৌ', bnExtra: 'ও', bnShiftExtra: 'ঔ', fingerPosition: 9, fingerName: 'Ring'},
        {key: 'p', keyCode: 'KeyP', bn: 'প', bnShift: 'ঢ়', fingerPosition: 10, fingerName: 'Pinky'},
        {key: '[', keyCode: 'BracketLeft', bn: '[', bnShift: '{', fingerPosition: 10, fingerName: 'Pinky'},
        {key: ']', keyCode: 'BracketRight', bn: ']', bnShift: '}', fingerPosition: 10, fingerName: 'Pinky'},
        {key: '\\', keyCode: 'Backslash', bn: 'ৃ', bnShift: 'ঞ', bnExtra: 'ঋ', fingerPosition: 10, fingerName: 'Pinky'},
    ],
    home: [
        {key: 'a', keyCode: 'KeyA', bn: 'া', bnShift: 'অ', bnExtra: 'আ', fingerPosition: 1, fingerName: 'Pinky'},
        {key: 's', keyCode: 'KeyS', bn: 'স', bnShift: 'শ', fingerPosition: 2, fingerName: 'Ring'},
        {key: 'd', keyCode: 'KeyD', bn: 'ড', bnShift: 'ঢ', fingerPosition: 3, fingerName: 'Middle'},
        {key: 'f', keyCode: 'KeyF', bn: 'ফ', bnShift: 'ৎ', fingerPosition: 4, fingerName: 'Index'},
        {key: 'g', keyCode: 'KeyG', bn: 'গ', bnShift: 'ঘ', fingerPosition: 4, fingerName: 'Index'},
        {key: 'h', keyCode: 'KeyH', bn: '्', bnShift: 'হ', fingerPosition: 7, fingerName: 'Index'},
        {key: 'j', keyCode: 'KeyJ', bn: 'জ', bnShift: 'ঝ', fingerPosition: 7, fingerName: 'Index'},
        {key: 'k', keyCode: 'KeyK', bn: 'ক', bnShift: 'খ', fingerPosition: 8, fingerName: 'Middle'},
        {key: 'l', keyCode: 'KeyL', bn: 'ল', bnShift: 'ষ', fingerPosition: 9, fingerName: 'Ring'},
        {key: ';', keyCode: 'Semicolon', bn: ';', bnShift: ':', fingerPosition: 10, fingerName: 'Pinky'},
        {key: "'", keyCode: 'Quote', bn: "'", bnShift: '"', fingerPosition: 10, fingerName: 'Pinky'},
    ],
    bottom: [
        {key: 'ShiftLeft', keyCode: 'ShiftLeft', bn: 'Shift', width: 'w-24', align: 'left', special: 'shift', fingerPosition: 5, fingerName: 'Thumb'},
        {key: 'z', keyCode: 'KeyZ', bn: '्य', bnShift: 'ং', fingerPosition: 1, fingerName: 'Pinky'},
        {key: 'x', keyCode: 'KeyX', bn: 'ত', bnShift: 'থ', fingerPosition: 2, fingerName: 'Ring'},
        {key: 'c', keyCode: 'KeyC', bn: 'চ', bnShift: 'ছ', fingerPosition: 3, fingerName: 'Middle'},
        {key: 'v', keyCode: 'KeyV', bn: 'দ', bnShift: 'ধ', fingerPosition: 4, fingerName: 'Index'},
        {key: 'b', keyCode: 'KeyB', bn: 'ব', bnShift: 'ভ', fingerPosition: 4, fingerName: 'Index'},
        {key: 'n', keyCode: 'KeyN', bn: 'ন', bnShift: 'ণ', fingerPosition: 7, fingerName: 'Index'},
        {key: 'm', keyCode: 'KeyM', bn: 'ম', fingerPosition: 7, fingerName: 'Index'},
        {key: ',', keyCode: 'Comma', bn: ',', bnShift: '<', fingerPosition: 8, fingerName: 'Middle'},
        {key: '.', keyCode: 'Period', bn: '।', bnShift: '>', fingerPosition: 9, fingerName: 'Ring'},
        {key: '/', keyCode: 'Slash', bn: '/', bnShift: '?', fingerPosition: 10, fingerName: 'Pinky'},
        {key: 'ShiftRight', keyCode: 'ShiftRight', bn: 'Shift', width: 'flex-grow', align: 'right', special: 'shift', fingerPosition: 6, fingerName: 'Thumb'},
    ],
    space: [
        {key: ' ', keyCode: 'Space', bn: 'Space', width: 'w-96', fingerPosition: 5, fingerName: 'Thumb'},
    ]
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

export const SimplifiedKeyboard = ({ highlightKeyCode, needsShift }: { highlightKeyCode?: string, needsShift: boolean }) => (
    <div className="p-2 sm:p-4 bg-background rounded-lg shadow-inner space-y-1.5 hidden md:block">
        {Object.values(simplifiedKeyboardLayout).map((row, rowIndex) => (
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
