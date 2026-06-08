"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import TestResults from "@/components/test-results";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import type { Drill, ErredCharacter } from "@/lib/types";
import { SimplifiedKeyboard } from "@/components/common/VirtualKeyboard";
import { DrillProgress } from "./DrillProgress";
import { useWordDrill } from "./use-word-drill";

const WordDisplay = ({ word, isCurrent, userInput, isError }: { word: string; isCurrent: boolean; userInput: string; isError: boolean }) => {
    if (isCurrent) {
        const correctPart = word.substring(0, userInput.length);
        const remainingPart = word.substring(userInput.length);

        return (
             <span className="text-3xl text-primary font-bold mr-4 relative">
                <span className="opacity-0">{word}</span> {/* For layout spacing */}
                <span className="absolute left-0 top-0">
                    <span className={isError ? "text-red-500" : "text-green-500"}>{userInput}</span>
                    <span className="border-b-2 border-primary">{remainingPart[0]}</span>
                    <span>{remainingPart.substring(1)}</span>
                </span>
            </span>
        )
    }
    return <span className="text-3xl text-muted-foreground mr-4">{word}</span>
}

export const WordDrill = ({ drills: initialDrills, lessonId, accuracyGoal = 95 }: { drills: Drill[], lessonId?: string, accuracyGoal?: number }) => {
    const router = useRouter();
    const {
        drills,
        currentDrillIndex,
        currentCharIndex,
        userInput,
        isError,
        isFinished,
        wpm,
        accuracy,
        totalErrors,
        time,
        wpmHistory,
        timeLeft,
        totalCharsTyped,
        erredCharacters,
        handleKeyPress,
        resetDrill,
        startCustomDrill,
        currentDrill,
    } = useWordDrill(initialDrills, accuracyGoal);

    if (isFinished) {
        const erredCharsArray: ErredCharacter[] = Array.from(erredCharacters.entries())
            .map(([char, count]) => ({ char, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return <TestResults
                    stats={{ wpm, accuracy, errors: totalErrors, timeElapsed: time, erredCharacters: erredCharsArray }}
                    onRestart={resetDrill}
                    lessonId={lessonId}
                    isDrill={true}
                    customDrill={startCustomDrill}
                    accuracyGoal={accuracyGoal}
                />;
    }

    return (
        <div className="p-4 md:p-8 rounded-lg bg-secondary/30 border max-w-full mx-auto">
             <div className="flex flex-col md:flex-row gap-8">
                 <div className="w-full md:w-2/3 space-y-4">
                      {/* Word Display */}
                    <div className="flex items-center justify-center gap-2 bg-background p-4 rounded-lg min-h-[80px] flex-wrap">
                       {drills.slice(currentDrillIndex, currentDrillIndex + 4).map((drill, index) => (
                           <WordDisplay
                                key={`${drill.prompt}-${currentDrillIndex + index}`}
                                word={drill.prompt}
                                isCurrent={index === 0}
                                userInput={userInput}
                                isError={isError}
                           />
                       ))}
                       <Input
                        type="text"
                        className="absolute w-0 h-0 p-0 m-0 border-0"
                        onKeyDown={handleKeyPress}
                        autoFocus
                        onBlur={(e) => e.target.focus()}
                       />
                    </div>
                     {/* Virtual Keyboard */}
                    <SimplifiedKeyboard highlightKeyCode={currentDrill?.steps[currentCharIndex]?.keyCode} needsShift={!!currentDrill?.steps[currentCharIndex]?.shift} />
                 </div>

                 <div className="w-full md:w-1/3 space-y-4">
                    <DrillProgress
                        wpmHistory={wpmHistory}
                        timeLeft={timeLeft}
                        currentWpm={time > 0 ? Math.round((totalCharsTyped / 5) / (time / 60)) : 0}
                        currentAccuracy={totalCharsTyped > 0 ? Math.round(((totalCharsTyped - totalErrors) / totalCharsTyped) * 100) : 100}
                    />
                     <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={() => router.push('/dashboard/lessons')} variant="destructive">অনুশীলন বাতিল করুন</Button>
                    </div>
                </div>
             </div>
        </div>
    )
}
