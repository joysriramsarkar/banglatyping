
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/use-timer";
import { Zap, Target, Timer, XCircle, Pause, Play, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import TestResults from "./test-results";
import { practiceParagraphs } from "@/lib/lessons";
import { Input } from "./ui/input";
import { useRouter } from 'next/navigation';

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

export default function TypingPractice({ textToType: initialText, timeLimit, lessonId }: TypingPracticeProps) {
  const [textToType, setTextToType] = useState(initialText.normalize('NFC'));
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
  const router = useRouter();

  const totalTime = timeLimit ? timeLimit * 60 : 0;
  const { time, isActive, isPaused, start, pause, resume, reset } = useTimer();

  const timeLeft = totalTime > 0 ? totalTime - time : time;

  useEffect(() => {
    const newWords = textToType.normalize('NFC').split(' ').filter(w => w);
    setWords(newWords);
  }, [textToType]);


  const calculateWpm = useCallback(() => {
    if (time > 0) {
      const correctChars = typedWords.reduce((acc, word, index) => {
        if(word.normalize('NFC') === words[index].normalize('NFC')) {
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
             if (!targetWord) return errorCount;
             for(let i=0; i< typedWord.length; i++) {
                 if (!targetWord[i] || typedWord[i].normalize('NFC') !== targetWord[i].normalize('NFC')) {
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
    setIsFinished(true);
    pause();
    calculateWpm();
    calculateAccuracy();
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  }, [pause, calculateWpm, calculateAccuracy]);

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
        if(targetWord.normalize('NFC') !== typedWord.normalize('NFC')) {
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
    const isTestFinished = currentWordIndex === words.length && words.length > 0;
    if (isActive && !isPaused) {
      calculateWpm();
      calculateAccuracy();
      
      const isTimeUp = timeLimit && time >= timeLimit * 60;
      
      if (isTestFinished || isTimeUp) {
        finishSession();
      }
    }
     if (isTestFinished) {
      finishSession();
    }
  }, [time, isActive, isPaused, timeLimit, calculateWpm, calculateAccuracy, finishSession, currentWordIndex, words.length]);


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
    return "text-primary bg-yellow-100 dark:bg-yellow-800/50 rounded px-1";
  }

  const currentWord = words[currentWordIndex] || '';
  const isError = currentInput.length > 0 && !currentWord.startsWith(currentInput.normalize('NFC'));


  if(isFinished) {
    const finalErrors = typedWords.reduce((errorCount, typedWord, index) => {
        if(words[index] && typedWord.normalize('NFC') !== words[index].normalize('NFC')) return errorCount + 1;
        return errorCount;
    }, 0);

    return <TestResults stats={{ wpm, accuracy, errors: finalErrors, timeElapsed: time }} onRestart={() => resetTest(!timeLimit)} lessonId={lessonId} />;
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

      <Card className="w-full p-6 text-2xl tracking-wider font-mono leading-relaxed relative select-none">
          <p>
            {words.map((word, index) => (
                <span key={index} className={cn("transition-colors", getWordClass(index))}>
                    {word}{' '}
                </span>
            ))}
          </p>
      </Card>

       <div className="w-full h-16 flex flex-col items-center justify-center">
        <div className={cn(
          "text-2xl font-mono p-2",
          isError ? "text-red-500" : "text-green-500"
        )}>
           {currentWord.split('').map((char, index) => {
              let charClass = "opacity-50";
              if(index < currentInput.length) {
                charClass = currentInput[index] === char ? "opacity-100" : "opacity-100 text-red-500";
              }
              return <span key={index} className={charClass}>{char}</span>
           })}
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={handleUserInputChange}
          className={cn(
            "w-full text-center text-2xl font-mono p-6 border-t-0 rounded-t-none",
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
          {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
