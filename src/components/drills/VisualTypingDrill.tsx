
"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/use-timer";
import { cn } from "@/lib/utils";
import TestResults from "@/components/test-results";
import { generateDrills as generateDrillsFromLib } from "@/lib/lessons";
import { useRouter } from 'next/navigation';
import type { Drill, ErredCharacter } from "@/lib/types";
import { SimplifiedKeyboard } from "@/components/common/VirtualKeyboard";
import { useAuth } from '@/hooks/use-auth';
import { DrillProgress } from "./DrillProgress";
import { DrillPromptDisplay } from "./DrillPromptDisplay";

export const VisualTypingDrill = ({ drills: initialDrills, lessonId, accuracyGoal = 95 }: { drills: Drill[], lessonId?: string, accuracyGoal?: number }) => {
    const router = useRouter();
    const { user } = useAuth();
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


     const handleKeyPress = useCallback((inputChar: string) => {
        if (isFinished) return;

        if (!isActive) {
            startDrill();
        } else if (isPaused) {
            resume();
        }

        resetInactivityTimer();

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

        // Space drill
        if (currentDrillStep.key === ' ') {
            const isCorrect = inputChar === ' ';
            if (isCorrect) {
                setTotalCharsTyped(prev => prev + 1);
                setDrillState(prev => {
                    const nextDrillIndex = (prev.currentDrillIndex + 1) % drills.length;
                    return { ...prev, currentDrillIndex: nextDrillIndex, currentStepIndex: 0, status: 'pending' };
                });
            } else {
                handleIncorrect();
            }
            return;
        }

        // হসন্ত (্) is a dead key in BanglaWord — it combines invisibly with the next character.
        // When current step is ্, we skip it and check the NEXT step's character instead.
        // If the next character matches, we accept both ্ and the next step together.
        const HASANTA = '\u09CD';
        if (currentDrillStep.display === HASANTA) {
            const nextStep = currentDrill.steps[currentStepIndex + 1];
            if (nextStep && inputChar === nextStep.display) {
                // Accept ্ + next char together
                setTotalCharsTyped(prev => prev + 2);
                setDrillState(prev => {
                    const newStepIndex = prev.currentStepIndex + 2;
                    const isLastStep = newStepIndex >= drills[prev.currentDrillIndex].steps.length;
                    if (isLastStep) {
                        const nextDrillIndex = (prev.currentDrillIndex + 1) % drills.length;
                        return { ...prev, currentDrillIndex: nextDrillIndex, currentStepIndex: 0, status: 'pending' };
                    }
                    return { ...prev, currentStepIndex: newStepIndex, status: 'pending' };
                });
            } else if (!nextStep && inputChar === ' ') {
                // ্ is the last step — space makes it visible, accept it
                setTotalCharsTyped(prev => prev + 1);
                setDrillState(prev => {
                    const nextDrillIndex = (prev.currentDrillIndex + 1) % drills.length;
                    return { ...prev, currentDrillIndex: nextDrillIndex, currentStepIndex: 0, status: 'pending' };
                });
            } else {
                handleIncorrect();
            }
            return;
        }

        // Compare IME output directly with expected Bengali character
        const expectedChar = currentDrillStep.display;
        const isCorrect = inputChar === expectedChar;

        if (isCorrect) {
            setTotalCharsTyped(prev => prev + 1);
            setDrillState(prev => {
                const isLastStep = prev.currentStepIndex >= (drills[prev.currentDrillIndex].steps.length - 1);
                if (isLastStep) {
                    const nextDrillIndex = (prev.currentDrillIndex + 1) % drills.length;
                    return { ...prev, currentDrillIndex: nextDrillIndex, currentStepIndex: 0, status: 'pending' };
                }
                return { ...prev, currentStepIndex: prev.currentStepIndex + 1, status: 'pending' };
            });
        } else {
            handleIncorrect();
        }
    }, [isSessionOver, isFinished, drills, drillState, currentDrill, currentDrillStep, erredCharacters, isActive, isPaused, pause, resume, startDrill, resetInactivityTimer]);

    const hiddenInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        hiddenInputRef.current?.focus();
    }, [isFinished]);

    const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        const skip = ['Shift','Control','Alt','Meta','CapsLock','Tab','Escape','Dead',
                      'ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',
                      'Backspace','Delete','Home','End','PageUp','PageDown','F1','F2',
                      'F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'];
        if (skip.includes(e.key)) return;

        // Let the OS IME handle Space if the user is in the middle of a composition (like typing Hasanta)
        if (e.key === ' ' && e.isComposing) {
            return;
        }

        e.preventDefault();
        handleKeyPress(e.key);
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

    return (
        <div className="p-4 md:p-8 rounded-lg bg-secondary/30 border max-w-full mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-2/3 space-y-4">
                    {/* Hidden input for IME Bengali input capture */}
                    <input
                        ref={hiddenInputRef}
                        type="text"
                        className="absolute w-0 h-0 opacity-0 pointer-events-none"
                        onKeyDown={onKeyDown}
                        onBlur={() => hiddenInputRef.current?.focus()}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                    />
                    {/* Prompt Display */}
                    <DrillPromptDisplay drills={drills} currentDrillIndex={currentDrillIndex} status={status} />

                    {/* Virtual Keyboard */}
                    <SimplifiedKeyboard
                        highlightKeyCode={currentDrillStep?.keyCode}
                        needsShift={!!currentDrillStep?.shift}
                    />

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
