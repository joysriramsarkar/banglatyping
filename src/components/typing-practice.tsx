"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VirtualKeyboard } from "./virtual-keyboard";
import { useTimer } from "@/hooks/use-timer";
import { Zap, Target, Timer, XCircle, RefreshCw, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import TestResults from "./test-results";

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

export default function TypingPractice({ textToType, timeLimit }: TypingPracticeProps) {
  const [userInput, setUserInput] = useState("");
  const [errors, setErrors] = useState(0);
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
      const wordsTyped = (currentCharlIndex / 5);
      const wpmCalc = Math.round((wordsTyped / time) * 60);
      setWpm(wpmCalc > 0 ? wpmCalc : 0);
    }
  }, [currentCharlIndex, time]);

  const calculateAccuracy = useCallback(() => {
    if (currentCharlIndex > 0) {
      const newAccuracy = ((currentCharlIndex - errors) / currentCharlIndex) * 100;
      setAccuracy(Math.round(newAccuracy > 0 ? newAccuracy : 0));
    } else {
      setAccuracy(100);
    }
  }, [currentCharlIndex, errors]);

  const resetTest = () => {
    reset();
    setUserInput("");
    setErrors(0);
    setWpm(0);
    setAccuracy(100);
    setIsFinished(false);
    if(inputRef.current) inputRef.current.focus();
  };

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (isFinished) return;
    if (!isActive && !isPaused) start();

    const lastChar = value[value.length - 1];
    const expectedChar = textToType[currentCharlIndex];

    if (lastChar !== expectedChar) {
      setErrors(errors + 1);
    }
    setUserInput(value);
  };
  
  useEffect(() => {
    if(inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    if(isActive && !isPaused) {
      calculateWpm();
      calculateAccuracy();
      
      if (currentCharlIndex === textToType.length || (timeLimit && time >= timeLimit * 60)) {
        setIsFinished(true);
        pause();
      }
    }
  }, [userInput, time, isActive, isPaused, textToType.length, timeLimit, calculateWpm, calculateAccuracy, pause]);

  if(isFinished) {
    return <TestResults stats={{ wpm, accuracy, errors, timeElapsed: time }} onRestart={resetTest} />;
  }

  return (
    <div className="space-y-6 flex flex-col items-center w-full max-w-4xl mx-auto">
      <Card className="w-full">
        <CardContent className="p-4 flex flex-wrap items-center justify-around gap-4">
          <StatDisplay icon={Zap} value={wpm} label="WPM" />
          <StatDisplay icon={Target} value={`${accuracy}%`} label="Accuracy" />
          <StatDisplay icon={Timer} value={timeLimit ? new Date(timeLeft * 1000).toISOString().substr(14, 5) : time} label={timeLimit ? "বাকি" : "সময়"} />
          <StatDisplay icon={XCircle} value={errors} label="ভুল" />
        </CardContent>
      </Card>

      <div className="relative w-full" onClick={() => inputRef.current?.focus()}>
        <Card className="p-6 text-2xl tracking-wider font-mono leading-relaxed relative">
          <div className="select-none">
            {textToType.split("").map((char, index) => {
              const isTyped = index < currentCharlIndex;
              const isCorrect = userInput[index] === char;
              return (
                <span
                  key={index}
                  className={cn({
                    "text-muted-foreground": !isTyped,
                    "text-green-500": isTyped && isCorrect,
                    "text-red-500 underline": isTyped && !isCorrect,
                  })}
                >
                  {index === currentCharlIndex && <span className="absolute animate-pulse bg-primary h-8 w-px -ml-px" />}
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
          />
        </Card>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button onClick={isPaused ? resume : pause} variant="outline" size="icon" disabled={!isActive}>
          {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </Button>
        <Button onClick={resetTest} variant="outline" size="icon">
          <RefreshCw className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="w-full mt-4">
        <VirtualKeyboard nextChar={textToType[currentCharlIndex]} />
      </div>
    </div>
  );
}
