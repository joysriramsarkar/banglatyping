import * as React from "react";
import { CheckCircle } from "lucide-react";
import { cn, toBengaliNumber } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { Drill } from "@/lib/types";
import { buildGraphemeRenderModel, bengaliSegmenter, normalizeBengaliString } from "@/lib/bengali-grapheme";
import { GraphemeDisplay } from "@/components/lessons/GraphemeDisplay";

interface DrillPromptDisplayProps {
    drills: Drill[];
    currentDrillIndex: number;
    currentStepIndex?: number;
    status: 'pending' | 'correct' | 'incorrect';
}

export const DrillPromptDisplay: React.FC<DrillPromptDisplayProps> = ({ drills, currentDrillIndex, currentStepIndex = 0, status }) => {
    const getVisibleDrills = () => {
        const visible: Drill[] = [];
        const startIndex = Math.floor(currentDrillIndex / 10) * 10;
        for(let i = startIndex; i < startIndex + 10 && i < drills.length; i++) {
            visible.push(drills[i]);
        }
        return visible;
    };

    const renderDrillPrompt = (drillData: Drill, isCurrent: boolean, isCompleted: boolean, key: string | number) => {
        let boxClass = "bg-secondary/40 text-foreground border-border";
        if (isCompleted) boxClass = "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400";
        if (isCurrent && status === 'incorrect') boxClass = "bg-red-500/15 border-red-500 text-red-600 ring-4 ring-red-500/30 ring-offset-1";
        if (isCurrent && status === 'correct') boxClass = "bg-green-500/15 border-green-500 text-green-600 ring-4 ring-green-500/30 ring-offset-1";
        if (isCurrent && status === 'pending') boxClass = "bg-primary/10 border-primary text-primary ring-4 ring-primary/30 ring-offset-2 scale-105 shadow-md";

        // Spacebar prompt
        if (drillData.prompt === ' ') {
            return (
                <div
                    key={key}
                    className={cn(
                        "flex items-center justify-center h-20 sm:h-24 px-5 sm:px-7 min-w-[5rem] sm:min-w-[6.5rem] rounded-2xl border-2 transition-all select-none shadow-sm",
                        boxClass,
                        !isCurrent && !isCompleted && "border-dashed opacity-80"
                    )}
                >
                    {isCompleted ? (
                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-bold text-sm sm:text-base">
                            <span className="font-mono text-2xl leading-none">␣</span>
                            <CheckCircle className="h-5 w-5 shrink-0" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-sm sm:text-base font-semibold">
                            <span className="font-mono text-2xl sm:text-3xl leading-none">␣</span>
                            <span className="text-primary font-bold font-headline">স্পেস</span>
                        </div>
                    )}
                </div>
            );
        }

        const isMultiChar = drillData.prompt.length > 2;

        return (
            <div
                key={key}
                className={cn(
                    "flex items-center justify-center h-20 sm:h-24 rounded-2xl border-2 font-hind font-black transition-all select-none shadow-sm",
                    isMultiChar ? "px-6 sm:px-8 min-w-[7rem] sm:min-w-[8.5rem] text-3xl sm:text-4xl md:text-5xl whitespace-nowrap" : "px-4 min-w-[5rem] sm:min-w-[6rem] text-4xl sm:text-5xl md:text-6xl",
                    boxClass
                )}
            >
                {isCompleted ? (
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <span>{drillData.prompt}</span>
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                    </div>
                ) : isCurrent ? (
                    <span className="relative inline-flex items-center justify-center leading-none whitespace-pre">
                        {(() => {
                            const clusters = bengaliSegmenter.segmentString(normalizeBengaliString(drillData.prompt));
                            // টাইপ করা characters সংখ্যা grapheme-aware পদ্ধতিতে বের করা
                            const typedClusters = clusters.slice(0, currentStepIndex);
                            const typedSoFar = typedClusters.join('');

                            return clusters.map((cluster, cIdx) => {
                                const normCluster = normalizeBengaliString(cluster);

                                // Inter-word space character
                                if (cluster === ' ' || cluster === '\u00A0' || !cluster.trim()) {
                                    const isTyped = cIdx < currentStepIndex;
                                    return (
                                        <span
                                            key={`drill-c-${cIdx}`}
                                            className={cn(
                                                "inline-block select-none shrink-0",
                                                isTyped
                                                    ? "text-green-600 dark:text-green-400"
                                                    : currentStepIndex > 0
                                                    ? "text-muted-foreground/35 dark:text-muted-foreground/45"
                                                    : "text-primary"
                                            )}
                                            style={{ width: '0.35em' }}
                                            aria-hidden="true"
                                        >
                                            {'\u00A0'}
                                        </span>
                                    );
                                }

                                // Fully typed cluster → pure green
                                if (cIdx < currentStepIndex) {
                                    return (
                                        <span key={`drill-c-${cIdx}`} className="text-green-600 dark:text-green-400 font-black">
                                            {cluster}
                                        </span>
                                    );
                                }

                                // Untyped cluster → next active or muted
                                if (cIdx > currentStepIndex) {
                                    return (
                                        <span
                                            key={`drill-c-${cIdx}`}
                                            className="text-muted-foreground/40 dark:text-muted-foreground/45"
                                        >
                                            {cluster}
                                        </span>
                                    );
                                }

                                // cIdx === currentStepIndex → current cluster being typed
                                // Check for intra-cluster partial progress
                                const partialTyped = typedSoFar.slice(typedClusters.join('').length);
                                if (partialTyped && normCluster.startsWith(normalizeBengaliString(partialTyped)) && normalizeBengaliString(partialTyped) !== normCluster) {
                                    const renderModel = buildGraphemeRenderModel(normCluster, normalizeBengaliString(partialTyped));
                                    return (
                                        <GraphemeDisplay
                                            key={`drill-c-${cIdx}`}
                                            model={renderModel}
                                        />
                                    );
                                }

                                // Current cluster, not yet started → foreground
                                return (
                                    <span
                                        key={`drill-c-${cIdx}`}
                                        className="text-foreground font-black"
                                    >
                                        {cluster}
                                    </span>
                                );
                            });
                        })()}
                    </span>
                ) : (
                    <span>{drillData.prompt}</span>
                )}
            </div>
        );
    };

    const visibleDrills = getVisibleDrills();
    const promptsWithSpacers: (Drill | {isSpacer: true})[] = [];
    visibleDrills.forEach((drill, index) => {
        promptsWithSpacers.push(drill);
        const originalIndex = drills.indexOf(drill);
        if (drill.prompt === ' ' && (originalIndex + 1) % 5 === 0 && index < visibleDrills.length - 1) {
           promptsWithSpacers.push({ isSpacer: true });
        }
    });

    const progressPercent = Math.min(100, Math.round((currentDrillIndex / Math.max(1, drills.length)) * 100));

    return (
        <div className="space-y-3 bg-card p-5 sm:p-7 rounded-2xl border shadow-xs transition-all">
            {/* Real-time Progress Bar and Counter Header */}
            <div className="space-y-1.5 pb-2 border-b">
                <div className="flex items-center justify-between text-xs sm:text-sm font-medium">
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">অগ্রগতি:</span>
                        <strong className="text-primary font-bold text-sm sm:text-base">
                            {toBengaliNumber(currentDrillIndex)}
                        </strong>
                        <span className="text-muted-foreground">/ {toBengaliNumber(drills.length)} টি আইটেম</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                            {toBengaliNumber(progressPercent)}%
                        </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {currentDrillIndex >= drills.length ? (
                            <span className="text-green-600 font-bold">সম্পূর্ণ সম্পন্ন!</span>
                        ) : (
                            <span>অবশিষ্ট: <strong className="text-foreground">{toBengaliNumber(drills.length - currentDrillIndex)}</strong> টি</span>
                        )}
                    </div>
                </div>
                <Progress value={progressPercent} className="h-1.5 bg-muted" />
            </div>

            {/* Prompt Cards */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap pt-2">
                {promptsWithSpacers.map((item, index) => {
                     if ('isSpacer' in item) {
                        return <div key={`spacer-${index}`} className="w-full h-1" />
                    }
                    const originalIndex = drills.indexOf(item);
                    const isCurrent = currentDrillIndex === originalIndex;
                    const isCompleted = originalIndex < currentDrillIndex;
                    return renderDrillPrompt(item, isCurrent, isCompleted, `${item.prompt}-${originalIndex}`);
                })}
            </div>
        </div>
    );
};
