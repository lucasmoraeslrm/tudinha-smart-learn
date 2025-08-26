import { useState, useEffect, useRef } from 'react';

export interface TimerData {
  sessionTime: number;
  questionTime: number;
  isRunning: boolean;
}

export const useExerciseTimer = () => {
  const [sessionTime, setSessionTime] = useState(0);
  const [questionTime, setQuestionTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<Date | null>(null);

  useEffect(() => {
    if (isRunning) {
      // Start session timer
      if (!sessionTimerRef.current) {
        sessionTimerRef.current = setInterval(() => {
          setSessionTime(prev => prev + 1);
        }, 1000);
      }

      // Start question timer
      if (!questionTimerRef.current) {
        questionTimerRef.current = setInterval(() => {
          setQuestionTime(prev => prev + 1);
        }, 1000);
      }
    } else {
      // Clear timers when not running
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
        questionTimerRef.current = null;
      }
    }

    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [isRunning]);

  const startTimer = () => {
    setIsRunning(true);
    questionStartTimeRef.current = new Date();
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetQuestionTimer = () => {
    setQuestionTime(0);
    questionStartTimeRef.current = new Date();
  };

  const resetSessionTimer = () => {
    setSessionTime(0);
    setQuestionTime(0);
  };

  const getQuestionTimeInSeconds = (): number => {
    if (questionStartTimeRef.current) {
      return Math.floor((new Date().getTime() - questionStartTimeRef.current.getTime()) / 1000);
    }
    return questionTime;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    sessionTime,
    questionTime,
    isRunning,
    startTimer,
    pauseTimer,
    resetQuestionTimer,
    resetSessionTimer,
    getQuestionTimeInSeconds,
    formatTime
  };
};