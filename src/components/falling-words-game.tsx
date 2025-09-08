
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Home, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

const words = ["বাংলা", "ভাষা", "জয়", "পতাকা", "নদী", "ফুল", "ফল", "মাছ", "গান", "কবিতা", "স্বাধীনতা"];

const Word = ({ word, onComplete }: { word: string, onComplete: (w: string) => void }) => {
  const duration = Math.random() * 8 + 8; // Increased duration for slower fall

  return (
    <motion.div
      initial={{ y: -50, x: Math.random() * (window.innerWidth > 400 ? window.innerWidth - 200 : window.innerWidth - 100) }}
      animate={{ y: window.innerHeight - 150 }}
      transition={{ duration, ease: "linear" }}
      onAnimationComplete={() => onComplete(word)}
      className="absolute px-4 py-2 bg-card border rounded-full text-lg font-mono shadow-lg"
    >
      {word}
    </motion.div>
  );
};


export default function FallingWordsGame() {
    const [activeWords, setActiveWords] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(5);
    const [gameOver, setGameOver] = useState(false);
    const gameInterval = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();


    const startGame = useCallback(() => {
        setActiveWords([]);
        setScore(0);
        setLives(5);
        setGameOver(false);
        setInputValue('');

        if (gameInterval.current) clearInterval(gameInterval.current);
        gameInterval.current = setInterval(() => {
            setActiveWords(prev => {
                if(prev.length < 10) {
                    const newWord = words[Math.floor(Math.random() * words.length)];
                    return [...prev, newWord + Math.random()]; // Add random number to make key unique
                }
                return prev;
            });
        }, 2500); // Increased interval for new words
    }, []);

    const handleWordMiss = useCallback((word: string) => {
        setActiveWords(prev => prev.filter(w => w !== word));
        if(!gameOver) {
            setLives(prev => {
                const newLives = prev - 1;
                if (newLives <= 0) {
                    setGameOver(true);
                    if(gameInterval.current) clearInterval(gameInterval.current);
                }
                return newLives;
            });
        }
    }, [gameOver]);

    useEffect(() => {
        startGame();
        return () => {
            if (gameInterval.current) clearInterval(gameInterval.current);
        };
    }, [startGame]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const typedValue = e.target.value;
        if (typedValue.endsWith(' ')) {
            const typedWord = typedValue.trim();
            const matchedWord = activeWords.find(aw => aw.startsWith(typedWord));

            if (matchedWord) {
                setScore(prev => prev + typedWord.length);
                setActiveWords(prev => prev.filter(aw => aw !== matchedWord));
            }
            setInputValue('');
        } else {
            setInputValue(typedValue);
        }
    };
    
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
        <div className="relative w-full h-[70vh] bg-secondary/30 rounded-lg overflow-hidden border">
            <AnimatePresence>
                {activeWords.map((word) => (
                    <Word key={word} word={word.replace(/[0-9.]/g, '')} onComplete={handleWordMiss} />
                ))}
            </AnimatePresence>

            <Card className="absolute bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md">
                <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex flex-col sm:flex-row gap-x-4 gap-y-1">
                        <p>স্কোর: <span className="font-bold">{score}</span></p>
                        <p>লাইফ: <span className="font-bold">{'❤️'.repeat(lives)}</span></p>
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
