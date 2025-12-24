
"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/use-timer";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import TestResults from "@/components/test-results";
import { generateDrills as generateDrillsFromLib } from "@/lib/lessons";
import { Input } from "@/components/ui/input";
import { useRouter } from 'next/navigation';
import type { Drill, ErredCharacter } from "@/lib/types";
import { SimplifiedKeyboard } from "@/components/common/VirtualKeyboard";
import { DrillProgress } from "./DrillProgress";

export const WordDrill = ({ drills: initialDrills, lessonId, accuracyGoal = 95 }: { drills: Drill[], lessonId?: string, accuracyGoal?: number }) => {
    const router = useRouter();
    const [drills, setDrills] = useState<Drill[]>(initialDrills);
    const [drillState, setDrillState] = useState({
        currentDrillIndex: 0,
        currentCharIndex: 0,
        userInput: '',
        erredCharacters: new Map<string, number>(),
        isError: false,
    });

    const [isFinished, setIsFinished] = useState(false);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [totalCharsTyped, setTotalCharsTyped] = useState(0);
    const [totalErrors, setTotalErrors] = useState(0);
    const [wpmHistory, setWpmHistory] = useState<{ time: number, wpm: number }[]>([]);

    const maxTime = 360; // 6 minutes
    const { time, isActive, isPaused, start, pause, resume, reset: resetTimer } = useTimer();
    const timeLeft = maxTime - time;

    const wpmIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

    const { currentDrillIndex, currentCharIndex, userInput, erredCharacters, isError } = drillState;
    const currentDrill = drills[currentDrillIndex];
    const currentWord = currentDrill.prompt;

    const finishDrill = useCallback(() => {
        if (isFinished) return;
        pause();
        if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        setIsFinished(true);

        const correctChars = totalCharsTyped - totalErrors;
        const finalAccuracy = totalCharsTyped > 0 ? (correctChars / totalCharsTyped) * 100 : 100;
        setAccuracy(Math.round(finalAccuracy));

        const finalWpm = time > 0 ? ((totalCharsTyped / 5) / (time / 60)) : 0;
        setWpm(Math.round(finalWpm));
    }, [isFinished, pause, time, totalCharsTyped, totalErrors]);

    const startDrill = useCallback(() => {
        start();
        wpmIntervalRef.current = setInterval(() => {
            setWpmHistory(prevHistory => {
                const latestTime = prevHistory.length > 0 ? prevHistory[prevHistory.length - 1].time : 0;
                const newTime = latestTime + 30;

                const currentWpm = newTime > 0 ? Math.round(((totalCharsTyped / 5) / (newTime / 60))) : 0;
                return [...prevHistory, { time: newTime, wpm: currentWpm }];
            });
        }, 30000);
    }, [start, totalCharsTyped]);


    useEffect(() => {
        return () => {
            if(wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        }
    }, []);

    useEffect(() => {
        if (!isActive || isPaused || isFinished) return;

        const currentWpm = time > 0 ? Math.round(((totalCharsTyped / 5) / (time / 60))) : 0;
        const correctChars = totalCharsTyped - totalErrors;
        const currentAccuracy = totalCharsTyped > 0 ? (correctChars / totalCharsTyped) * 100 : 100;

        if (time >= 240 && currentWpm >= 25 && currentAccuracy >= accuracyGoal) {
            finishDrill();
        }

        if (time >= maxTime) {
            finishDrill();
        }
    }, [time, isActive, isPaused, isFinished, totalCharsTyped, totalErrors, accuracyGoal, finishDrill]);

    const resetInactivityTimer = useCallback(() => {
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(() => {
            if (isActive && !isPaused) {
                pause();
            }
        }, 4000);
    }, [isActive, isPaused, pause]);

    const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
        if (isFinished) return;

        if (!isActive) startDrill();
        else if (isPaused) resume();

        resetInactivityTimer();

        const typedChar = event.key;

        if (typedChar === ' ') {
            event.preventDefault();
             if(userInput.trim() === currentWord) {
                setTotalCharsTyped(prev => prev + 1); // for the space
                let nextDrillIndex = currentDrillIndex + 1;
                if(nextDrillIndex >= drills.length) nextDrillIndex = 0; // Loop

                setDrillState(prev => ({
                    ...prev,
                    currentDrillIndex: nextDrillIndex,
                    currentCharIndex: 0,
                    userInput: '',
                    isError: false,
                }));
             } else {
                 setTotalErrors(prev => prev + 1);
                 setDrillState(prev => ({ ...prev, isError: true }));
             }
        } else if (typedChar === 'Backspace') {
             setDrillState(prev => ({ ...prev, userInput: prev.userInput.slice(0, -1), currentCharIndex: Math.max(0, prev.currentCharIndex - 1), isError: false}));
        } else if (typedChar.length === 1) { // handle normal characters
             const newTotalChars = totalCharsTyped + 1;
             setTotalCharsTyped(newTotalChars);

             const newUserInput = userInput + typedChar;
             const expectedSubstring = currentWord.substring(0, newUserInput.length);

             if(newUserInput === expectedSubstring) {
                 setDrillState(prev => ({...prev, currentCharIndex: prev.currentCharIndex + 1, userInput: newUserInput, isError: false}));
             } else {
                setTotalErrors(prev => prev + 1);
                const expectedChar = currentWord[currentCharIndex];
                const newErredChars = new Map(erredCharacters);
                newErredChars.set(expectedChar, (newErredChars.get(expectedChar) || 0) + 1);
                setDrillState(prev => ({ ...prev, userInput: newUserInput, erredCharacters: newErredChars, isError: true }));
             }
        }
    }, [isFinished, isActive, isPaused, startDrill, resume, resetInactivityTimer, currentWord, currentCharIndex, userInput, currentDrillIndex, drills.length, erredCharacters, totalCharsTyped]);

    const resetDrill = useCallback(() => {
        resetTimer();
        setDrills(initialDrills);
        setDrillState({
            currentDrillIndex: 0,
            currentCharIndex: 0,
            userInput: '',
            erredCharacters: new Map(),
            isError: false,
        });
        setIsFinished(false);
        setWpm(0);
        setAccuracy(100);
        setTotalCharsTyped(0);
        setTotalErrors(0);
        setWpmHistory([]);
    }, [initialDrills, resetTimer]);

    const startCustomDrill = () => {
        const erredChars = Array.from(erredCharacters.keys());
        if (erredChars.length > 0) {
            const customDrills = generateDrillsFromLib(erredChars, 150);
            setDrills(customDrills);
            resetDrill();
        }
    };

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
                    <SimplifiedKeyboard highlightKey={currentDrill?.steps[currentCharIndex]?.key} needsShift={!!currentDrill?.steps[currentCharIndex]?.shift} />
                 </div>

                 <div className="w-full md:w-1/3 space-y-4">
                    <DrillProgress wpmHistory={wpmHistory} timeLeft={timeLeft} />
                     <div className="flex justify-end gap-2 mt-4">
                        <Button onClick={() => router.push('/dashboard/lessons')} variant="destructive">অনুশীলন বাতিল করুন</Button>
                    </div>
                </div>
             </div>
        </div>
    )
}
