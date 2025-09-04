
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimer } from "@/hooks/use-timer";
import { Zap, Target, Timer, XCircle, Pause, Play, Home, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import TestResults from "./test-results";
import { practiceParagraphs } from "@/lib/lessons";
import { Input } from "./ui/input";
import { useRouter } from 'next/navigation';
import type { Drill } from "@/lib/types";
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

const VisualTypingDrill = ({ drills }: { drills: Drill[] }) => {
    const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
    const [status, setStatus] = useState<'pending' | 'correct' | 'incorrect'>('pending');
    const totalDrills = drills.length;
    const progress = (currentDrillIndex / totalDrills) * 100;

    const handleKeyPress = useCallback((event: KeyboardEvent) => {
        event.preventDefault();
        if (status !== 'pending' || currentDrillIndex >= totalDrills) return;

        const currentDrill = drills[currentDrillIndex];
        const expectedKey = currentDrill.key === ' ' ? 'Space' : currentDrill.key;
        
        if (event.key.toLowerCase() === expectedKey.toLowerCase()) {
            setStatus('correct');
            setTimeout(() => {
                setStatus('pending');
                setCurrentDrillIndex(prev => prev + 1);
            }, 300);
        } else {
            setStatus('incorrect');
            setTimeout(() => {
                setStatus('pending');
            }, 500);
        }
    }, [currentDrillIndex, drills, status, totalDrills]);


    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [handleKeyPress]);

    if (currentDrillIndex >= totalDrills) {
        return (
            <Card className="text-center p-8">
                <CardHeader>
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <CardTitle className="text-2xl">অনুশীলন সম্পন্ন!</CardTitle>
                    <CardDescription>খুব ভালো করেছেন!</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => setCurrentDrillIndex(0)}>আবার চেষ্টা করুন</Button>
                </CardContent>
            </Card>
        )
    }

    const currentDrill = drills[currentDrillIndex];

    return (
        <div className="p-4 md:p-8 rounded-lg bg-secondary/30 border max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-2/3 space-y-8">
                    {/* Prompt Display */}
                    <div className="flex items-center justify-center gap-2 bg-background p-4 rounded-lg min-h-[80px]">
                        {drills.slice(currentDrillIndex, Math.min(currentDrillIndex + 8, totalDrills)).map((drill, index) => {
                            const isCurrent = index === 0;
                            let boxClass = "bg-secondary";
                            if (isCurrent && status === 'correct') boxClass = "bg-green-100 border-green-500";
                            if (isCurrent && status === 'incorrect') boxClass = "bg-red-100 border-red-500";
                            
                            return (
                                <div key={index} className={cn("flex items-center justify-center h-16 w-16 rounded-md border text-2xl font-bold", boxClass, isCurrent && "ring-2 ring-primary")}>
                                   {drill.prompt === ' ' ? 'Space' : drill.prompt}
                                </div>
                            )
                        })}
                    </div>
                    
                    {/* Virtual Keyboard */}
                    <VirtualKeyboard highlightKey={currentDrill.key} />
                    
                    {/* Hand Guide */}
                    <HandGuide highlightKey={currentDrill.key} />

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
                        <Button variant="outline">বাতিল</Button>
                        <Button>পরবর্তী</Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const keyboardLayout = {
    top: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    home: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    bottom: ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    space: [' '],
};

const keyToFingerMap: Record<string, { hand: 'left' | 'right', finger: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb' }> = {
    'q': { hand: 'left', finger: 'pinky' }, 'a': { hand: 'left', finger: 'pinky' }, 'z': { hand: 'left', finger: 'pinky' },
    'w': { hand: 'left', finger: 'ring' }, 's': { hand: 'left', finger: 'ring' }, 'x': { hand: 'left', finger: 'ring' },
    'e': { hand: 'left', finger: 'middle' }, 'd': { hand: 'left', finger: 'middle' }, 'c': { hand: 'left', finger: 'middle' },
    'r': { hand: 'left', finger: 'index' }, 'f': { hand: 'left', finger: 'index' }, 'v': { hand: 'left', finger: 'index' },
    't': { hand: 'left', finger: 'index' }, 'g': { hand: 'left', finger: 'index' }, 'b': { hand: 'left', finger: 'index' },
    'y': { hand: 'right', finger: 'index' }, 'h': { hand: 'right', finger: 'index' }, 'n': { hand: 'right', finger: 'index' },
    'u': { hand: 'right', finger: 'index' }, 'j': { hand: 'right', finger: 'index' }, 'm': { hand: 'right', finger: 'index' },
    'i': { hand: 'right', finger: 'middle' }, 'k': { hand: 'right', finger: 'middle' },
    'o': { hand: 'right', finger: 'ring' }, 'l': { hand: 'right', finger: 'ring' },
    'p': { hand: 'right', finger: 'pinky' },
    ' ': { hand: 'left', finger: 'thumb' }, // or right thumb
};


const VirtualKeyboard = ({ highlightKey }: { highlightKey: string }) => (
    <div className="p-4 bg-background rounded-lg shadow-inner space-y-2">
        {Object.values(keyboardLayout).map((row, rowIndex) => (
            <div key={rowIndex} className="flex justify-center gap-1.5">
                {row.map(key => (
                    <div
                        key={key}
                        className={cn(
                            "flex items-center justify-center h-12 rounded-md bg-secondary border border-b-4",
                            key === ' ' ? 'w-64' : 'w-12',
                            highlightKey.toLowerCase() === key.toLowerCase() && 'bg-primary/20 border-primary text-primary'
                        )}
                    >
                        {key === ' ' ? 'Space' : key.toUpperCase()}
                    </div>
                ))}
            </div>
        ))}
    </div>
);

const HandGuide = ({ highlightKey }: { highlightKey: string }) => {
    const fingerInfo = keyToFingerMap[highlightKey.toLowerCase()];

    const getFingerHighlightStyle = (hand: 'left' | 'right', finger: 'pinky' | 'ring' | 'middle' | 'index' | 'thumb'): React.CSSProperties => {
        if (fingerInfo && fingerInfo.hand === hand && fingerInfo.finger === finger) {
            return { filter: 'drop-shadow(0 0 12px hsl(var(--primary)))', transform: 'scale(1.1)' };
        }
        return {};
    };

    return (
        <div className="flex justify-center items-end gap-8 h-48">
             <div className="relative">
                <Image src="https://picsum.photos/200/150" width={200} height={150} alt="Left Hand" data-ai-hint="left hand" className="transform -scale-x-100" />
                <div className="absolute top-0 left-0 w-full h-full">
                    {/* Pinky */}
                    <div style={getFingerHighlightStyle('left', 'pinky')} className="absolute top-[35px] left-[25px] w-5 h-5 bg-primary/50 rounded-full transition-all"></div>
                    {/* Ring */}
                    <div style={getFingerHighlightStyle('left', 'ring')} className="absolute top-[15px] left-[55px] w-5 h-5 bg-primary/50 rounded-full transition-all"></div>
                    {/* Middle */}
                    <div style={getFingerHighlightStyle('left', 'middle')} className="absolute top-[5px] left-[85px] w-5 h-5 bg-primary/50 rounded-full transition-all"></div>
                    {/* Index */}
                    <div style={getFingerHighlightStyle('left', 'index')} className="absolute top-[15px] left-[115px] w-5 h-5 bg-primary/50 rounded-full transition-all"></div>
                    {/* Thumb */}
                    <div style={getFingerHighlightStyle('left', 'thumb')} className="absolute top-[80px] left-[140px] w-6 h-6 bg-primary/50 rounded-full transition-all"></div>
                </div>
            </div>
            <div className="relative">
                <Image src="https://picsum.photos/200/150" width={200} height={150} alt="Right Hand" data-ai-hint="right hand" />
                 <div className="absolute top-0 left-0 w-full h-full">
                    {/* Index */}
                    <div style={getFingerHighlightStyle('right', 'index')} className="absolute top-[15px] left-[30px] w-5 h-5 bg-primary/50 rounded-full transition-all"></div>
                    {/* Middle */}
                    <div style={getFingerHighlightStyle('right', 'middle')} className="absolute top-[5px] left-[60px] w-5 h-5 bg-primary/50 rounded-full transition-all"></div>
                    {/* Ring */}
                    <div style={getFingerHighlightStyle('right', 'ring')} className="absolute top-[15px] left-[90px] w-5 h-5 bg-primary/50 rounded-full transition-all"></div>
                    {/* Pinky */}
                    <div style={getFingerHighlightStyle('right', 'pinky')} className="absolute top-[35px] left-[118px] w-5 h-5 bg-primary/50 rounded-full transition-all"></div>
                     {/* Thumb */}
                    <div style={getFingerHighlightStyle('right', 'thumb')} className="absolute top-[80px] left-[5px] w-6 h-6 bg-primary/50 rounded-full transition-all"></div>
                </div>
            </div>
        </div>
    );
};


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
        const targetWord = words[index];
        if (targetWord && typedWord.normalize('NFC') !== targetWord.normalize('NFC')) return errorCount + 1;
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
          "text-2xl font-mono p-2 flex items-center justify-center min-h-[3rem]",
          isError ? "text-red-500" : "text-green-500"
        )}>
          <span>
           {currentWord.split('').map((char, index) => {
              let charClass = "opacity-50";
              if(index < currentInput.length) {
                charClass = currentInput[index] === char ? "opacity-100" : "opacity-100 text-red-500";
              }
              return <span key={index} className={charClass}>{char}</span>
           })}
           </span>
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
export { VisualTypingDrill };
