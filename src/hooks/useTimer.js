import { useState, useEffect, useRef, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage.js";

const DEFAULT_DURATIONS = { WORK: 25, SHORT_BREAK: 5, LONG_BREAK: 15 };

const MODE_META = {
  WORK: { label: "WORK", color: "#ff6b35" },
  SHORT_BREAK: { label: "SHORT BREAK", color: "#00ff41" },
  LONG_BREAK: { label: "LONG BREAK", color: "#00d4ff" },
};

export function useTimer({ focusedTaskId, onTimerComplete }) {
  const [durations, setDurations] = useLocalStorage(
    "pixelpomo-durations",
    DEFAULT_DURATIONS
  );
  const [sessionsCompleted, setSessionsCompleted] = useLocalStorage(
    "pixelpomo-sessionsCompleted",
    0
  );
  const [sessionHistory, setSessionHistory] = useLocalStorage(
    "pixelpomo-sessions",
    []
  );

  const [timerMode, setTimerMode] = useState("WORK");
  const [timeLeft, setTimeLeft] = useState(
    () => (durations.WORK || DEFAULT_DURATIONS.WORK) * 60
  );
  const [isRunning, setIsRunning] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [nextMode, setNextMode] = useState(null);
  const timerRef = useRef(null);

  const TIMER_MODES = {
    WORK: { ...MODE_META.WORK, duration: durations.WORK * 60 },
    SHORT_BREAK: { ...MODE_META.SHORT_BREAK, duration: durations.SHORT_BREAK * 60 },
    LONG_BREAK: { ...MODE_META.LONG_BREAK, duration: durations.LONG_BREAK * 60 },
  };

  const formatTime = useCallback((seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, []);

  const getTimerProgress = useCallback(() => {
    const total = TIMER_MODES[timerMode].duration;
    return ((total - timeLeft) / total) * 100;
  }, [timeLeft, timerMode, TIMER_MODES]);

  const determineNextMode = useCallback(() => {
    if (timerMode === "WORK") {
      const next = sessionsCompleted + 1;
      return next % 4 === 0 ? "LONG_BREAK" : "SHORT_BREAK";
    }
    return "WORK";
  }, [timerMode, sessionsCompleted]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (timerMode === "WORK") {
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      const today = new Date().toISOString().split("T")[0];
      setSessionHistory((prev) => [
        ...prev,
        { date: today, timestamp: Date.now(), duration: durations.WORK },
      ]);

      if (focusedTaskId !== null && onTimerComplete) {
        onTimerComplete("work_with_focus");
        return;
      }
    }

    const next = determineNextMode();
    setNextMode(next);
    setShowTransition(true);
    if (onTimerComplete) onTimerComplete("normal");
  }, [
    timerMode,
    sessionsCompleted,
    determineNextMode,
    focusedTaskId,
    onTimerComplete,
    durations.WORK,
    setSessionsCompleted,
    setSessionHistory,
  ]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            setTimeout(() => handleTimerComplete(), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, handleTimerComplete]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(TIMER_MODES[timerMode].duration);
  };

  const switchMode = (mode) => {
    setIsRunning(false);
    setTimerMode(mode);
    setTimeLeft(TIMER_MODES[mode].duration);
    setShowTransition(false);
  };

  const acceptTransition = () => {
    setTimerMode(nextMode);
    setTimeLeft(TIMER_MODES[nextMode].duration);
    setShowTransition(false);
    setNextMode(null);
    setIsRunning(true);
  };

  const dismissTransition = () => {
    setTimerMode(nextMode);
    setTimeLeft(TIMER_MODES[nextMode].duration);
    setShowTransition(false);
    setNextMode(null);
  };

  const adjustDuration = (mode, delta) => {
    if (isRunning) return;
    setDurations((prev) => {
      const newVal = Math.max(1, Math.min(99, prev[mode] + delta));
      const updated = { ...prev, [mode]: newVal };
      if (mode === timerMode) {
        setTimeLeft(newVal * 60);
      }
      return updated;
    });
  };

  // Stats helpers
  const getToday = () => new Date().toISOString().split("T")[0];
  const todaySessions = sessionHistory.filter((s) => s.date === getToday());
  const todayCount = todaySessions.length;
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const totalSessions = sessionHistory.length;
  const totalMinutes = sessionHistory.reduce((sum, s) => sum + s.duration, 0);

  const getStreak = () => {
    if (sessionHistory.length === 0) return 0;
    const uniqueDays = [...new Set(sessionHistory.map((s) => s.date))]
      .sort()
      .reverse();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      if (uniqueDays.includes(ds)) {
        streak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }
    return streak;
  };

  const getLast7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const dayLabel = d
        .toLocaleDateString("en", { weekday: "short" })
        .toUpperCase()
        .slice(0, 3);
      const count = sessionHistory.filter((s) => s.date === ds).length;
      days.push({ date: ds, label: dayLabel, count });
    }
    return days;
  };

  return {
    // Timer state
    timerMode,
    timeLeft,
    isRunning,
    sessionsCompleted,
    showTransition,
    nextMode,
    durations,
    TIMER_MODES,

    // Timer actions
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
    acceptTransition,
    dismissTransition,
    adjustDuration,
    formatTime,
    getTimerProgress,
    determineNextMode,

    // Stats
    sessionHistory,
    todayCount,
    todayMinutes,
    totalSessions,
    totalMinutes,
    getStreak,
    getLast7Days,
    getToday: () => new Date().toISOString().split("T")[0],
  };
}
