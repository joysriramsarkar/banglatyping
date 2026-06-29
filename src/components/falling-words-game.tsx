
"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Home, RefreshCw, Pause, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useFallingWordsGame } from '@/hooks/use-falling-words-game';

const Word = ({ word, onComplete, speed, isPaused }: { word: string, onComplete: (w: string) => void, speed: number, isPaused: boolean }) => {
  const duration = Math.max(3, 16 - speed); // As speed increases, duration decreases
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  if (!isClient) return null; // Avoid hydration mismatch

  // Color based on word length
  const getWordColor = (wordLength: number) => {
    if (wordLength <= 3) return "text-green-600";
    if (wordLength <= 6) return "text-blue-600";
    if (wordLength <= 10) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <motion.div
      initial={{ y: -50, x: Math.random() * (windowSize.width > 400 ? windowSize.width - 200 : 300) }}
      animate={{ y: isPaused ? -50 : windowSize.height - 150 }}
      transition={{ duration: isPaused ? 0 : duration, ease: "linear" }}
      onAnimationComplete={() => !isPaused && onComplete(word)}
      className={cn(
        "absolute px-4 py-2 bg-card border rounded-full text-lg font-mono shadow-lg",
        getWordColor(word.length)
      )}
    >
      {word}
    </motion.div>
  );
};


export default function FallingWordsGame() {
    const router = useRouter();
    const {
        activeWords,
        inputValue,
        score,
        lives,
        gameOver,
        level,
        totalWordsTyped,
        isPaused,
        startGame,
        pauseGame,
        resumeGame,
        handleWordMiss,
        handleInputChange
    } = useFallingWordsGame();

    if (gameOver) {
        return (
            <Card className="text-center p-8 max-w-md mx-auto">
                <h2 className="text-3xl font-bold text-destructive">গেম ওভার!</h2>
                <p className="text-xl mt-2">আপনার স্কোর: {score}</p>
                <div className="flex flex-col sm:flex-row gap-2 mt-6">
                    <Button onClick={startGame} className="w-full">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        আবার খেলুন
                    </Button>
                    <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full">
                        <Home className="mr-2 h-4 w-4" />
                        হোমে ফিরে যান
                    </Button>
                </div>
            </Card>
        );
    }
    
    return (
        <div className={cn("relative w-full h-[70vh] rounded-lg overflow-hidden border transition-colors duration-500", lives <= 2 ? "bg-red-50" : "bg-secondary/30")}>
            <AnimatePresence>
                {activeWords.map((word) => (
                    <Word key={word} word={word.replace(/[0-9.]/g, '')} onComplete={handleWordMiss} speed={level} isPaused={isPaused} />
                ))}
            </AnimatePresence>

            <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md z-10">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-x-4 gap-y-1">
                        <p>স্কোর: <span className="font-bold">{score}</span></p>
                        <p>লাইফ: <span className="font-bold">{'❤️'.repeat(lives)}</span></p>
                        <p>লেভেল: <span className="font-bold">{level}</span></p>
                        <p>শব্দ: <span className="font-bold">{totalWordsTyped}</span></p>
                        <Button 
                            onClick={isPaused ? resumeGame : pauseGame} 
                            size="sm" 
                            variant="outline"
                            className="h-8 px-2"
                        >
                            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                        </Button>
                    </div>
                    <Input
                        type="text"
                        placeholder="শব্দ টাইপ করুন..."
                        value={inputValue}
                        onChange={handleInputChange}
                        className="w-36 sm:w-48 font-mono"
                        autoFocus
                    />
                </CardContent>
            </Card>
        </div>
    );
}
