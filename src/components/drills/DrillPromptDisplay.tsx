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
        let boxClass = "bg-secondary";
        if (isCurrent && status === 'incorrect') boxClass = "bg-red-100 border-red-500";

        if(drillData.prompt === ' '){
            return (
                <div key={key} className={cn("flex items-center justify-center h-16 w-24 rounded-md border-2", boxClass, isCurrent && "ring-2 ring-primary" )}>
                     {isCompleted ? <CheckCircle className="h-6 w-6 text-muted-foreground" /> : <span className="text-muted-foreground italic">স্পেস</span>}
                </div>
            )
        }

        return (
            <div key={key} className={cn("flex items-center justify-center h-16 w-16 rounded-md border text-3xl font-hind", boxClass, isCurrent && "ring-2 ring-primary")}>
               {isCompleted ? <CheckCircle className="h-6 w-6 text-muted-foreground" /> : drillData.prompt}
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
        <div className="flex items-center justify-center gap-2 bg-background p-4 rounded-lg min-h-[80px] flex-wrap">
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
