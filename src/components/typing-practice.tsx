
"use client";

import * as React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/use-timer";
import { Zap, Target, Timer, XCircle, Pause, Play, Home } from "lucide-react";
import { cn, toBengaliNumber } from "@/lib/utils";
import TestResults from "./test-results";
import { practiceParagraphs } from "@/lib/lessons";
import { Input } from "./ui/input";
import { useRouter } from 'next/navigation';
import type { Drill } from "@/lib/types";

// Import Refactored Components
import { WordDrill } from "./drills/WordDrill";
import { VisualTypingDrill } from "./drills/VisualTypingDrill";

interface TypingPracticeProps {
  textToType: string;
  timeLimit?: number; // in minutes
  lessonId?: string;
  onRestart?: () => void;
  isPracticeDrill?: boolean;
  accuracyGoal?: number;
}

const StatDisplay = ({ icon: Icon, value, label }: { icon: React.ElementType, value: string | number, label: string }) => (
  <div className="flex items-center gap-2 text-lg">
    <Icon className="h-5 w-5 text-primary" />
    <span className="font-semibold">{toBengaliNumber(value)}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);

// Exports for backward compatibility if these were imported elsewhere,
// though ideally they should be imported from their new locations.
export { WordDrill, VisualTypingDrill };

export default function TypingPractice({ textToType: initialText, timeLimit, lessonId, onRestart: customOnRestart, isPracticeDrill = false, accuracyGoal = 95 }: TypingPracticeProps) {
  const [textToType, setTextToType] = useState(initialText?.normalize('NFC') || '');
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [typedWords, setTypedWords] = useState<string[]>([]);
  
  const [totalErrors, setTotalErrors] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const maxTime = isPracticeDrill ? 360 : (timeLimit ? timeLimit * 60 : 0);
  const { time, isActive, isPaused, start, pause, resume, reset } = useTimer();

  const timeLeft = maxTime > 0 ? maxTime - time : time;

  useEffect(() => {
    let newWords: string[] = [];
    if (isPracticeDrill) {
        let repeatedText = '';
        const baseWords = initialText.split(' ').filter(w => w);
        if (baseWords.length > 0) {
            while(repeatedText.length < 10000) { // create a very long text to prevent running out
                repeatedText += baseWords.join(' ') + ' ';
            }
        }
        newWords = repeatedText.split(' ').filter(w => w);
    } else {
        newWords = initialText?.normalize('NFC').split(' ').filter(w => w) || [];
    }
    setWords(newWords);
    setTextToType(newWords.join(' '));

  }, [initialText, isPracticeDrill]);


  const calculateStats = useCallback(() => {
    const wordsSoFar = typedWords.slice(0, currentWordIndex);
    const correctChars = wordsSoFar.reduce((acc, typedWord, index) => {
        const originalWord = words[index];
        if (typedWord === originalWord) {
            return acc + originalWord.length;
        }
        return acc;
    }, 0);

    const grossChars = wordsSoFar.join('').length + Math.max(0, wordsSoFar.length); // add spaces
    
    // Accuracy
    const currentAccuracy = grossChars > 0 ? (correctChars / grossChars) * 100 : 100;
    setAccuracy(Math.round(currentAccuracy));
    
    // WPM
    const grossWpm = time > 0 ? (grossChars / 5) / (time / 60) : 0;
    setWpm(Math.round(grossWpm > 0 ? grossWpm : 0));

  }, [time, typedWords, words, currentWordIndex]);
  
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
    setTotalChars(0);
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
    
    if (value.endsWith(' ')) {
        if(currentInput.trim() === '') {
            setCurrentInput('');
            return;
        };

        const typedWord = currentInput.trim().normalize('NFC');
        const newTypedWords = [...typedWords, typedWord];
        setTypedWords(newTypedWords);
        
        const expectedWord = words[currentWordIndex].normalize('NFC');
        setTotalChars(prev => prev + expectedWord.length + 1); // +1 for space

        if(typedWord !== expectedWord) {
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
    if (!isActive || isPaused) return;

    calculateStats();
    
    const isTestFinished = !isPracticeDrill && currentWordIndex === words.length && words.length > 0;
    const isTimeUp = maxTime > 0 && time >= maxTime;
    
    let isGoalMet = false;
    if (isPracticeDrill) {
        isGoalMet = time >= 240 && wpm >= 25 && accuracy >= (accuracyGoal || 95);
    }

    if (isTestFinished || isTimeUp || isGoalMet) {
      finishSession();
    }
  }, [time, isActive, isPaused, maxTime, calculateStats, finishSession, currentWordIndex, words, isPracticeDrill, wpm, accuracy, accuracyGoal]);


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
    return <TestResults stats={{ wpm, accuracy: accuracy, errors: totalErrors, timeElapsed: time }} onRestart={() => resetTest(!timeLimit)} lessonId={lessonId} isDrill={isPracticeDrill} accuracyGoal={accuracyGoal}/>;
  }

  const textDisplayFontSize = 'text-3xl';

  return (
    <div className="space-y-6 flex flex-col items-center w-full max-w-4xl mx-auto">
      <Card className="w-full">
        <CardContent className="p-4 flex flex-wrap items-center justify-around gap-4">
          <StatDisplay icon={Zap} value={wpm} label="WPM" />
          <StatDisplay icon={Target} value={`${accuracy}%`} label="Accuracy" />
          <StatDisplay icon={Timer} value={maxTime > 0 ? toBengaliNumber(new Date(timeLeft * 1000).toISOString().substr(14, 5)) : toBengaliNumber(new Date(time * 1000).toISOString().substr(14, 5))} label={maxTime > 0 ? "বাকি" : "সময়"} />
          <StatDisplay icon={XCircle} value={totalErrors} label="ভুল শব্দ" />
        </CardContent>
      </Card>

       <Card className={cn("w-full p-6 tracking-wider font-hind leading-relaxed relative select-none", textDisplayFontSize)}>
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
          "font-hind p-2 flex items-center justify-center min-h-[3rem] w-full",
          textDisplayFontSize
        )}>
          {getPreviewContent()}
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleUserInputChange}
          className={cn(
            "w-full text-center font-hind p-6 border-t-0 rounded-t-none",
             isError ? "border-red-500 focus-visible:ring-red-500" : "border-green-500 focus-visible:ring-green-500",
             textDisplayFontSize
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
