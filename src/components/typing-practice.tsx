
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/use-timer";
import { Zap, Target, Timer, XCircle, RefreshCw, Pause, Play, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import TestResults from "./test-results";
import { practiceParagraphs } from "@/lib/lessons";
import { Input } from "./ui/input";

interface TypingPracticeProps {
  textToType: string;
  timeLimit?: number; // in minutes
}

const StatDisplay = ({ icon: Icon, value, label }: { icon: React.ElementType, value: string | number, label: string }) => (
  <div className="flex items-center gap-2 text-lg">
    <Icon className="h-5 w-5 text-primary" />
    <span className="font-semibold">{value}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);

export default function TypingPractice({ textToType: initialText, timeLimit }: TypingPracticeProps) {
  const [textToType, setTextToType] = useState(initialText);
  const [words, setWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [typedWords, setTypedWords] = useState<string[]>([]);
  
  const [totalTypedChars, setTotalTypedChars] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalTime = timeLimit ? timeLimit * 60 : 0;
  const { time, isActive, isPaused, start, pause, resume, reset } = useTimer();

  const timeLeft = totalTime > 0 ? totalTime - time : time;

  useEffect(() => {
    const newWords = textToType.split(' ').filter(w => w);
    setWords(newWords);
    setCurrentWordIndex(0);
    setTypedWords([]);
    setCurrentInput("");
  }, [textToType]);


  const calculateWpm = useCallback(() => {
    if (time > 0) {
      // WPM is calculated based on characters in correctly typed words.
      const correctChars = typedWords.reduce((acc, word, index) => {
        if(word === words[index]) {
          return acc + word.length + 1; // +1 for space
        }
        return acc;
      }, 0);

      const grossWpm = (correctChars / 5) / (time / 60);
      setWpm(Math.round(grossWpm > 0 ? grossWpm : 0));
    }
  }, [time, typedWords, words]);
  
  const calculateAccuracy = useCallback(() => {
    const typedCharsCount = typedWords.reduce((acc, word) => acc + word.length, 0) + typedWords.length;
    if (typedCharsCount > 0) {
        const errorsInTypedWords = typedWords.reduce((errorCount, typedWord, index) => {
             const targetWord = words[index];
             for(let i=0; i< typedWord.length; i++) {
                 if (typedWord[i] !== targetWord[i]) {
                     errorCount++;
                 }
             }
             return errorCount + Math.abs(targetWord.length - typedWord.length);
        },0);

        const newAccuracy = ((typedCharsCount - errorsInTypedWords) / typedCharsCount) * 100;
        setAccuracy(Math.round(newAccuracy > 0 ? newAccuracy : 0));
    } else {
        setAccuracy(100);
    }
  }, [typedWords, words]);


  const resetTest = useCallback((isNewTest = true) => {
    reset();
    setCurrentInput("");
    setWpm(0);
    setAccuracy(100);
    setTotalErrors(0);
    setTotalTypedChars(0);
    setIsFinished(false);
    if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
    }
    if (isNewTest) {
        const randomParagraph = practiceParagraphs[Math.floor(Math.random() * practiceParagraphs.length)];
        setTextToType(randomParagraph);
    } else {
        setTextToType(initialText);
    }
    setCurrentWordIndex(0);
    setTypedWords([]);
    inputRef.current?.focus();
  }, [reset, initialText]);
  
  const finishSession = useCallback(() => {
    setIsFinished(true);
    pause();
    calculateWpm();
    calculateAccuracy();
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  }, [pause, calculateWpm, calculateAccuracy]);

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

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

    if (value.endsWith(' ')) {
        if(currentInput.trim() === '') {
            setCurrentInput('');
            return;
        };

        const newTypedWords = [...typedWords, currentInput.trim()];
        setTypedWords(newTypedWords);
        setCurrentWordIndex(prev => prev + 1);
        setCurrentInput("");
        setTotalTypedChars(p => p + currentInput.trim().length + 1);

        const targetWord = words[currentWordIndex];
        const typedWord = currentInput.trim();
        if(targetWord !== typedWord) {
            setTotalErrors(prev => prev + 1);
        }

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
    if (isActive && !isPaused) {
      calculateWpm();
      calculateAccuracy();
      
      if (timeLimit && time >= timeLimit * 60) {
        finishSession();
      }

      if (!timeLimit && currentWordIndex === words.length && words.length > 0) {
        if (!timeLimit) { // If not a timed test, move to next paragraph
            const randomParagraph = practiceParagraphs.filter(p => p !== textToType)[Math.floor(Math.random() * (practiceParagraphs.length - 1))];
            setTextToType(randomParagraph);
        }
      }
    }
  }, [time, isActive, isPaused, timeLimit, calculateWpm, calculateAccuracy, finishSession, currentWordIndex, words.length, textToType]);


  useEffect(() => {
      if(isPaused && inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
      }
  }, [isPaused])


  const getWordClass = (wordIdx: number) => {
    if (wordIdx > currentWordIndex) return "text-muted-foreground";
    if (wordIdx < currentWordIndex) {
        return typedWords[wordIdx] === words[wordIdx] ? "text-green-500" : "text-red-500 line-through";
    }
    return "text-primary underline underline-offset-4";
  }

  const currentWord = words[currentWordIndex] || '';
  const isError = currentInput.length > 0 && !currentWord.startsWith(currentInput);


  if(isFinished) {
    const finalErrors = typedWords.reduce((errorCount, typedWord, index) => {
        if(typedWord !== words[index]) return errorCount + 1;
        return errorCount;
    }, 0);

    return <TestResults stats={{ wpm, accuracy, errors: finalErrors, timeElapsed: time }} onRestart={() => resetTest(true)} />;
  }

  return (
    <div className="space-y-6 flex flex-col items-center w-full max-w-4xl mx-auto">
      <Card className="w-full">
        <CardContent className="p-4 flex flex-wrap items-center justify-around gap-4">
          <StatDisplay icon={Zap} value={wpm} label="WPM" />
          <StatDisplay icon={Target} value={`${accuracy}%`} label="Accuracy" />
          <StatDisplay icon={Timer} value={timeLimit ? new Date(timeLeft * 1000).toISOString().substr(14, 5) : new Date(time * 1000).toISOString().substr(14, 5)} label={timeLimit ? "বাকি" : "সময়"} />
          <StatDisplay icon={XCircle} value={totalErrors} label="ভুল শব্দ" />
        </CardContent>
      </Card>

      <Card className="w-full p-6 text-2xl tracking-wider font-mono leading-relaxed relative select-none">
          <p>
            {words.map((word, index) => (
                <span key={index} className={cn("transition-colors", getWordClass(index))}>
                    {word}{' '}
                </span>
            ))}
          </p>
      </Card>

      <div className="w-full relative">
        <Input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={handleUserInputChange}
            className={cn("w-full text-center text-2xl font-mono p-6", {
                'border-red-500 focus-visible:ring-red-500': isError,
            })}
            placeholder="টাইপ করুন..."
            disabled={isFinished}
            onPaste={(e) => e.preventDefault()}
            lang="bn"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[calc(50%+2.5rem)] text-2xl font-mono text-muted-foreground pointer-events-none">
            {currentInput.split('').map((char, index) => {
                const isCharCorrect = char === currentWord[index];
                return (
                    <span key={index} className={cn({ "text-green-500": isCharCorrect, "text-red-500": !isCharCorrect })}>
                        {currentWord[index]}
                    </span>
                )
            })}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button onClick={isPaused ? resume : pause} variant="outline" size="icon" disabled={!isActive}>
          {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </Button>
        <Button onClick={() => resetTest(true)} variant="outline" size="icon">
          <RefreshCw className="h-5 w-5" />
        </Button>
        <Button onClick={finishSession} disabled={!isActive}>
            <BarChart className="mr-2 h-4 w-4" />
            ফলাফল দেখুন
        </Button>
      </div>
    </div>
  );
}
