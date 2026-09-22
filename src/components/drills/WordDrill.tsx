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

import { normalizeBengaliString, bengaliSegmenter, buildGraphemeRenderModel, isComplexConjunct } from "@/lib/bengali-grapheme";
import { GraphemeDisplay, ConjunctSimulationBox } from "@/components/lessons/GraphemeDisplay";
import { cn } from "@/lib/utils";

const WordDisplay = ({ word, isCurrent, userInput, isError }: { word: string; isCurrent: boolean; userInput: string; isError: boolean }) => {
    if (word === ' ') {
        return (
            <span className={cn(
                "inline-flex items-center justify-center px-3 py-1 rounded-xl font-headline font-bold transition-all mr-3",
                isCurrent
                    ? "text-3xl sm:text-4xl text-primary bg-primary/10 border-2 border-primary/50 ring-2 ring-primary/20"
                    : "text-xl sm:text-2xl text-muted-foreground/50"
            )}>
                ␣ স্পেস
            </span>
        );
    }

    if (isCurrent) {
        const normWord = normalizeBengaliString(word);
        const normInput = normalizeBengaliString(userInput);
        const targetClusters = bengaliSegmenter.segmentString(normWord);
        const inputClusters = bengaliSegmenter.segmentString(normInput);

        return (
            <span className="text-4xl sm:text-5xl md:text-6xl font-black font-headline mr-5 sm:mr-7 relative inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-primary/10 border-2 border-primary/50 shadow-md ring-2 ring-primary/20 whitespace-pre">
                {targetClusters.map((cluster, cIdx) => {
                    const normCluster = normalizeBengaliString(cluster);

                    // Inter-word space character: preserve full proportional space width in flex container
                    if (cluster === ' ' || cluster === '\u00A0' || !cluster.trim()) {
                        const isTyped = cIdx < inputClusters.length && normalizeBengaliString(inputClusters[cIdx]) === normCluster;
                        return (
                            <span
                                key={`wd-${cIdx}`}
                                className={cn(
                                    "inline-block select-none shrink-0",
                                    isTyped ? (isError ? "text-red-500 font-black" : "text-green-600 dark:text-green-400 font-black") : "text-muted-foreground/35"
                                )}
                                style={{ width: '0.35em' }}
                                aria-hidden="true"
                            >
                                {'\u00A0'}
                            </span>
                        );
                    }

                    if (cIdx < inputClusters.length) {
                        const typedCluster = normalizeBengaliString(inputClusters[cIdx]);
                        if (typedCluster === normCluster) {
                            return (
                                <span key={`wd-${cIdx}`} className={isError ? "text-red-500 font-black" : "text-green-600 dark:text-green-400 font-black"}>
                                    {cluster}
                                </span>
                            );
                        }
                    }

                    if (cIdx === inputClusters.length - 1 && inputClusters.length > 0) {
                        const typedCluster = normalizeBengaliString(inputClusters[cIdx]);
                        if (normCluster.startsWith(typedCluster) && typedCluster !== normCluster) {
                            const renderModel = buildGraphemeRenderModel(normCluster, typedCluster);
                            return (
                                <GraphemeDisplay
                                    key={`wd-${cIdx}`}
                                    model={renderModel}
                                    isError={isError}
                                />
                            );
                        }
                    }

                    const isNextActive = cIdx === inputClusters.length;
                    if (isNextActive && isComplexConjunct(normCluster)) {
                        const renderModel = buildGraphemeRenderModel(normCluster, "");
                        return (
                            <GraphemeDisplay
                                key={`wd-${cIdx}`}
                                model={renderModel}
                                isError={isError}
                            />
                        );
                    }

                    return (
                        <span
                            key={`wd-${cIdx}`}
                            className={isNextActive ? "text-foreground font-black" : "text-muted-foreground/40"}
                        >
                            {cluster}
                        </span>
                    );
                })}
            </span>
        );
    }
    return <span className="text-2xl sm:text-3xl text-muted-foreground/60 mr-4 font-semibold">{word}</span>;
};

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
        handleInputChange,
        handleSpace,
        handleBackspace,
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
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-secondary/30 border w-full mx-auto shadow-xs">
             <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
                 <div className="flex-1 w-full min-w-0 space-y-5">
                      {/* Word Display */}
                    <div className="flex flex-col items-center justify-center gap-3 bg-background p-4 sm:p-6 rounded-xl min-h-[90px] border shadow-xs">
                       <div className="flex items-center justify-center gap-2 flex-wrap">
                       {(() => {
                           const currentPrompt = drills[currentDrillIndex]?.prompt;
                           const isSentence = currentPrompt?.trim().includes(" ") || currentPrompt?.includes("।");
                           // Exactly 2 words in view for word exercises
                           const visibleCount = isSentence ? 1 : 2;
                           return drills.slice(currentDrillIndex, currentDrillIndex + visibleCount).map((drill, index) => (
                               <WordDisplay
                                    key={`${drill.prompt}-${currentDrillIndex + index}`}
                                    word={drill.prompt}
                                    isCurrent={index === 0}
                                    userInput={userInput}
                                    isError={isError}
                               />
                           ));
                       })()}
                       </div>

                       {/* Standalone Conjunct Simulation Box (docked cleanly below word prompt) */}
                       {(() => {
                           const currentPrompt = drills[currentDrillIndex]?.prompt;
                           if (!currentPrompt || currentPrompt.trim() === '') return null;
                           const normPrompt = normalizeBengaliString(currentPrompt);
                           const normInput = normalizeBengaliString(userInput);
                           const targetClusters = bengaliSegmenter.segmentString(normPrompt);
                           const inputClusters = bengaliSegmenter.segmentString(normInput);

                           let activeIdx = inputClusters.length;
                           if (inputClusters.length > 0) {
                               const lastInput = normalizeBengaliString(inputClusters[inputClusters.length - 1]);
                               const targetClusterAtLast = normalizeBengaliString(targetClusters[inputClusters.length - 1] || "");
                               if (targetClusterAtLast.startsWith(lastInput) && lastInput !== targetClusterAtLast) {
                                   activeIdx = inputClusters.length - 1;
                               }
                           }

                           const activeCluster = targetClusters[activeIdx];
                           if (!activeCluster) return null;
                           const normCluster = normalizeBengaliString(activeCluster);
                           if (isComplexConjunct(normCluster)) {
                               const typedInCluster = activeIdx < inputClusters.length ? normalizeBengaliString(inputClusters[activeIdx]) : "";
                               const simModel = buildGraphemeRenderModel(normCluster, typedInCluster);
                               return (
                                   <div className="flex justify-center pt-1">
                                       <ConjunctSimulationBox model={simModel} />
                                   </div>
                               );
                           }
                           return null;
                       })()}

                       <Input
                        type="text"
                        className="absolute w-0 h-0 p-0 m-0 border-0 opacity-0"
                        value={userInput}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === ' ') { e.preventDefault(); handleSpace(); }
                            if (e.key === 'Backspace') handleBackspace();
                        }}
                        autoFocus
                        onBlur={(e) => e.target.focus()}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                       />
                    </div>
                    {/* Virtual Keyboard */}
                    <SimplifiedKeyboard
                        highlightKeyCode={currentDrill?.steps[currentCharIndex]?.keyCode}
                        needsShift={!!currentDrill?.steps[currentCharIndex]?.shift}
                    />
                 </div>

                 <div className="w-full lg:w-80 xl:w-88 shrink-0 space-y-4">
                    <DrillProgress
                        wpmHistory={wpmHistory}
                        timeLeft={timeLeft}
                        currentWpm={time > 0 ? Math.round((totalCharsTyped / 5) / (time / 60)) : 0}
                        currentAccuracy={totalCharsTyped > 0 ? Math.round(((totalCharsTyped - totalErrors) / totalCharsTyped) * 100) : 100}
                        currentDrillIndex={currentDrillIndex}
                        totalDrills={drills.length}
                        totalCharsTyped={totalCharsTyped}
                        totalErrors={totalErrors}
                    />
                     <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={() => router.push('/dashboard/lessons')} variant="destructive" className="w-full sm:w-auto">অনুশীলন বাতিল করুন</Button>
                    </div>
                </div>
             </div>
        </div>
    )
}
