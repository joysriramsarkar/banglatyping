import * as React from "react";
import { CheckCircle } from "lucide-react";
import { cn, toBengaliNumber } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import type { Drill } from "@/lib/types";

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
                        "flex items-center justify-center h-14 sm:h-16 px-4 min-w-[3.75rem] sm:min-w-[4.25rem] rounded-xl border-2 transition-all select-none",
                        boxClass,
                        !isCurrent && !isCompleted && "border-dashed opacity-80"
                    )}
                >
                    {isCompleted ? (
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold text-xs">
                            <span className="font-mono text-base leading-none">␣</span>
                            <CheckCircle className="h-4 w-4 shrink-0" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
                            <span className="font-mono text-base sm:text-lg leading-none">␣</span>
                            <span className="text-muted-foreground font-semibold">স্পেস</span>
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
                    "flex items-center justify-center h-14 sm:h-16 rounded-xl border-2 font-hind font-bold transition-all select-none shadow-2xs",
                    isMultiChar ? "px-5 sm:px-6 min-w-[5.5rem] text-2xl sm:text-3xl whitespace-nowrap" : "px-3 min-w-[3.75rem] sm:min-w-[4.25rem] text-3xl sm:text-4xl",
                    boxClass
                )}
            >
                {isCompleted ? (
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <span>{drillData.prompt}</span>
                        <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
                    </div>
                ) : isCurrent && drillData.steps && drillData.steps.length > 1 ? (
                    <span className="flex items-center">
                        {drillData.steps.map((step, sIdx) => {
                            const isStepDone = sIdx < currentStepIndex;
                            const isStepCurrent = sIdx === currentStepIndex;
                            return (
                                <span
                                    key={sIdx}
                                    className={cn(
                                        "transition-all",
                                        isStepDone && "text-green-600 dark:text-green-400",
                                        isStepCurrent && "text-primary underline decoration-primary decoration-4 underline-offset-4 font-extrabold bg-primary/10 rounded px-0.5",
                                        !isStepDone && !isStepCurrent && "opacity-65"
                                    )}
                                >
                                    {step.display || step.key}
                                </span>
                            );
                        })}
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
