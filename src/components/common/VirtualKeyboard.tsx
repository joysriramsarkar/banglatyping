
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type KeyLayoutData = {
    key: string;
    bn?: string;
    bnShift?: string;
    bnExtra?: string;
    bnShiftExtra?: string;
    width?: string;
    align?: 'left' | 'right';
    special?: 'shift';
};

const simplifiedKeyboardLayout: Record<string, KeyLayoutData[]> = {
    top: [
        {key: 'q', bn: 'ক্ষ', bnShift: 'ঁ'},
        {key: 'w', bn: 'ঙ', bnShift: 'ঃ'},
        {key: 'e', bn: 'ে', bnShift: 'ৈ', bnExtra: 'এ', bnShiftExtra: 'ঐ'},
        {key: 'r', bn: 'র', bnShift: 'ড়'},
        {key: 't', bn: 'ট', bnShift: 'ঠ'},
        {key: 'y', bn: 'য', bnShift: 'য়'},
        {key: 'u', bn: 'ু', bnShift: 'ূ', bnExtra: 'উ', bnShiftExtra: 'ঊ'},
        {key: 'i', bn: 'ি', bnShift: 'ী', bnExtra: 'ই', bnShiftExtra: 'ঈ'},
        {key: 'o', bn: 'ো', bnShift: 'ৌ', bnExtra: 'ও', bnShiftExtra: 'ঔ'},
        {key: 'p', bn: 'প', bnShift: 'ঢ়'},
        {key: '[', bn: '[', bnShift: '{'},
        {key: ']', bn: ']', bnShift: '}'},
        {key: '\\', bn: 'ৃ', bnShift: 'ঞ', bnExtra: 'ঋ'},
    ],
    home: [
        {key: 'a', bn: 'া', bnShift: 'অ', bnExtra: 'আ'},
        {key: 's', bn: 'স', bnShift: 'শ'},
        {key: 'd', bn: 'ড', bnShift: 'ঢ'},
        {key: 'f', bn: 'ফ', bnShift: 'ৎ'},
        {key: 'g', bn: 'গ', bnShift: 'ঘ'},
        {key: 'h', bn: '্', bnShift: 'হ'},
        {key: 'j', bn: 'জ', bnShift: 'ঝ'},
        {key: 'k', bn: 'ক', bnShift: 'খ'},
        {key: 'l', bn: 'ল', bnShift: 'ষ'},
        {key: ';', bn: ';', bnShift: ':'},
        {key: "'", bn: "'", bnShift: '"'},
    ],
    bottom: [
        {key: 'ShiftLeft', bn: 'Shift', width: 'w-24', align: 'left', special: 'shift'},
        {key: 'z', bn: '্য', bnShift: 'ং'},
        {key: 'x', bn: 'ত', bnShift: 'থ'},
        {key: 'c', bn: 'চ', bnShift: 'ছ'},
        {key: 'v', bn: 'দ', bnShift: 'ধ'},
        {key: 'b', bn: 'ব', bnShift: 'ভ'},
        {key: 'n', bn: 'ন', bnShift: 'ণ'},
        {key: 'm', bn: 'ম'},
        {key: ',', bn: ',', bnShift: '<'},
        {key: '.', bn: '।', bnShift: '>'},
        {key: '/', bn: '/', bnShift: '?'},
        {key: 'ShiftRight', bn: 'Shift', width: 'flex-grow', align: 'right', special: 'shift'},
    ],
    space: [
        {key: ' ', bn: 'Space', width: 'w-96'},
    ]
};

const Key = ({ data, isHighlighted, needsShift }: { data: KeyLayoutData, isHighlighted: boolean, needsShift: boolean }) => {
    const { key, bn, bnShift, bnExtra, bnShiftExtra, width, align, special } = data;

    const isShiftKey = special === 'shift';

    const baseKeyClasses = cn(
        "relative flex flex-col items-center justify-center h-16 rounded-md bg-secondary border border-b-4 font-hind transition-colors",
        width || 'w-16',
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

export const SimplifiedKeyboard = ({ highlightKey, needsShift }: { highlightKey: string | undefined, needsShift: boolean }) => (
    <div className="p-2 sm:p-4 bg-background rounded-lg shadow-inner space-y-1.5 hidden md:block">
        {Object.values(simplifiedKeyboardLayout).map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1.5">
                {row.map(keyData => {
                    let isHighlighted = false;
                    if (highlightKey) {
                        if (highlightKey === ' ') {
                           isHighlighted = keyData.key === ' ';
                        } else if (keyData.special === 'shift') {
                           isHighlighted = false;
                        }
                        else {
                           isHighlighted = keyData.key.toLowerCase() === highlightKey.toLowerCase();
                        }
                    }

                    return <Key key={keyData.key} data={keyData} isHighlighted={isHighlighted} needsShift={needsShift} />;
                })}
            </div>
        ))}
    </div>
);
