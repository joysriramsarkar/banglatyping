

"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/use-timer";
import { Zap, Target, Timer, XCircle, Pause, Play, Home, CheckCircle, ArrowRight, BrainCircuit, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";
import TestResults from "./test-results";
import { lessons, practiceParagraphs, generateDrills as generateDrillsFromLib } from "@/lib/lessons";
import { Input } from "./ui/input";
import { useRouter } from 'next/navigation';
import type { Drill, Lesson, SingleDrill, ErredCharacter } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';


interface TypingPracticeProps {
  textToType: string;
  timeLimit?: number; // in minutes
  lessonId?: string;
  onRestart?: () => void;
}

const toBengaliNumber = (num: number | string) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

const StatDisplay = ({ icon: Icon, value, label }: { icon: React.ElementType, value: string | number, label: string }) => (
  <div className="flex items-center gap-2 text-lg">
    <Icon className="h-5 w-5 text-primary" />
    <span className="font-semibold">{toBengaliNumber(value)}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);

const DrillProgress = ({ wpmHistory, timeLeft }: { wpmHistory: { time: number, wpm: number }[], timeLeft: number }) => (
    <Card className="h-full">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart2 className="h-5 w-5" />
                আপনার প্রগতি
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="text-center">
                <p className="text-sm text-muted-foreground">সময় বাকি</p>
                <p className="text-4xl font-bold font-mono">{new Date(timeLeft * 1000).toISOString().substr(14, 5)}</p>
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <BarChart data={wpmHistory} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="time" unit="s" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 60]} allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                        contentStyle={{
                            background: "hsl(var(--background))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "var(--radius)",
                        }}
                        labelFormatter={(label) => `${label} সেকেন্ডে`}
                    />
                    <Bar dataKey="wpm" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="গতি (WPM)">
                         <LabelList dataKey="wpm" position="top" fontSize={12} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </CardContent>
    </Card>
);

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
    const { time, isActive, isPaused, start, pause, resume, reset: resetTimer, setTime } = useTimer();
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
            // We need to read the latest state from inside the interval
            setTime(currentTime => {
                setTotalCharsTyped(currentTotalChars => {
                    const currentWpm = currentTime > 0 ? Math.round(((currentTotalChars / 5) / (currentTime / 60))) : 0;
                    setWpmHistory(prev => [...prev, { time: currentTime, wpm: currentWpm }]);
                    return currentTotalChars;
                });
                return currentTime;
            });
        }, 30000);
    }, [start, setTime]);

    useEffect(() => {
        startDrill();
        return () => {
            if(wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        }
    }, [startDrill]);


    useEffect(() => {
        if (!isActive || isFinished) return;

        const currentWpm = time > 0 ? Math.round(((totalCharsTyped / 5) / (time / 60))) : 0;
        const correctChars = totalCharsTyped - totalErrors;
        const currentAccuracy = totalCharsTyped > 0 ? (correctChars / totalCharsTyped) * 100 : 100;

        if (time >= 240 && currentWpm >= 25 && currentAccuracy >= accuracyGoal) {
            finishDrill();
        }

        if (time >= maxTime) {
            finishDrill();
        }
    }, [time, isActive, isFinished, totalCharsTyped, totalErrors, accuracyGoal, finishDrill]);

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
            start();
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
    }, [isSessionOver, isFinished, drills, drillState, currentDrill, currentDrillStep, erredCharacters, isActive, isPaused, pause, resume, start, resetInactivityTimer]);


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
        startDrill();
    }, [initialDrills, resetTimer, startDrill]);

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
                    <SimplifiedKeyboard highlightKey={currentDrillStep?.key} needsShift={!!currentDrillStep?.shift} />
                    
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

type KeyLayoutData = {
    key: string;
    bn?: string;
    bnShift?: string;
    bnExtra?: string;
    bnShiftExtra?: string;
    width?: string;
    align?: 'left' | 'right';
    special?: 'shift';
};

const simplifiedKeyboardLayout: Record<string, KeyLayoutData[]> = {
    top: [
        {key: 'q', bn: 'ক্ষ', bnShift: 'ঁ'},
        {key: 'w', bn: 'ঙ', bnShift: 'ঃ'},
        {key: 'e', bn: 'ে', bnShift: 'ৈ', bnExtra: 'এ', bnShiftExtra: 'ঐ'},
        {key: 'r', bn: 'র', bnShift: 'ড়'},
        {key: 't', bn: 'ট', bnShift: 'ঠ'},
        {key: 'y', bn: 'য', bnShift: 'য়'},
        {key: 'u', bn: 'ু', bnShift: 'ূ', bnExtra: 'উ', bnShiftExtra: 'ঊ'},
        {key: 'i', bn: 'ি', bnShift: 'ী', bnExtra: 'ই', bnShiftExtra: 'ঈ'},
        {key: 'o', bn: 'ো', bnShift: 'ৌ', bnExtra: 'ও', bnShiftExtra: 'ঔ'},
        {key: 'p', bn: 'প', bnShift: 'ঢ়'},
        {key: '[', bn: '[', bnShift: '{'},
        {key: ']', bn: ']', bnShift: '}'},
        {key: '\\', bn: 'ৃ', bnShift: 'ঞ', bnExtra: 'ঋ'},
    ],
    home: [
        {key: 'a', bn: 'া', bnShift: 'অ', bnExtra: 'আ'},
        {key: 's', bn: 'স', bnShift: 'শ'},
        {key: 'd', bn: 'ড', bnShift: 'ঢ'},
        {key: 'f', bn: 'ফ', bnShift: 'ৎ'},
        {key: 'g', bn: 'গ', bnShift: 'ঘ'},
        {key: 'h', bn: '্', bnShift: 'হ'},
        {key: 'j', bn: 'জ', bnShift: 'ঝ'},
        {key: 'k', bn: 'ক', bnShift: 'খ'},
        {key: 'l', bn: 'ল', bnShift: 'ষ'},
        {key: ';', bn: ';', bnShift: ':'},
        {key: "'", bn: "'", bnShift: '"'},
    ],
    bottom: [
        {key: 'ShiftLeft', bn: 'Shift', width: 'w-24', align: 'left', special: 'shift'},
        {key: 'z', bn: '্য', bnShift: 'ং'},
        {key: 'x', bn: 'ত', bnShift: 'থ'},
        {key: 'c', bn: 'চ', bnShift: 'ছ'},
        {key: 'v', bn: 'দ', bnShift: 'ধ'},
        {key: 'b', bn: 'ব', bnShift: 'ভ'},
        {key: 'n', bn: 'ন', bnShift: 'ণ'},
        {key: 'm', bn: 'ম'},
        {key: ',', bn: ',', bnShift: '<'},
        {key: '.', bn: '।', bnShift: '>'},
        {key: '/', bn: '/', bnShift: '?'},
        {key: 'ShiftRight', bn: 'Shift', width: 'flex-grow', align: 'right', special: 'shift'},
    ],
    space: [
        {key: ' ', bn: 'Space', width: 'w-96'},
    ]
};

const Key = ({ data, isHighlighted, needsShift }: { data: KeyLayoutData, isHighlighted: boolean, needsShift: boolean }) => {
    const { key, bn, bnShift, bnExtra, bnShiftExtra, width, align, special } = data;

    const isShiftKey = special === 'shift';

    const baseKeyClasses = cn(
        "relative flex flex-col items-center justify-center h-16 rounded-md bg-secondary border border-b-4 font-hind transition-colors",
        width || 'w-16',
        isShiftKey ? (needsShift && 'bg-primary/20 border-primary text-primary') : (isHighlighted && 'bg-primary/20 border-primary text-primary'),
        align === 'left' && 'mr-auto',
        align === 'right' && 'ml-auto',
    );
    
    if (special === 'shift' || key === ' ') {
        return (
            <div className={baseKeyClasses}>
                <span className="text-sm font-bold">{bn}</span>
            </div>
        )
    }

    const hasFourChars = bn && bnShift && bnExtra && bnShiftExtra;

    if (hasFourChars) {
       return (
            <div className={cn(baseKeyClasses, "grid grid-cols-2 grid-rows-2 p-1 text-center")}>
                 <span className="text-sm text-muted-foreground self-start justify-self-start">{bnShiftExtra}</span>
                 <span className="text-sm text-muted-foreground self-start justify-self-end">{bnExtra}</span>
                 <span className="text-lg font-bold self-end justify-self-start">{bnShift}</span>
                 <span className="text-lg font-bold self-end justify-self-end">{bn}</span>
            </div>
        )
    }
    
    const hasThreeChars = bn && bnShift && bnExtra;
    if (hasThreeChars) {
        return (
             <div className={cn(baseKeyClasses, "grid grid-cols-2 grid-rows-2 p-1 text-center")}>
                 <span className="text-sm text-muted-foreground col-span-2 justify-self-center self-start">{bnExtra}</span>
                 <span className="text-lg font-bold self-end justify-self-start">{bnShift}</span>
                 <span className="text-lg font-bold self-end justify-self-end">{bn}</span>
            </div>
         )
    }


    return (
        <div className={baseKeyClasses}>
            <span className={cn(
                "text-sm text-muted-foreground",
                (isHighlighted && needsShift) && "font-bold text-lg text-primary"
            )}>
                {bnShift}
            </span>
            <span className={cn(
                "text-lg font-bold",
                (isHighlighted && !needsShift) && "text-primary text-2xl"
            )}>
                {bn}
            </span>
        </div>
    );
}

const SimplifiedKeyboard = ({ highlightKey, needsShift }: { highlightKey: string | undefined, needsShift: boolean }) => (
    <div className="p-2 sm:p-4 bg-background rounded-lg shadow-inner space-y-1.5">
        {Object.values(simplifiedKeyboardLayout).map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1.5">
                {row.map(keyData => {
                    let isHighlighted = false;
                    if (highlightKey) {
                        if (highlightKey === ' ') {
                           isHighlighted = keyData.key === ' ';
                        } else if (keyData.special === 'shift') {
                           isHighlighted = false;
                        }
                        else {
                           isHighlighted = keyData.key.toLowerCase() === highlightKey.toLowerCase();
                        }
                    }
                    
                    return <Key key={keyData.key} data={keyData} isHighlighted={isHighlighted} needsShift={needsShift} />;
                })}
            </div>
        ))}
    </div>
);


export default function TypingPractice({ textToType: initialText, timeLimit, lessonId, onRestart: customOnRestart }: TypingPracticeProps) {
  const [textToType, setTextToType] = useState(initialText?.normalize('NFC') || '');
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [typedWords, setTypedWords] = useState<string[]>([]);
  
  const [totalErrors, setTotalErrors] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const totalTime = timeLimit ? timeLimit * 60 : 0;
  const { time, isActive, isPaused, start, pause, resume, reset } = useTimer();

  const timeLeft = totalTime > 0 ? totalTime - time : time;

  useEffect(() => {
    const newWords = textToType.split(' ').filter(w => w);
    setWords(newWords);
  }, [textToType]);


  const calculateStats = useCallback(() => {
    if (time > 0) {
      const typedCharsCount = typedWords.join(' ').length;
      const grossWpm = (typedCharsCount / 5) / (time / 60);
      setWpm(Math.round(grossWpm > 0 ? grossWpm : 0));
    }
    
    const correctWords = typedWords.filter((word, index) => word.normalize('NFC') === words[index]?.normalize('NFC'));
    const newAccuracy = typedWords.length > 0 ? (correctWords.length / typedWords.length) * 100 : 100;
    setAccuracy(Math.round(newAccuracy > 0 ? newAccuracy : 0));

  }, [time, typedWords, words]);
  
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
        if(isActive && !isPaused) {
            pause();
        }
    }, 4000);
  }, [isActive, isPaused, pause]);

  const resetTest = useCallback((isNewTest = true) => {
    if (customOnRestart) {
        customOnRestart();
        return;
    }
    reset();
    setCurrentInput("");
    setWpm(0);
    setAccuracy(100);
    setTotalErrors(0);
    setIsFinished(false);
    if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
    }
    if (isNewTest && timeLimit) {
        const randomParagraph = practiceParagraphs[Math.floor(Math.random() * practiceParagraphs.length)];
        setTextToType(randomParagraph.normalize('NFC'));
    } else {
        setTextToType(initialText.normalize('NFC'));
    }
    setCurrentWordIndex(0);
    setTypedWords([]);
    inputRef.current?.focus();
  }, [reset, initialText, timeLimit, customOnRestart]);
  
  const finishSession = useCallback(() => {
    if(isFinished) return;
    setIsFinished(true);
    pause();
    calculateStats();
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  }, [isFinished, pause, calculateStats]);


  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.normalize('NFC');

    if (isFinished) return;
    if (!isActive && !isPaused) start();

    if (isPaused && isActive) {
        resume();
    }
    
    resetInactivityTimer();
    
    if (currentWordIndex === words.length - 1 && value.normalize('NFC') === words[currentWordIndex].normalize('NFC')) {
      const newTypedWords = [...typedWords, value.trim()];
      setTypedWords(newTypedWords);
      setCurrentInput(value);
      setTimeout(() => finishSession(), 50);
      return;
    }


    if (value.endsWith(' ')) {
        if(currentInput.trim() === '') {
            setCurrentInput('');
            return;
        };

        const typedWord = currentInput.trim().normalize('NFC');
        const newTypedWords = [...typedWords, typedWord];
        setTypedWords(newTypedWords);

        if(typedWord !== words[currentWordIndex].normalize('NFC')) {
            setTotalErrors(prev => prev + 1);
        }

        setCurrentWordIndex(prev => prev + 1);
        setCurrentInput("");
    } else {
        setCurrentInput(value);
    }
  };
  
  useEffect(() => {
    inputRef.current?.focus();
    return () => {
        if(inactivityTimerRef.current) {
            clearTimeout(inactivityTimerRef.current)
        }
    }
  }, []);

  useEffect(() => {
    const isTestFinished = currentWordIndex === words.length && words.length > 0 && !timeLimit;
    if (isActive && !isPaused) {
      calculateStats();
      
      const isTimeUp = timeLimit && time >= timeLimit * 60;
      
      if (isTestFinished || isTimeUp) {
        finishSession();
      }
    } else if (isTestFinished) {
        finishSession();
    }
  }, [time, isActive, isPaused, timeLimit, calculateStats, finishSession, currentWordIndex, words]);


  useEffect(() => {
      if(isPaused && inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
      }
  }, [isPaused])


  const getWordClass = (wordIdx: number) => {
    if (wordIdx > currentWordIndex) return "text-muted-foreground";
    if (wordIdx < currentWordIndex) {
        return typedWords[wordIdx]?.normalize('NFC') === words[wordIdx]?.normalize('NFC') ? "text-green-500" : "text-red-500 line-through";
    }
    return "text-primary";
  }

  const currentWord = words[currentWordIndex]?.normalize('NFC') || '';
  const normalizedInput = currentInput.normalize('NFC');
  
    const getPreviewContent = () => {
        if (!currentWord && !normalizedInput) return null;

        let correctPart = '';
        let incorrectPart = '';
        let remainingPart = '';
        
        let i = 0;
        while (i < normalizedInput.length && i < currentWord.length) {
            if (normalizedInput[i] === currentWord[i]) {
                i++;
            } else {
                break;
            }
        }
        
        correctPart = currentWord.substring(0, i);
        
        if (i < normalizedInput.length) { // Mistake found
          incorrectPart = currentWord.substring(i, normalizedInput.length);
          remainingPart = currentWord.substring(normalizedInput.length);
        } else {
          remainingPart = currentWord.substring(i);
        }


        return (
            <>
            <span className="text-green-500">{correctPart}</span>
            <span className="bg-red-500/20 text-red-500 underline">{incorrectPart}</span>
            <span className="text-muted-foreground opacity-50">{remainingPart}</span>
            </>
        );
    };


  const isError = normalizedInput.length > 0 && !currentWord.startsWith(normalizedInput);

  if(isFinished) {
    return <TestResults stats={{ wpm, accuracy: accuracy, errors: totalErrors, timeElapsed: time }} onRestart={() => resetTest(!timeLimit)} lessonId={lessonId} />;
  }

  return (
    <div className="space-y-6 flex flex-col items-center w-full max-w-4xl mx-auto">
      <Card className="w-full">
        <CardContent className="p-4 flex flex-wrap items-center justify-around gap-4">
          <StatDisplay icon={Zap} value={wpm} label="WPM" />
          <StatDisplay icon={Target} value={`${accuracy}%`} label="Accuracy" />
          <StatDisplay icon={Timer} value={timeLimit ? new Date((totalTime - time) * 1000).toISOString().substr(14, 5) : new Date(time * 1000).toISOString().substr(14, 5)} label={timeLimit ? "বাকি" : "সময়"} />
          <StatDisplay icon={XCircle} value={totalErrors} label="ভুল শব্দ" />
        </CardContent>
      </Card>

       <Card className="w-full p-6 text-2xl tracking-wider font-hind leading-relaxed relative select-none">
        <p>
          {words.map((word, index) => (
            <React.Fragment key={index}>
              <span
                className={cn(
                  'transition-colors font-hind',
                  getWordClass(index),
                  index === currentWordIndex && 'bg-yellow-100 dark:bg-yellow-800/50 rounded'
                )}
              >
                {word.normalize('NFC')}
              </span>
              <span> </span>
            </React.Fragment>
          ))}
        </p>
      </Card>

       <div className="w-full h-24 flex flex-col items-center justify-center">
        <div className={cn(
          "text-2xl font-hind p-2 flex items-center justify-center min-h-[3rem] w-full",
        )}>
          {getPreviewContent()}
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleUserInputChange}
          className={cn(
            "w-full text-center text-2xl font-hind p-6 border-t-0 rounded-t-none",
             isError ? "border-red-500 focus-visible:ring-red-500" : "border-green-500 focus-visible:ring-green-500"
          )}
          disabled={isFinished}
          onPaste={(e) => e.preventDefault()}
          lang="bn"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
        />
      </div>
      
      <div className="flex items-center space-x-4">
        <Button onClick={() => router.push('/dashboard/lessons')} variant="outline" size="icon" title="পাঠক্রমে ফিরে যান">
          <Home className="h-5 w-5" />
        </Button>
        <Button onClick={isPaused ? resume : pause} variant="outline" size="icon" disabled={!isActive} title={isPaused ? "চালিয়ে যান" : "থামুন"}>
          {isPaused ? <Play className="h-5 w-w" /> : <Pause className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}

    




