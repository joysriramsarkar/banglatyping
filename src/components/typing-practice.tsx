

"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/use-timer";
import { Zap, Target, Timer, XCircle, Pause, Play, Home, CheckCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import TestResults from "./test-results";
import { lessons, practiceParagraphs, keyMap } from "@/lib/lessons";
import { Input } from "./ui/input";
import { useRouter } from 'next/navigation';
import type { Drill, Lesson, SingleDrill } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

interface TypingPracticeProps {
  textToType: string;
  timeLimit?: number; // in minutes
  lessonId?: string;
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

export const VisualTypingDrill = ({ drills, lessonId }: { drills: Drill[], lessonId?: string }) => {
    const router = useRouter();
    const [drillState, setDrillState] = useState({
        currentDrillIndex: 0,
        currentStepIndex: 0,
        status: 'pending' as 'pending' | 'correct' | 'incorrect',
    });

    const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const nextLessonButtonRef = useRef<HTMLButtonElement | null>(null);
    const restartButtonRef = useRef<HTMLButtonElement | null>(null);

    const { currentDrillIndex, currentStepIndex, status } = drillState;
    
    const isCompleted = currentDrillIndex >= drills.length;
    const totalDrills = drills.length;
    const progress = totalDrills > 0 ? (currentDrillIndex / totalDrills) * 100 : 0;
    const currentDrill = !isCompleted ? drills[currentDrillIndex] : null;
    const currentDrillStep = currentDrill?.steps[currentStepIndex];

     const handleKeyPress = useCallback((event: KeyboardEvent) => {
        if (isCompleted || !currentDrill || !currentDrillStep) {
            return;
        };

        const modifierKeys = ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Tab', 'Escape', 'Dead'];
        if (modifierKeys.includes(event.key)) {
            return;
        }
        
        if (event.key === 'Enter') {
           if(isCompleted) {
                if (nextLesson && nextLessonButtonRef.current) {
                    nextLessonButtonRef.current.click();
                } else if(restartButtonRef.current) {
                    restartButtonRef.current.click();
                }
           }
           return;
        }

        event.preventDefault();

        if (statusTimeoutRef.current) {
            clearTimeout(statusTimeoutRef.current);
            statusTimeoutRef.current = null;
        }
        
        const { key: expectedKey, shift: expectedShift } = currentDrillStep;

        if(expectedKey === ' ' && event.code === 'Space'){
            setDrillState(prev => {
                 return {
                        currentDrillIndex: prev.currentDrillIndex + 1,
                        currentStepIndex: 0,
                        status: 'correct',
                    };
            });
            return;
        }

        let expectedCode = '';
        if (expectedKey === ' ') {
            expectedCode = 'Space';
        } else if (/[a-zA-Z]/.test(expectedKey)) {
          expectedCode = `Key${expectedKey.toUpperCase()}`;
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
                default: expectedCode = expectedKey; // Fallback for other keys
            }
        }
        
        if (/[0-9]/.test(expectedKey)) {
             expectedCode = `Digit${expectedKey}`;
        }

        const isCorrect = event.code === expectedCode && event.shiftKey === expectedShift;
        
        if (isCorrect) {
            setDrillState(prev => {
                const isLastStepInDrill = prev.currentStepIndex >= (drills[prev.currentDrillIndex].steps.length - 1);
                
                if (isLastStepInDrill) {
                    return {
                        currentDrillIndex: prev.currentDrillIndex + 1,
                        currentStepIndex: 0,
                        status: 'correct',
                    };
                } else {
                    return {
                        ...prev,
                        currentStepIndex: prev.currentStepIndex + 1,
                        status: 'correct',
                    };
                }
            });
        } else {
            setDrillState(prev => ({ ...prev, status: 'incorrect' }));
            statusTimeoutRef.current = setTimeout(() => {
                setDrillState(prev => ({ ...prev, status: 'pending' }));
            }, 500);
        }
    }, [isCompleted, drills, drillState, currentDrill, currentDrillStep]);


    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            if (statusTimeoutRef.current) {
                clearTimeout(statusTimeoutRef.current);
            }
        };
    }, [handleKeyPress]);

    let nextLesson: Lesson | null = null;
    if (lessonId) {
        const currentLessonIndexInAllLessons = lessons.findIndex(l => l.id === lessonId);
        if (currentLessonIndexInAllLessons !== -1 && currentLessonIndexInAllLessons < lessons.length - 1) {
            const currentLesson = lessons[currentLessonIndexInAllLessons];
            // Find the next lesson in the same row
            let foundNextInRow = false;
            for(let i = currentLessonIndexInAllLessons + 1; i < lessons.length; i++) {
                if(lessons[i].row === currentLesson.row) {
                    nextLesson = lessons[i];
                    foundNextInRow = true;
                    break;
                }
            }
             if (!foundNextInRow) {
                 nextLesson = lessons.find(l => lessons.indexOf(l) > currentLessonIndexInAllLessons && l.row !== currentLesson.row) || null;
            }
        }
    }
    
    const resetDrill = useCallback(() => {
        setDrillState({
            currentDrillIndex: 0,
            currentStepIndex: 0,
            status: 'pending',
        });
    }, []);


    if (isCompleted) {
        return (
            <Card className="text-center p-8 max-w-lg mx-auto">
                <CardHeader>
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <CardTitle className="text-2xl">অনুশীলন সম্পন্ন!</CardTitle>
                    <CardDescription>খুব ভালো করেছেন!</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                    <Button ref={restartButtonRef} onClick={resetDrill}>আবার চেষ্টা করুন</Button>
                    {nextLesson && (
                        <Button ref={nextLessonButtonRef} onClick={() => router.push(`/practice/${nextLesson?.id}`)}>
                            পরবর্তী পাঠ <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    )}
                    <Button onClick={() => router.push('/dashboard/lessons')} variant="outline">পাঠক্রমে ফিরে যান</Button>
                </CardContent>
            </Card>
        )
    }

    const getVisibleDrills = () => {
        const visible: Drill[] = [];
        let count = 0;
        let drillIdx = currentDrillIndex;

        while(count < 10 && drillIdx < drills.length) {
            visible.push(drills[drillIdx]);
            
            // If the current drill is a space, we add a visual spacer
            if (drills[drillIdx].prompt === ' ') {
                 if ( (visible.length-1) % 5 === 4) { // Add spacer after 4 prompts + 1 space
                    // This is a visual element, doesn't affect logic
                 }
            }
            drillIdx++;
            count++;
        }
        return visible;
    };


    const renderDrillPrompt = (drillData: Drill, isCurrent: boolean, key: string | number) => {
        if(drillData.prompt === ' '){
            return (
                <div key={key} className={cn("flex items-center justify-center h-16 w-24 rounded-md border-2 border-dashed", isCurrent && "ring-2 ring-primary")}>
                    <span className="text-muted-foreground italic">স্পেস</span>
                </div>
            )
        }
        let boxClass = "bg-secondary";
        if (isCurrent && status === 'correct') boxClass = "bg-green-100 border-green-500";
        if (isCurrent && status === 'incorrect') boxClass = "bg-red-100 border-red-500";
        
        return (
            <div key={key} className={cn("flex items-center justify-center h-16 w-16 rounded-md border text-3xl font-hind", boxClass, isCurrent && "ring-2 ring-primary")}>
               {drillData.prompt}
            </div>
        )
    }

    const visibleDrills = getVisibleDrills();
    const promptsWithSpacers: (Drill | {isSpacer: true})[] = [];
    visibleDrills.forEach((drill, index) => {
        promptsWithSpacers.push(drill);
        if (drill.prompt === ' ' && (index + 1) % 5 === 0) {
           promptsWithSpacers.push({ isSpacer: true });
        }
    });

    return (
        <div className="p-4 md:p-8 rounded-lg bg-secondary/30 border max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-2/3 space-y-4">
                    {/* Prompt Display */}
                    <div className="flex items-center justify-center gap-2 bg-background p-4 rounded-lg min-h-[80px] flex-wrap">
                        {promptsWithSpacers.map((item, index) => {
                             if ('isSpacer' in item) {
                                return <div key={`spacer-${index}`} className="w-full h-2"></div>
                            }
                            const isCurrent = currentDrillIndex === drills.indexOf(item);
                            return renderDrillPrompt(item, isCurrent, `${item.prompt}-${index}`);
                        })}
                    </div>
                     
                    {/* Virtual Keyboard */}
                    <SimplifiedKeyboard highlightKey={currentDrillStep?.key} needsShift={!!currentDrillStep?.shift} />
                    
                </div>
                <div className="w-full md:w-1/3 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>অগ্রগতি</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center gap-4">
                                <div className="text-3xl font-bold text-primary">{toBengaliNumber(Math.round(progress))}%</div>
                                <Progress value={progress} className="w-full" />
                            </div>
                        </CardContent>
                    </Card>
                     <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => router.push('/dashboard/lessons')}>বাতিল</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

type KeyLayoutData = {
    key: string;
    bn: string;
    bnShift?: string;
    bnExtra?: string;
    bnShiftExtra?: string;
    width?: string;
    align?: 'left' | 'right';
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
        {key: '[', bn: 'ড', bnShift: 'ঢ'},
        {key: ']', bn: 'ব', bnShift: 'ভ'},
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
        {key: ';', bn: 'ে', bnShift: 'এ' },
        {key: "'", bn: 'ো', bnShift: 'ও' },
    ],
    bottom: [
        {key: 'ShiftLeft', bn: 'Shift', width: 'w-28', align: 'left'},
        {key: 'z', bn: '্য', bnShift: 'ং'},
        {key: 'x', bn: 'ত', bnShift: 'থ'},
        {key: 'c', bn: 'চ', bnShift: 'ছ'},
        {key: 'v', bn: 'দ', bnShift: 'ধ'},
        {key: 'b', bn: 'ব', bnShift: 'ভ'},
        {key: 'n', bn: 'ন', bnShift: 'ণ'},
        {key: 'm', bn: 'ম', bnShift: 'ম'},
        {key: ',', bn: ',', bnShift: ':'},
        {key: '.', bn: '।', bnShift: '.'},
        {key: '/', bn: "'", bnShift: '"'},
        {key: 'ShiftRight', bn: 'Shift', width: 'flex-grow', align: 'right'},
    ],
    space: [
        {key: ' ', bn: 'Space', width: 'w-full'},
    ]
};

const Key = ({ data, isHighlighted, needsShift }: { data: KeyLayoutData, isHighlighted: boolean, needsShift: boolean }) => {
    const { key, bn, bnShift, bnExtra, bnShiftExtra, width, align } = data;

    const isShiftKey = key.toLowerCase().includes('shift');

    const baseKeyClasses = cn(
        "relative flex flex-col items-center justify-center h-16 rounded-md bg-secondary border border-b-4 font-hind transition-colors",
        width || 'w-16',
        (isHighlighted || (isShiftKey && needsShift)) && 'bg-primary/20 border-primary text-primary',
        align === 'left' && 'mr-auto',
        align === 'right' && 'ml-auto',
    );
    
    const hasMultipleChars = bnExtra || bnShiftExtra;

    if (key.includes('Shift') || key.includes('Backspace') || key === 'Enter' || key === ' ' || key === 'Tab' || key === 'CapsLock' || key.includes('Control') || key.includes('Alt')) {
        return (
            <div className={baseKeyClasses}>
                <span className="text-sm font-bold">{bn}</span>
            </div>
        )
    }

    if (hasMultipleChars) {
        const bnExtraExists = !!bnExtra;
        const bnShiftExtraExists = !!bnShiftExtra;
        const bnShiftExists = !!bnShift;
        const hasFour = bnExtraExists && bnShiftExtraExists && bnShiftExists;
        const hasThree = !hasFour && [bnExtraExists, bnShiftExtraExists, bnShiftExists].filter(Boolean).length === 2;

        if (hasFour) {
            return (
                <div className={baseKeyClasses}>
                    <div className="absolute top-0 left-0 w-full h-full grid grid-cols-2 grid-rows-2 text-xs p-1">
                        <span className="flex items-center justify-center text-muted-foreground">{bnShiftExtra}</span>
                        <span className="flex items-center justify-center text-muted-foreground">{bnShift}</span>
                        <span className="flex items-center justify-center text-muted-foreground">{bnExtra}</span>
                        <span className="flex items-center justify-center font-bold text-lg">{bn}</span>
                    </div>
                </div>
            )
        }
        if (hasThree) {
             return (
                <div className={baseKeyClasses}>
                    <div className="absolute top-0 left-0 w-full h-full grid grid-cols-2 grid-rows-2 text-xs p-1">
                         <span className="col-span-1 flex items-center justify-center text-muted-foreground">{bnShiftExtra || bnShift}</span>
                         <span className="col-span-1 flex items-center justify-center text-muted-foreground">{bnShiftExtra ? bnShift: bnExtra}</span>
                         <span className="col-span-2 flex items-center justify-center font-bold text-lg">{bn}</span>
                    </div>
                </div>
            )
        }
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
                    const isHighlighted = highlightKey && (
                        keyData.key.toLowerCase() === highlightKey.toLowerCase() ||
                        (highlightKey === 'Shift' && keyData.key.toLowerCase().includes('shift'))
                    );
                    let finalNeedsShift = needsShift;

                    if (isHighlighted && (keyData.key === 'ShiftLeft' || keyData.key === 'ShiftRight')) {
                       finalNeedsShift = true;
                    }
                    
                    return <Key key={keyData.key} data={keyData} isHighlighted={isHighlighted} needsShift={finalNeedsShift} />;
                })}
            </div>
        ))}
    </div>
);

export default function TypingPractice({ textToType: initialText, timeLimit, lessonId }: TypingPracticeProps) {
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
  

  const resetTest = useCallback((isNewTest = true) => {
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
  }, [reset, initialText, timeLimit]);
  
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
    
    if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
        if(isActive && !isPaused) {
            pause();
        }
    }, 4000);
    
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
    return <TestResults stats={{ wpm: wpm, accuracy: accuracy, errors: totalErrors, timeElapsed: time }} onRestart={() => resetTest(!timeLimit)} lessonId={lessonId} />;
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
    

    


















