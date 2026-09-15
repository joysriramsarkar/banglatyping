import * as React from "react";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Drill } from "@/lib/types";

interface DrillPromptDisplayProps {
    drills: Drill[];
    currentDrillIndex: number;
    status: 'pending' | 'correct' | 'incorrect';
}

export const DrillPromptDisplay: React.FC<DrillPromptDisplayProps> = ({ drills, currentDrillIndex, status }) => {
    const getVisibleDrills = () => {
        const visible: Drill[] = [];
        const startIndex = Math.floor(currentDrillIndex / 10) * 10;
        for(let i = startIndex; i < startIndex + 10 && i < drills.length; i++) {
            visible.push(drills[i]);
        }
        return visible;
    };

    const renderDrillPrompt = (drillData: Drill, isCurrent: boolean, isCompleted: boolean, key: string | number) => {
        let boxClass = "bg-secondary/60 text-foreground";
        if (isCurrent && status === 'incorrect') boxClass = "bg-red-100 dark:bg-red-950/50 border-red-500 text-red-600";
        if (isCurrent && status === 'correct') boxClass = "bg-green-100 dark:bg-green-950/50 border-green-500 text-green-600";

        if(drillData.prompt === ' '){
            return (
                <div key={key} className={cn("flex items-center justify-center h-16 sm:h-20 w-28 sm:w-32 rounded-xl border-2 text-sm sm:text-base font-medium transition-all", boxClass, isCurrent && "ring-4 ring-primary/40 ring-offset-2 scale-105 shadow-md border-primary" )}>
                     {isCompleted ? <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" /> : <span className="text-muted-foreground italic">স্পেস</span>}
                </div>
            )
        }

        return (
            <div key={key} className={cn("flex items-center justify-center h-16 sm:h-20 w-16 sm:w-20 rounded-xl border-2 text-3xl sm:text-4xl md:text-5xl font-hind font-bold transition-all", boxClass, isCurrent && "ring-4 ring-primary/40 ring-offset-2 scale-105 shadow-md border-primary text-primary")}>
               {isCompleted ? <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" /> : drillData.prompt}
            </div>
        )
    }

    const visibleDrills = getVisibleDrills();
    const promptsWithSpacers: (Drill | {isSpacer: true})[] = [];
    visibleDrills.forEach((drill, index) => {
        promptsWithSpacers.push(drill);
        const originalIndex = drills.indexOf(drill);
        if (drill.prompt === ' ' && (originalIndex + 1) % 5 === 0 && index < visibleDrills.length - 1) {
           promptsWithSpacers.push({ isSpacer: true });
        }
    });

    return (
        <div className="flex items-center justify-center gap-2 sm:gap-3 bg-card p-4 sm:p-6 rounded-2xl min-h-[100px] flex-wrap border shadow-xs">
            {promptsWithSpacers.map((item, index) => {
                 if ('isSpacer' in item) {
                    return <div key={`spacer-${index}`} className="w-full h-2"></div>
                }
                const originalIndex = drills.indexOf(item);
                const isCurrent = currentDrillIndex === originalIndex;
                const isCompleted = originalIndex < currentDrillIndex;
                return renderDrillPrompt(item, isCurrent, isCompleted, `${item.prompt}-${originalIndex}`);
            })}
        </div>
    );
};
