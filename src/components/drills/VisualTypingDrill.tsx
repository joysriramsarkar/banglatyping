
"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/use-timer";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import TestResults from "@/components/test-results";
import { generateDrills as generateDrillsFromLib } from "@/lib/lessons";
import { useRouter } from 'next/navigation';
import type { Drill, ErredCharacter } from "@/lib/types";
import { SimplifiedKeyboard } from "@/components/common/VirtualKeyboard";
import { DrillProgress } from "./DrillProgress";

export const VisualTypingDrill = ({ drills: initialDrills, lessonId, accuracyGoal = 95 }: { drills: Drill[], lessonId?: string, accuracyGoal?: number }) => {
    const router = useRouter();
    const [drills, setDrills] = useState<Drill[]>(initialDrills);
    const [drillState, setDrillState] = useState({
        currentDrillIndex: 0,
        currentStepIndex: 0,
        status: 'pending' as 'pending' | 'correct' | 'incorrect',
        erredCharacters: new Map<string, number>(),
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

    const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const wpmIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

    const { currentDrillIndex, currentStepIndex, status, erredCharacters } = drillState;

    const isSessionOver = currentDrillIndex >= drills.length;
    const currentDrill = !isSessionOver ? drills[currentDrillIndex] : null;
    const currentDrillStep = currentDrill?.steps[currentStepIndex];

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


     const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (isFinished) return;

        if (!isActive) {
            startDrill();
        } else if (isPaused) {
            resume();
        }

        resetInactivityTimer();

        const modifierKeys = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape', 'Dead'];
        if (modifierKeys.includes(event.key)) return;

        if (event.key === 'Enter') {
           if(isSessionOver) {
                // This logic is for test results page, can be handled there
           }
           return;
        }

        event.preventDefault();

        if (statusTimeoutRef.current) {
            clearTimeout(statusTimeoutRef.current);
            statusTimeoutRef.current = null;
        }

        const handleIncorrect = () => {
            setTotalErrors(prev => prev + 1);
            if(currentDrill) {
                const newErredChars = new Map(erredCharacters);
                const char = currentDrill.prompt;
                newErredChars.set(char, (newErredChars.get(char) || 0) + 1);
                setDrillState(prev => ({ ...prev, status: 'incorrect', erredCharacters: newErredChars }));
            } else {
                 setDrillState(prev => ({ ...prev, status: 'incorrect' }));
            }

            statusTimeoutRef.current = setTimeout(() => {
                setDrillState(prev => ({ ...prev, status: 'pending' }));
            }, 500);
        };

        if (!currentDrill || !currentDrillStep) {
            handleIncorrect();
            return;
        }

        const { key: expectedKey, shift: expectedShift } = currentDrillStep;

        let isCorrect = false;

        if (expectedKey === ' ') {
            if (event.code === 'Space') {
                isCorrect = true;
            }
        } else {
             let expectedCode = '';
             if (expectedKey.match(/^[a-z]$/)) {
                expectedCode = `Key${expectedKey.toUpperCase()}`;
             } else if (expectedKey.match(/^[0-9]$/)) {
                 expectedCode = `Digit${expectedKey}`;
             } else {
                 switch(expectedKey) {
                    case '[': expectedCode = 'BracketLeft'; break;
                    case ']': expectedCode = 'BracketRight'; break;
                    case '\\': expectedCode = 'Backslash'; break;
                    case ';': expectedCode = 'Semicolon'; break;
                    case "'": expectedCode = 'Quote'; break;
                    case ',': expectedCode = 'Comma'; break;
                    case '.': expectedCode = 'Period'; break;
                    case '/': expectedCode = 'Slash'; break;
                    case '-': expectedCode = 'Minus'; break;
                    default: expectedCode = expectedKey;
                }
            }
             isCorrect = event.code === expectedCode && event.shiftKey === expectedShift;
        }

        if (isCorrect) {
            setTotalCharsTyped(prev => prev + 1);
            setDrillState(prev => {
                const isLastStepInDrill = prev.currentStepIndex >= (drills[prev.currentDrillIndex].steps.length - 1);

                if (isLastStepInDrill) {
                    let nextDrillIndex = prev.currentDrillIndex + 1;
                    if (nextDrillIndex >= drills.length) {
                       nextDrillIndex = 0; // Loop back to the beginning
                    }
                    return {
                        ...prev,
                        currentDrillIndex: nextDrillIndex,
                        currentStepIndex: 0,
                        status: 'pending',
                    };
                } else {
                    return {
                        ...prev,
                        currentStepIndex: prev.currentStepIndex + 1,
                        status: 'pending',
                    };
                }
            });
        } else {
            handleIncorrect();
        }
    }, [isSessionOver, isFinished, drills, drillState, currentDrill, currentDrillStep, erredCharacters, isActive, isPaused, pause, resume, startDrill, resetInactivityTimer]);


    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            if (statusTimeoutRef.current) clearTimeout(statusTimeoutRef.current);
        };
    }, [handleKeyPress]);


    const resetDrill = useCallback(() => {
        resetTimer();
        setDrills(initialDrills);
        setDrillState({
            currentDrillIndex: 0,
            currentStepIndex: 0,
            status: 'pending',
            erredCharacters: new Map()
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
        <div className="p-4 md:p-8 rounded-lg bg-secondary/30 border max-w-full mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-2/3 space-y-4">
                    {/* Prompt Display */}
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

                    {/* Virtual Keyboard */}
                    <SimplifiedKeyboard highlightKeyCode={currentDrillStep?.keyCode} needsShift={!!currentDrillStep?.shift} />

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
