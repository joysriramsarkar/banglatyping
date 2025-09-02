
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VirtualKeyboard } from "./virtual-keyboard";
import { useTimer } from "@/hooks/use-timer";
import { Zap, Target, Timer, XCircle, RefreshCw, Pause, Play, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";
import TestResults from "./test-results";
import { practiceParagraphs } from "@/lib/lessons";

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
  const [userInput, setUserInput] = useState("");
  const [totalTypedChars, setTotalTypedChars] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalTime = timeLimit ? timeLimit * 60 : 0;
  const { time, isActive, isPaused, start, pause, resume, reset } = useTimer();

  const timeLeft = totalTime > 0 ? totalTime - time : time;
  const currentCharlIndex = userInput.length;

  const calculateWpm = useCallback(() => {
    if (time > 0) {
      const grossWpm = (totalTypedChars / 5) / (time / 60);
      setWpm(Math.round(grossWpm > 0 ? grossWpm : 0));
    }
  }, [time, totalTypedChars]);

  const calculateAccuracy = useCallback(() => {
    if (totalTypedChars > 0) {
      const newAccuracy = ((totalTypedChars - totalErrors) / totalTypedChars) * 100;
      setAccuracy(Math.round(newAccuracy > 0 ? newAccuracy : 0));
    } else {
      setAccuracy(100);
    }
  }, [totalTypedChars, totalErrors]);
  
  const resetTest = useCallback((isNewTest = true) => {
    reset();
    setUserInput("");
    setWpm(0);
    setAccuracy(100);
    setTotalErrors(0);
    setTotalTypedChars(0);
    setIsFinished(false);
    if (isNewTest) {
        const randomParagraph = practiceParagraphs[Math.floor(Math.random() * practiceParagraphs.length)];
        setTextToType(randomParagraph);
    } else {
        setTextToType(initialText);
    }
    inputRef.current?.focus();
  }, [reset, initialText]);

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (isFinished) return;
    if (!isActive && !isPaused) start();

    setUserInput(value);
  };
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const finishSession = () => {
    setIsFinished(true);
    pause();
  };

  const nextParagraph = useCallback(() => {
      const currentErrors = userInput.split('').reduce((acc, char, i) => {
          return acc + (char.normalize("NFC") !== textToType.normalize("NFC")[i] ? 1 : 0);
      }, 0);
      
      setTotalTypedChars(prev => prev + textToType.length);
      setTotalErrors(prev => prev + currentErrors);
      
      const randomParagraph = practiceParagraphs.filter(p => p !== textToType)[Math.floor(Math.random() * (practiceParagraphs.length - 1))];
      setTextToType(randomParagraph);
      setUserInput("");
  }, [userInput, textToType]);

  useEffect(() => {
    if (isActive && !isPaused) {
      calculateWpm();
      calculateAccuracy();

      if (userInput.normalize("NFC").length === textToType.normalize("NFC").length) {
          if (timeLimit) {
             // In timed mode, continue until time is up
          } else {
            // In practice mode, load next paragraph
            nextParagraph();
          }
      }
      
      if (timeLimit && time >= timeLimit * 60) {
        finishSession();
      }
    }
  }, [userInput, time, isActive, isPaused, textToType, timeLimit, calculateWpm, calculateAccuracy, pause, nextParagraph]);

  const currentErrors = userInput.split('').reduce((acc, char, i) => {
      return acc + (char.normalize("NFC") !== textToType.normalize("NFC")[i] ? 1 : 0);
  }, 0);

  if(isFinished) {
    return <TestResults stats={{ wpm, accuracy, errors: totalErrors, timeElapsed: time }} onRestart={() => resetTest(true)} />;
  }

  return (
    <div className="space-y-6 flex flex-col items-center w-full max-w-4xl mx-auto">
      <Card className="w-full">
        <CardContent className="p-4 flex flex-wrap items-center justify-around gap-4">
          <StatDisplay icon={Zap} value={wpm} label="WPM" />
          <StatDisplay icon={Target} value={`${accuracy}%`} label="Accuracy" />
          <StatDisplay icon={Timer} value={timeLimit ? new Date(timeLeft * 1000).toISOString().substr(14, 5) : time} label={timeLimit ? "বাকি" : "সময়"} />
          <StatDisplay icon={XCircle} value={totalErrors + currentErrors} label="ভুল" />
        </CardContent>
      </Card>

      <div className="relative w-full" onClick={() => inputRef.current?.focus()}>
        <Card className="p-6 text-2xl tracking-wider font-mono leading-relaxed relative">
          <div className="select-none">
            {textToType.split("").map((char, index) => {
              const isTyped = index < userInput.length;
              const isCorrect = userInput.normalize("NFC")[index] === textToType.normalize("NFC")[index];
              return (
                <span
                  key={index}
                  className={cn({
                    "text-muted-foreground": !isTyped,
                    "text-green-500": isTyped && isCorrect,
                    "text-red-500 underline": isTyped && !isCorrect,
                  })}
                >
                  {index === userInput.length && <span className="absolute animate-pulse bg-primary h-8 w-px -ml-px" />}
                  {char}
                </span>
              );
            })}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleUserInputChange}
            className="absolute inset-0 opacity-0 w-full h-full cursor-text"
            disabled={isFinished}
            onPaste={(e) => e.preventDefault()}
            lang="bn"
          />
        </Card>
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
      
      <div className="w-full mt-4">
        <VirtualKeyboard nextChar={textToType.normalize("NFC")[userInput.normalize("NFC").length]} />
      </div>
    </div>
  );
}

    