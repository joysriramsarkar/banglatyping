
"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/use-timer";
import TestResults from "@/components/test-results";
import { generateDrills as generateDrillsFromLib } from "@/lib/lessons";
import { useRouter } from 'next/navigation';
import type { Drill, ErredCharacter } from "@/lib/types";
import { SimplifiedKeyboard } from "@/components/common/VirtualKeyboard";
import { getKeyboardLayoutConfig, findKeyInfoForChar } from "@/lib/keyboard-layouts";
import { DrillProgress } from "./DrillProgress";
import { DrillPromptDisplay } from "./DrillPromptDisplay";

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

    const totalCharsRef = useRef(totalCharsTyped);
    const timeRef = useRef(time);
    const isActiveRef = useRef(isActive);
    const isPausedRef = useRef(isPaused);
    const pauseRef = useRef(pause);

    useEffect(() => {
        totalCharsRef.current = totalCharsTyped;
        timeRef.current = time;
        isActiveRef.current = isActive;
        isPausedRef.current = isPaused;
        pauseRef.current = pause;
    }, [totalCharsTyped, time, isActive, isPaused, pause]);

    const finishDrill = useCallback(() => {
        if (isFinished) return;
        pause();
        if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        setIsFinished(true);

        const correctChars = totalCharsTyped - totalErrors;
        const finalAccuracy = totalCharsTyped > 0 ? (correctChars / totalCharsTyped) * 100 : 100;
        setAccuracy(Math.round(finalAccuracy));

        const finalWpm = time > 0 ? Math.round(((totalCharsTyped / 5) / (time / 60))) : 0;
        setWpm(finalWpm);
        if (time > 0) {
            setWpmHistory(prev => {
                if (prev.length > 0 && prev[prev.length - 1].time === time) return prev;
                return [...prev, { time, wpm: finalWpm }];
            });
        }
    }, [isFinished, pause, time, totalCharsTyped, totalErrors]);

    const startDrill = useCallback(() => {
        start();
        if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
        wpmIntervalRef.current = setInterval(() => {
            if (!isActiveRef.current || isPausedRef.current) return;
            const currentTime = timeRef.current;
            const currentChars = totalCharsRef.current;
            if (currentTime <= 0) return;
            const currentWpm = Math.round(((currentChars / 5) / (currentTime / 60)));
            setWpmHistory(prevHistory => {
                if (prevHistory.length > 0 && prevHistory[prevHistory.length - 1].time === currentTime) {
                    return prevHistory;
                }
                return [...prevHistory, { time: currentTime, wpm: currentWpm }];
            });
        }, 5000);
    }, [start]);


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
            if (isActiveRef.current && !isPausedRef.current) {
                pauseRef.current();
            }
        }, 1800);
    }, []);


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

        const HASANTA = '\u09CD';
        const normInput = (inputChar || '').normalize('NFC');
        const normStep = (currentDrillStep.display || '').normalize('NFC');

        // Shortcut for 'ক্ষ': BanglaWord permits typing 'ক্ষ' directly via 'q'
        // even when the drill decomposed it into [ক, ্, ষ]
        if (normInput === 'ক্ষ' || normInput === 'q') {
            const remainingSteps = currentDrill.steps.slice(currentStepIndex);
            let skipCount = 0;
            if (normStep === 'ক' && remainingSteps[1]?.display === '্' && remainingSteps[2]?.display === 'ষ') {
                skipCount = 3;
            } else if (normStep === '্' && remainingSteps[1]?.display === 'ষ' && currentStepIndex > 0 && currentDrill.steps[currentStepIndex - 1]?.display === 'ক') {
                skipCount = 2;
            } else if (normStep === 'ষ' && currentStepIndex >= 2 && currentDrill.steps[currentStepIndex - 1]?.display === '্' && currentDrill.steps[currentStepIndex - 2]?.display === 'ক') {
                skipCount = 1;
            } else if (normStep === 'ক্ষ') {
                skipCount = 1;
            }

            if (skipCount > 0) {
                setTotalCharsTyped(prev => prev + skipCount);
                setDrillState(prev => {
                    const newStepIndex = prev.currentStepIndex + skipCount;
                    const isLastStep = newStepIndex >= drills[prev.currentDrillIndex].steps.length;
                    if (isLastStep) {
                        const nextDrillIndex = (prev.currentDrillIndex + 1) % drills.length;
                        return { ...prev, currentDrillIndex: nextDrillIndex, currentStepIndex: 0, status: 'pending' };
                    }
                    return { ...prev, currentStepIndex: newStepIndex, status: 'pending' };
                });
                return;
            }
        }

        // হসন্ত (্) handling for BanglaWord layout.
        // BanglaWord uses ্ as a dead key that can either:
        //   A) be typed directly (if layout maps the key to ্ directly)
        //   B) be combined silently with the next consonant
        // We accept all three valid scenarios:
        if (normStep === HASANTA) {
            const nextStep = currentDrill.steps[currentStepIndex + 1];
            const normNext = nextStep ? nextStep.display.normalize('NFC') : null;
            if (normInput === HASANTA) {
                // Case A: User typed হসন্ত directly — accept and advance one step
                setTotalCharsTyped(prev => prev + 1);
                setDrillState(prev => {
                    const newStepIndex = prev.currentStepIndex + 1;
                    const isLastStep = newStepIndex >= drills[prev.currentDrillIndex].steps.length;
                    if (isLastStep) {
                        const nextDrillIndex = (prev.currentDrillIndex + 1) % drills.length;
                        return { ...prev, currentDrillIndex: nextDrillIndex, currentStepIndex: 0, status: 'pending' };
                    }
                    return { ...prev, currentStepIndex: newStepIndex, status: 'pending' };
                });
            } else if (normNext && normInput === normNext) {
                // Case B: BanglaWord silently combined ্ with next char — accept both
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
            } else if (!normNext && normInput === ' ') {
                // Case C: ্ is the last step — space makes it visible, accept it
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
        const isCorrect = normInput === normStep;

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
    }, [isFinished, drills, currentDrill, currentDrillStep, currentStepIndex, erredCharacters, isActive, isPaused, resume, startDrill, resetInactivityTimer]);

    const hiddenInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        hiddenInputRef.current?.focus();
    }, [isFinished]);

    const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        // Special handling for Hasanta (্) / Reph / Conjuncts
        const isExpectingHasanta = currentDrillStep?.display === '্' || currentDrillStep?.key === '্';
        const isHasantaKey =
            e.key === '্' ||
            (e.code === 'KeyH' && !e.shiftKey) ||
            (e.key === 'Dead' && e.code === 'KeyH');

        if (isExpectingHasanta && isHasantaKey) {
            e.preventDefault();
            handleKeyPress('্');
            return;
        }

        // Direct key 'q' for 'ক্ষ' in BanglaWord
        if (e.code === 'KeyQ' && !e.shiftKey) {
            e.preventDefault();
            handleKeyPress('ক্ষ');
            return;
        }

        const skipKeys = ['Shift','Control','Alt','Meta','CapsLock','Tab','Escape','Dead',
                          'ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter',
                          'Backspace','Delete','Home','End','PageUp','PageDown',
                          'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12'];
        if (skipKeys.includes(e.key)) return;
        e.preventDefault();

        // Handle space separately — the layout config has bn='Space' (string) for spacebar,
        // which would produce the wrong value if we went through the lookup path.
        if (e.key === ' ') {
            handleKeyPress(' ');
            return;
        }

        // Check if e.key is already a direct Bengali character (from OS IME / Avro / Bijoy / etc.)
        let bengaliChar: string;
        if (e.key && e.key.length === 1 && e.key >= '\u0980' && e.key <= '\u09FF') {
            bengaliChar = e.key;
        } else {
            // Otherwise translate from physical key (e.code + e.shiftKey) in our layout config
            const layout = getKeyboardLayoutConfig('BanglaWord');
            const allKeys = [...layout.top, ...layout.home, ...layout.bottom];
            const keyEntry = allKeys.find(k => k.keyCode === e.code);

            if (keyEntry) {
                bengaliChar = e.shiftKey ? (keyEntry.bnShift ?? keyEntry.bn) : keyEntry.bn;
            } else {
                bengaliChar = e.key;
            }
        }

        handleKeyPress(bengaliChar);
    }, [handleKeyPress, currentDrillStep]);


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
        <div className="p-4 sm:p-6 md:p-8 rounded-2xl bg-secondary/30 border w-full mx-auto shadow-xs">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
                <div className="flex-1 w-full min-w-0 space-y-5">
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
                    <DrillPromptDisplay drills={drills} currentDrillIndex={currentDrillIndex} currentStepIndex={currentStepIndex} status={status} />

                    {/* Virtual Keyboard */}
                    <SimplifiedKeyboard
                        highlightKeyCode={currentDrillStep?.keyCode}
                        needsShift={!!currentDrillStep?.shift}
                        resolvedKeyInfo={currentDrillStep?.display ? findKeyInfoForChar(currentDrillStep.display) : null}
                        showFingerGuide={true}
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
