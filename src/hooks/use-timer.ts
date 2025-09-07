
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (initialTime = 0) => {
  const [time, setTime] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const countRef = useRef<NodeJS.Timeout | null>(null);

  const handleStart = useCallback(() => {
    setIsActive(true);
    setIsPaused(false);
    countRef.current = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);
  }, []);

  const handlePause = () => {
    if (countRef.current) {
      clearInterval(countRef.current);
    }
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
    countRef.current = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);
  };

  const handleReset = () => {
    if (countRef.current) {
      clearInterval(countRef.current);
    }
    setIsActive(false);
    setIsPaused(false);
    setTime(0);
  };

  useEffect(() => {
    return () => {
      if (countRef.current) {
        clearInterval(countRef.current);
      }
    };
  }, []);

  return {
    time,
    isActive,
    isPaused,
    start: handleStart,
    pause: handlePause,
    resume: handleResume,
    reset: handleReset,
  };
};
