import { useState, useEffect } from 'react';

interface UseExerciseTimerReturn {
  timeLeft: number;
  isPlaying: boolean;
  setTimeLeft: (t: number) => void;
  setIsPlaying: (p: boolean) => void;
  toggleTimer: () => void;
  formatTime: (seconds: number) => string;
}

export const useExerciseTimer = (): UseExerciseTimerReturn => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, timeLeft]);

  const toggleTimer = () => setIsPlaying((prev) => !prev);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return { timeLeft, isPlaying, setTimeLeft, setIsPlaying, toggleTimer, formatTime };
};
