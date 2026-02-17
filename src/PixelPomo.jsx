import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
// PIXEL POMO v2.0 - Retro Pomodoro Timer & Quest Board
// ============================================================

const DEFAULT_DURATIONS = {
  WORK: 25,
  SHORT_BREAK: 5,
  LONG_BREAK: 15,
};

const MODE_META = {
  WORK: { label: "WORK", color: "#ff6b35" },
  SHORT_BREAK: { label: "SHORT BREAK", color: "#00ff41" },
  LONG_BREAK: { label: "LONG BREAK", color: "#00d4ff" },
};

const VIEWS = ["PLAY", "STATS"];

// ============================================================
// SOUND ENGINE - Retro 8-bit sounds via Web Audio API
// ============================================================
function createAudioContext() {
  try {
    return new (window.AudioContext || window.webkitAudioContext)();
  } catch {
    return null;
  }
}

function playClickSound(audioCtx) {
  if (!audioCtx) return;
  try {
    if (audioCtx.state === "suspended") audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.05);
  } catch {}
}

function playTimerCompleteSound(audioCtx) {
  if (!audioCtx) return;
  try {
    if (audioCtx.state === "suspended") audioCtx.resume();
    const notes = [523, 659, 784, 1047, 784, 1047];
    const noteLen = 0.12;
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "square";
      const startTime = audioCtx.currentTime + i * noteLen;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteLen - 0.01);
      osc.start(startTime);
      osc.stop(startTime + noteLen);
    });
  } catch {}
}

function playStartSound(audioCtx) {
  if (!audioCtx) return;
  try {
    if (audioCtx.state === "suspended") audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.15);
  } catch {}
}

function playDeleteSound(audioCtx) {
  if (!audioCtx) return;
  try {
    if (audioCtx.state === "suspended") audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.15);
  } catch {}
}

function playCelebrationSound(audioCtx) {
  if (!audioCtx) return;
  try {
    if (audioCtx.state === "suspended") audioCtx.resume();
    const notes = [523, 659, 784, 1047, 1319, 1568];
    const noteLen = 0.1;
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "square";
      const startTime = audioCtx.currentTime + i * noteLen;
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteLen - 0.01);
      osc.start(startTime);
      osc.stop(startTime + noteLen);
    });
  } catch {}
}

// ============================================================
// CSS STYLES
// ============================================================
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

  * { box-sizing: border-box; }

  body {
    margin: 0;
    padding: 0;
    background: #0f0f23;
    font-family: 'Press Start 2P', monospace;
    color: #e0e0e0;
    overflow-x: hidden;
  }

  /* Scanline overlay */
  .scanlines::after {
    content: '';
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.08) 2px,
      rgba(0,0,0,0.08) 4px
    );
    pointer-events: none;
    z-index: 9999;
  }

  /* CRT flicker animation */
  @keyframes crtFlicker {
    0% { opacity: 0.97; }
    5% { opacity: 1; }
    10% { opacity: 0.98; }
    15% { opacity: 1; }
    50% { opacity: 1; }
    55% { opacity: 0.96; }
    60% { opacity: 1; }
    100% { opacity: 1; }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  @keyframes slideIn {
    from { transform: translateY(-10px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 5px currentColor, 0 0 10px currentColor; }
    50% { box-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor; }
  }

  @keyframes barGrow {
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
  }

  @keyframes textGlow {
    0%, 100% { text-shadow: 0 0 5px currentColor; }
    50% { text-shadow: 0 0 10px currentColor, 0 0 20px currentColor; }
  }

  @keyframes xpFloat {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-30px) scale(1.1); opacity: 0; }
  }

  @keyframes questComplete {
    0% { background: rgba(0,255,65,0.3); }
    100% { background: transparent; }
  }

  @keyframes focusGlow {
    0%, 100% { box-shadow: 0 0 5px rgba(255,0,255,0.3), inset 0 0 5px rgba(255,0,255,0.1); }
    50% { box-shadow: 0 0 12px rgba(255,0,255,0.6), inset 0 0 10px rgba(255,0,255,0.2); }
  }

  .crt-effect {
    animation: crtFlicker 4s infinite;
  }

  .pixel-border {
    box-shadow:
      -4px 0 0 0 currentColor,
      4px 0 0 0 currentColor,
      0 -4px 0 0 currentColor,
      0 4px 0 0 currentColor;
  }

  .pixel-border-thick {
    box-shadow:
      -4px 0 0 0 currentColor,
      4px 0 0 0 currentColor,
      0 -4px 0 0 currentColor,
      0 4px 0 0 currentColor,
      -4px -4px 0 0 currentColor,
      4px -4px 0 0 currentColor,
      -4px 4px 0 0 currentColor,
      4px 4px 0 0 currentColor;
  }

  .retro-btn {
    font-family: 'Press Start 2P', monospace;
    border: none;
    padding: 10px 16px;
    font-size: 10px;
    cursor: pointer;
    position: relative;
    transition: all 0.1s;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #0f0f23;
    image-rendering: pixelated;
  }

  .retro-btn:hover {
    transform: translate(-2px, -2px);
    filter: brightness(1.2);
  }

  .retro-btn:active {
    transform: translate(1px, 1px);
    filter: brightness(0.9);
  }

  .retro-btn::after {
    content: '';
    position: absolute;
    bottom: -3px;
    right: -3px;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.4);
    z-index: -1;
  }

  .retro-btn:active::after {
    bottom: -1px;
    right: -1px;
  }

  .retro-input {
    font-family: 'Press Start 2P', monospace;
    background: #1a1a2e;
    border: 3px solid #333366;
    color: #00ff41;
    padding: 10px 12px;
    font-size: 10px;
    outline: none;
    transition: border-color 0.2s;
  }

  .retro-input:focus {
    border-color: #00ff41;
    box-shadow: 0 0 8px rgba(0,255,65,0.3);
  }

  .retro-input::placeholder {
    color: #555588;
  }

  /* Pixel tomato decoration */
  .pixel-tomato {
    display: inline-block;
    width: 20px;
    height: 20px;
    position: relative;
  }

  .pixel-tomato::before {
    content: '';
    position: absolute;
    width: 4px; height: 4px;
    background: #00ff41;
    box-shadow:
      4px 0 0 #00ff41,
      0px 4px 0 #ff3333,
      4px 4px 0 #ff3333,
      8px 4px 0 #ff3333,
      -4px 8px 0 #ff3333,
      0px 8px 0 #ff3333,
      4px 8px 0 #ff5555,
      8px 8px 0 #ff3333,
      12px 8px 0 #ff3333,
      -4px 12px 0 #ff3333,
      0px 12px 0 #ff3333,
      4px 12px 0 #ff3333,
      8px 12px 0 #ff3333,
      12px 12px 0 #ff3333,
      0px 16px 0 #ff3333,
      4px 16px 0 #ff3333,
      8px 16px 0 #ff3333;
    top: 0; left: 4px;
  }

  /* Scrollbar styling */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #1a1a2e; }
  ::-webkit-scrollbar-thumb { background: #333366; border: 2px solid #1a1a2e; }
  ::-webkit-scrollbar-thumb:hover { background: #555588; }

  /* Task card drag */
  .task-card {
    transition: all 0.15s ease;
  }
  .task-card:hover {
    transform: translateX(3px);
  }
  .task-card.dragging {
    opacity: 0.5;
    transform: scale(0.95);
  }

  .column-drop-target {
    border: 2px dashed #00d4ff !important;
    background: rgba(0,212,255,0.05) !important;
  }

  /* Responsive play layout */
  @media (max-width: 768px) {
    .play-layout {
      grid-template-columns: 1fr !important;
    }
  }
`;

// ============================================================
// MAIN COMPONENT
// ============================================================
export default function PixelPomo() {
  // Audio
  const audioCtxRef = useRef(null);

  // Navigation
  const [activeView, setActiveView] = useState("PLAY");

  // Timer durations (editable)
  const [durations, setDurations] = useState({ ...DEFAULT_DURATIONS });

  // Computed TIMER_MODES from editable durations
  const TIMER_MODES = {
    WORK: { ...MODE_META.WORK, duration: durations.WORK * 60 },
    SHORT_BREAK: { ...MODE_META.SHORT_BREAK, duration: durations.SHORT_BREAK * 60 },
    LONG_BREAK: { ...MODE_META.LONG_BREAK, duration: durations.LONG_BREAK * 60 },
  };

  // Timer state
  const [timerMode, setTimerMode] = useState("WORK");
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATIONS.WORK * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [nextMode, setNextMode] = useState(null);
  const timerRef = useRef(null);

  // New UX states
  const [showFocusPrompt, setShowFocusPrompt] = useState(false);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  const [showFullBoard, setShowFullBoard] = useState(false);

  // Task state
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: [],
  });
  const [newTaskText, setNewTaskText] = useState("");
  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const nextTaskId = useRef(1);

  // Stats / History
  const [sessionHistory, setSessionHistory] = useState([]);

  // Initialize audio context on first interaction
  const ensureAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = createAudioContext();
    }
  }, []);

  // Duration adjustment (only when timer not running)
  const adjustDuration = (mode, delta) => {
    if (isRunning) return;
    ensureAudio();
    playClickSound(audioCtxRef.current);
    setDurations((prev) => {
      const newVal = Math.max(1, Math.min(99, prev[mode] + delta));
      const updated = { ...prev, [mode]: newVal };
      // If adjusting the current mode, update timeLeft too
      if (mode === timerMode) {
        setTimeLeft(newVal * 60);
      }
      return updated;
    });
  };

  // --------------------------------------------------------
  // TIMER LOGIC
  // --------------------------------------------------------
  const formatTime = useCallback((seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, []);

  const getTimerProgress = useCallback(() => {
    const total = TIMER_MODES[timerMode].duration;
    return ((total - timeLeft) / total) * 100;
  }, [timeLeft, timerMode]);

  const determineNextMode = useCallback(() => {
    if (timerMode === "WORK") {
      const nextSessions = sessionsCompleted + 1;
      return nextSessions % 4 === 0 ? "LONG_BREAK" : "SHORT_BREAK";
    }
    return "WORK";
  }, [timerMode, sessionsCompleted]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    playTimerCompleteSound(audioCtxRef.current);

    if (timerMode === "WORK") {
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);
      const today = new Date().toISOString().split("T")[0];
      setSessionHistory((prev) => [
        ...prev,
        { date: today, timestamp: Date.now(), duration: durations.WORK },
      ]);

      // If there's a focused task, show completion overlay instead of transition
      if (focusedTaskId !== null) {
        setShowCompletionOverlay(true);
        return; // Don't show transition yet
      }
    }

    const next = determineNextMode();
    setNextMode(next);
    setShowTransition(true);
  }, [timerMode, sessionsCompleted, determineNextMode, focusedTaskId]);

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

  const startTimer = () => {
    ensureAudio();
    // Focus prompt: if WORK mode, tasks exist but no focused task
    if (timerMode === "WORK") {
      const availableTasks = tasks.todo.length + tasks.inProgress.length;
      if (availableTasks > 0 && focusedTaskId === null) {
        setShowFocusPrompt(true);
        return;
      }
    }
    playStartSound(audioCtxRef.current);
    setIsRunning(true);
  };

  const startTimerForced = () => {
    ensureAudio();
    playStartSound(audioCtxRef.current);
    setShowFocusPrompt(false);
    setIsRunning(true);
  };

  const pauseTimer = () => {
    ensureAudio();
    playClickSound(audioCtxRef.current);
    setIsRunning(false);
  };

  const resetTimer = () => {
    ensureAudio();
    playClickSound(audioCtxRef.current);
    setIsRunning(false);
    setTimeLeft(TIMER_MODES[timerMode].duration);
  };

  const switchMode = (mode) => {
    ensureAudio();
    playClickSound(audioCtxRef.current);
    setIsRunning(false);
    setTimerMode(mode);
    setTimeLeft(TIMER_MODES[mode].duration);
    setShowTransition(false);
  };

  const acceptTransition = () => {
    ensureAudio();
    playStartSound(audioCtxRef.current);
    setTimerMode(nextMode);
    setTimeLeft(TIMER_MODES[nextMode].duration);
    setShowTransition(false);
    setNextMode(null);
    setIsRunning(true);
  };

  const dismissTransition = () => {
    ensureAudio();
    playClickSound(audioCtxRef.current);
    setTimerMode(nextMode);
    setTimeLeft(TIMER_MODES[nextMode].duration);
    setShowTransition(false);
    setNextMode(null);
  };

  // Completion overlay handlers
  const handleCompletionYes = () => {
    ensureAudio();
    playCelebrationSound(audioCtxRef.current);
    // Move focused task to done
    setTasks((prev) => {
      let task = null;
      let fromCol = null;
      for (const col of ["todo", "inProgress", "done"]) {
        const found = prev[col].find((t) => t.id === focusedTaskId);
        if (found) {
          task = found;
          fromCol = col;
          break;
        }
      }
      if (!task || fromCol === "done") return prev;
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter((t) => t.id !== focusedTaskId),
        done: [...prev.done, task],
      };
    });
    setFocusedTaskId(null);
    setShowCompletionOverlay(false);
    // Now show transition
    const next = determineNextMode();
    setNextMode(next);
    setShowTransition(true);
  };

  const handleCompletionNo = () => {
    ensureAudio();
    playClickSound(audioCtxRef.current);
    setShowCompletionOverlay(false);
    // Show transition
    const next = determineNextMode();
    setNextMode(next);
    setShowTransition(true);
  };

  // --------------------------------------------------------
  // TASK LOGIC
  // --------------------------------------------------------
  const addTask = () => {
    if (!newTaskText.trim()) return;
    ensureAudio();
    playClickSound(audioCtxRef.current);
    const id = nextTaskId.current++;
    const shouldAutoFocus = focusedTaskId === null;
    setTasks((prev) => ({
      ...prev,
      todo: [...prev.todo, { id, text: newTaskText.trim(), createdAt: Date.now() }],
    }));
    if (shouldAutoFocus) {
      setFocusedTaskId(id);
    }
    setNewTaskText("");
  };

  const deleteTask = (column, taskId) => {
    ensureAudio();
    playDeleteSound(audioCtxRef.current);
    if (focusedTaskId === taskId) setFocusedTaskId(null);
    setTasks((prev) => ({
      ...prev,
      [column]: prev[column].filter((t) => t.id !== taskId),
    }));
  };

  const moveTask = (fromCol, toCol, taskId) => {
    ensureAudio();
    playClickSound(audioCtxRef.current);
    setTasks((prev) => {
      const task = prev[fromCol].find((t) => t.id === taskId);
      if (!task) return prev;
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter((t) => t.id !== taskId),
        [toCol]: [...prev[toCol], task],
      };
    });
  };

  const quickComplete = (taskId) => {
    ensureAudio();
    playClickSound(audioCtxRef.current);
    if (focusedTaskId === taskId) setFocusedTaskId(null);
    setTasks((prev) => {
      let task = null;
      let fromCol = null;
      for (const col of ["todo", "inProgress"]) {
        const found = prev[col].find((t) => t.id === taskId);
        if (found) {
          task = found;
          fromCol = col;
          break;
        }
      }
      if (!task) return prev;
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter((t) => t.id !== taskId),
        done: [...prev.done, task],
      };
    });
  };

  const focusTask = (taskId) => {
    ensureAudio();
    playClickSound(audioCtxRef.current);
    const newFocusId = focusedTaskId === taskId ? null : taskId;
    setFocusedTaskId(newFocusId);
    // If focus prompt is showing and we selected a task, start timer
    if (showFocusPrompt && newFocusId !== null) {
      setShowFocusPrompt(false);
      playStartSound(audioCtxRef.current);
      setIsRunning(true);
    }
  };

  // Drag and drop
  const handleDragStart = (column, taskId) => {
    setDraggedTask({ column, taskId });
  };

  const handleDragOver = (e, column) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, toCol) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (draggedTask && draggedTask.column !== toCol) {
      moveTask(draggedTask.column, toCol, draggedTask.taskId);
    }
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // --------------------------------------------------------
  // STATS LOGIC
  // --------------------------------------------------------
  const getToday = () => new Date().toISOString().split("T")[0];

  const todaySessions = sessionHistory.filter((s) => s.date === getToday());
  const todayCount = todaySessions.length;
  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const totalSessions = sessionHistory.length;
  const totalMinutes = sessionHistory.reduce((sum, s) => sum + s.duration, 0);

  const getStreak = () => {
    if (sessionHistory.length === 0) return 0;
    const uniqueDays = [...new Set(sessionHistory.map((s) => s.date))].sort().reverse();
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
      const dayLabel = d.toLocaleDateString("en", { weekday: "short" }).toUpperCase().slice(0, 3);
      const count = sessionHistory.filter((s) => s.date === ds).length;
      days.push({ date: ds, label: dayLabel, count });
    }
    return days;
  };

  // --------------------------------------------------------
  // GET FOCUSED TASK
  // --------------------------------------------------------
  const getFocusedTask = () => {
    for (const col of ["todo", "inProgress", "done"]) {
      const t = tasks[col].find((t) => t.id === focusedTaskId);
      if (t) return t;
    }
    return null;
  };

  // --------------------------------------------------------
  // COMPUTED VALUES
  // --------------------------------------------------------
  const modeColor = TIMER_MODES[timerMode].color;
  const focusedTask = getFocusedTask();
  const doneTotal = tasks.done.length;
  const allTotal = tasks.todo.length + tasks.inProgress.length + tasks.done.length;

  // Quest log: inProgress first, then todo
  const questLogTasks = [...tasks.inProgress.map((t) => ({ ...t, col: "inProgress" })), ...tasks.todo.map((t) => ({ ...t, col: "todo" }))];
  const doneTasks = tasks.done.map((t) => ({ ...t, col: "done" }));
  const maxDoneShown = 3;

  // --------------------------------------------------------
  // RENDER
  // --------------------------------------------------------
  return (
    <>
      <style>{globalStyles}</style>
      <div className="scanlines crt-effect" style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
        fontFamily: "'Press Start 2P', monospace",
        padding: "0",
      }}>

        {/* ====== HEADER ====== */}
        <header style={{
          background: "linear-gradient(90deg, #1a1a2e, #16213e, #1a1a2e)",
          borderBottom: "3px solid #333366",
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Pixel tomato */}
            <div style={{
              width: "24px",
              height: "28px",
              position: "relative",
              flexShrink: 0,
            }}>
              <div style={{
                position: "absolute",
                width: "4px",
                height: "4px",
                background: "#00ff41",
                boxShadow: `
                  4px 0 0 #00ff41,
                  0px 4px 0 #ff3333,
                  4px 4px 0 #ff3333,
                  8px 4px 0 #ff3333,
                  -4px 8px 0 #ff3333,
                  0px 8px 0 #ff5555,
                  4px 8px 0 #ff5555,
                  8px 8px 0 #ff3333,
                  12px 8px 0 #ff3333,
                  -4px 12px 0 #ff3333,
                  0px 12px 0 #ff3333,
                  4px 12px 0 #ff5555,
                  8px 12px 0 #ff3333,
                  12px 12px 0 #cc2222,
                  0px 16px 0 #cc2222,
                  4px 16px 0 #ff3333,
                  8px 16px 0 #cc2222
                `,
                top: 0,
                left: "6px",
              }} />
            </div>
            <h1 style={{
              fontSize: "clamp(12px, 2.5vw, 20px)",
              margin: 0,
              background: "linear-gradient(180deg, #ff6b35, #ff00ff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: "none",
              filter: "drop-shadow(0 0 8px rgba(255,107,53,0.4))",
            }}>
              PIXEL POMO
            </h1>
          </div>

          {/* Arcade-style Nav Buttons */}
          <nav style={{ display: "flex", gap: "8px" }}>
            {VIEWS.map((view) => {
              const isActive = activeView === view;
              return (
                <button
                  key={view}
                  onClick={() => { ensureAudio(); playClickSound(audioCtxRef.current); setActiveView(view); }}
                  className="retro-btn"
                  style={{
                    fontSize: "12px",
                    padding: "10px 20px",
                    background: isActive ? "#00ff41" : "#2a2a4a",
                    color: isActive ? "#0f0f23" : "#888",
                    border: `2px solid ${isActive ? "#00ff41" : "#555588"}`,
                    boxShadow: isActive ? "0 0 10px rgba(0,255,65,0.5), 0 0 20px rgba(0,255,65,0.2)" : "none",
                    letterSpacing: "2px",
                  }}
                >
                  {view === "PLAY" && (
                    <span>{"\uD83C\uDFAE"} PLAY</span>
                  )}
                  {view === "STATS" && (
                    <span>{"\u2B50"} STATS</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Session counter (hearts) */}
          <div style={{
            fontSize: "8px",
            color: "#00d4ff",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}>
            <span style={{ color: "#ff6b35" }}>
              {Array.from({ length: 4 }, (_, i) => (
                <span key={i} style={{
                  color: i < (sessionsCompleted % 4) ? "#ff6b35" : "#333366",
                  marginRight: "2px",
                }}>{"\u2665"}</span>
              ))}
            </span>
            <span>{sessionsCompleted} DONE</span>
          </div>
        </header>

        {/* ====== PERSISTENT QUICK STATS BAR ====== */}
        <div style={{
          background: "#12122a",
          borderBottom: "2px solid #2a2a4a",
          padding: "10px 20px",
          display: "flex",
          justifyContent: "center",
          gap: "32px",
          flexWrap: "wrap",
        }}>
          {[
            { icon: "\uD83C\uDFAF", label: "TODAY", value: String(todayCount), color: "#00d4ff" },
            { icon: "\u23F1", label: "FOCUS", value: `${todayMinutes}m`, color: "#00ff41" },
            { icon: "\uD83D\uDD25", label: "STREAK", value: `${getStreak()}d`, color: "#ff6b35" },
            { icon: "\u2694", label: "TASKS", value: `${doneTotal}/${allTotal}`, color: "#ff00ff" },
          ].map((stat, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "8px",
            }}>
              <span style={{ fontSize: "12px" }}>{stat.icon}</span>
              <span style={{ color: "#555588" }}>{stat.label}</span>
              <span style={{ color: stat.color, fontWeight: "bold" }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* ====== MAIN CONTENT ====== */}
        <main style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>

          {/* ============ PLAY VIEW ============ */}
          {activeView === "PLAY" && (
            <div style={{ animation: "slideIn 0.3s ease" }}>
              {/* Two-column grid layout */}
              <div className="play-layout" style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}>

                {/* ===== LEFT COLUMN: Timer ===== */}
                <div>
                  {/* Mode Selector with Duration Controls */}
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "6px",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                  }}>
                    {Object.entries(TIMER_MODES).map(([key, mode]) => {
                      const isActive = timerMode === key;
                      return (
                        <div key={key} style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "4px",
                        }}>
                          <button
                            onClick={() => switchMode(key)}
                            className="retro-btn"
                            style={{
                              background: isActive ? mode.color : "#2a2a4a",
                              color: isActive ? "#0f0f23" : "#888",
                              fontSize: "8px",
                              padding: "8px 12px",
                              width: "100%",
                            }}
                          >
                            {mode.label}
                          </button>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}>
                            <button
                              onClick={() => adjustDuration(key, -5)}
                              style={{
                                background: "none",
                                border: `1px solid ${isActive ? mode.color : "#444466"}`,
                                color: isActive ? mode.color : "#555588",
                                fontFamily: "'Press Start 2P', monospace",
                                fontSize: "7px",
                                padding: "2px 5px",
                                cursor: isRunning ? "not-allowed" : "pointer",
                                opacity: isRunning ? 0.3 : 1,
                              }}
                            >
                              -
                            </button>
                            <span style={{
                              fontSize: "8px",
                              color: isActive ? mode.color : "#666",
                              minWidth: "36px",
                              textAlign: "center",
                            }}>
                              {durations[key]}m
                            </span>
                            <button
                              onClick={() => adjustDuration(key, 5)}
                              style={{
                                background: "none",
                                border: `1px solid ${isActive ? mode.color : "#444466"}`,
                                color: isActive ? mode.color : "#555588",
                                fontFamily: "'Press Start 2P', monospace",
                                fontSize: "7px",
                                padding: "2px 5px",
                                cursor: isRunning ? "not-allowed" : "pointer",
                                opacity: isRunning ? 0.3 : 1,
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Transition Prompt */}
                  {showTransition && (
                    <div style={{
                      background: "rgba(0,0,0,0.85)",
                      border: "3px solid",
                      borderColor: TIMER_MODES[nextMode].color,
                      padding: "24px",
                      marginBottom: "20px",
                      textAlign: "center",
                      animation: "slideIn 0.3s ease",
                      boxShadow: `0 0 20px ${TIMER_MODES[nextMode].color}44`,
                    }}>
                      <p style={{ fontSize: "10px", marginBottom: "8px", color: "#00ff41" }}>
                        {timerMode === "WORK" ? (
                          <span>{"\u2605"} SESSION COMPLETE! {"\u2605"}</span>
                        ) : (
                          <span>{">>"} BREAK OVER!</span>
                        )}
                      </p>
                      <p style={{ fontSize: "12px", color: TIMER_MODES[nextMode].color, marginBottom: "16px" }}>
                        READY FOR {TIMER_MODES[nextMode].label}?
                      </p>
                      <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                        <button className="retro-btn" onClick={acceptTransition}
                          style={{ background: TIMER_MODES[nextMode].color, fontSize: "10px" }}>
                          {">>"} START
                        </button>
                        <button className="retro-btn" onClick={dismissTransition}
                          style={{ background: "#555588", fontSize: "10px" }}>
                          SKIP
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Focus Prompt Overlay */}
                  {showFocusPrompt && (
                    <div style={{
                      background: "rgba(0,0,0,0.9)",
                      border: "3px solid #ff00ff",
                      padding: "24px",
                      marginBottom: "20px",
                      textAlign: "center",
                      animation: "slideIn 0.3s ease",
                      boxShadow: "0 0 20px rgba(255,0,255,0.3)",
                    }}>
                      <p style={{ fontSize: "12px", color: "#ff00ff", marginBottom: "12px", animation: "textGlow 2s infinite" }}>
                        WHAT ARE YOU WORKING ON?
                      </p>
                      <p style={{ fontSize: "8px", color: "#888", marginBottom: "16px", lineHeight: "1.8" }}>
                        SELECT A QUEST OR START WITHOUT ONE
                      </p>
                      <button className="retro-btn" onClick={startTimerForced}
                        style={{ background: "#ff6b35", fontSize: "10px", padding: "10px 20px" }}>
                        START ANYWAY {">>"}
                      </button>
                    </div>
                  )}

                  {/* CRT Timer Display */}
                  <div style={{
                    background: "#0a0a1a",
                    border: "4px solid #333366",
                    borderRadius: "8px",
                    padding: "32px 20px",
                    position: "relative",
                    boxShadow: `
                      inset 0 0 60px rgba(0,0,0,0.8),
                      0 0 20px rgba(0,0,0,0.5),
                      0 0 40px ${modeColor}22
                    `,
                    overflow: "hidden",
                    marginBottom: "20px",
                  }}>
                    {/* CRT inner glow */}
                    <div style={{
                      position: "absolute",
                      top: 0, left: 0, right: 0, bottom: 0,
                      background: `radial-gradient(ellipse at center, ${modeColor}08 0%, transparent 70%)`,
                      pointerEvents: "none",
                    }} />

                    {/* Mode label */}
                    <div style={{
                      textAlign: "center",
                      fontSize: "10px",
                      color: modeColor,
                      marginBottom: "8px",
                      letterSpacing: "4px",
                      animation: isRunning ? "textGlow 2s ease-in-out infinite" : "none",
                    }}>
                      {TIMER_MODES[timerMode].label}
                    </div>

                    {/* Current Quest Banner */}
                    {focusedTask && timerMode === "WORK" && (
                      <div style={{
                        textAlign: "center",
                        fontSize: "10px",
                        color: "#ff00ff",
                        marginBottom: "16px",
                        padding: "8px 16px",
                        background: "rgba(255,0,255,0.1)",
                        border: "2px solid rgba(255,0,255,0.3)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {"\u2694"} CURRENT QUEST {"\u2694"}
                        <div style={{
                          marginTop: "4px",
                          fontSize: "9px",
                          color: "#e0e0e0",
                        }}>
                          {focusedTask.text}
                        </div>
                      </div>
                    )}

                    {/* BIG TIME */}
                    <div style={{
                      textAlign: "center",
                      fontSize: "clamp(36px, 8vw, 56px)",
                      color: modeColor,
                      textShadow: `0 0 20px ${modeColor}, 0 0 40px ${modeColor}88`,
                      marginBottom: "16px",
                      letterSpacing: "8px",
                      fontFamily: "'Press Start 2P', monospace",
                      position: "relative",
                    }}>
                      {formatTime(timeLeft)}
                      {isRunning && (
                        <span style={{
                          position: "absolute",
                          right: "4px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: modeColor,
                          animation: "pulse 1s infinite",
                        }} />
                      )}
                    </div>

                    {/* Progress bar */}
                    <div style={{
                      width: "100%",
                      height: "8px",
                      background: "#1a1a2e",
                      border: "2px solid #333366",
                      marginBottom: "8px",
                      position: "relative",
                      overflow: "hidden",
                    }}>
                      <div style={{
                        height: "100%",
                        width: `${getTimerProgress()}%`,
                        background: `linear-gradient(90deg, ${modeColor}, ${modeColor}cc)`,
                        transition: "width 0.5s linear",
                        boxShadow: `0 0 8px ${modeColor}`,
                      }} />
                    </div>

                    {/* Session dots (hearts) */}
                    <div style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: "8px",
                      marginTop: "8px",
                    }}>
                      {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} style={{
                          width: "12px",
                          height: "12px",
                          background: i < (sessionsCompleted % 4) ? "#ff6b35" : "#2a2a4a",
                          border: `2px solid ${i < (sessionsCompleted % 4) ? "#ff6b35" : "#444466"}`,
                          boxShadow: i < (sessionsCompleted % 4) ? "0 0 6px #ff6b35" : "none",
                        }} />
                      ))}
                    </div>
                  </div>

                  {/* Controls */}
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                  }}>
                    {!isRunning ? (
                      <button className="retro-btn" onClick={startTimer}
                        style={{ background: "#00ff41", fontSize: "12px", padding: "12px 24px" }}>
                        {timeLeft === TIMER_MODES[timerMode].duration ? (
                          <span>{">>"} START</span>
                        ) : (
                          <span>{">>"} RESUME</span>
                        )}
                      </button>
                    ) : (
                      <button className="retro-btn" onClick={pauseTimer}
                        style={{ background: "#ff6b35", fontSize: "12px", padding: "12px 24px" }}>
                        {"||"} PAUSE
                      </button>
                    )}
                    <button className="retro-btn" onClick={resetTimer}
                      style={{ background: "#555588", fontSize: "12px", padding: "12px 24px" }}>
                      {"<<"} RESET
                    </button>
                  </div>
                </div>

                {/* ===== RIGHT COLUMN: Quest Log ===== */}
                <div style={{
                  background: "#12122a",
                  border: "2px solid #333366",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "400px",
                }}>
                  {/* Quest Log Header */}
                  <div style={{
                    fontSize: "12px",
                    color: "#00d4ff",
                    marginBottom: "12px",
                    paddingBottom: "8px",
                    borderBottom: "2px solid #2a2a4a",
                    letterSpacing: "2px",
                  }}>
                    {"\u2694"} QUEST LOG
                  </div>

                  {/* Current Quest Banner */}
                  {focusedTask ? (
                    <div style={{
                      border: "2px solid #ff00ff",
                      background: "rgba(255,0,255,0.08)",
                      padding: "10px 12px",
                      marginBottom: "12px",
                      animation: isRunning ? "focusGlow 2s infinite" : "none",
                    }}>
                      <div style={{ fontSize: "7px", color: "#ff00ff", marginBottom: "4px", letterSpacing: "2px" }}>
                        {"\u2694"} CURRENT QUEST
                      </div>
                      <div style={{ fontSize: "9px", color: "#e0e0e0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {focusedTask.text}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      border: "2px dashed #555588",
                      padding: "12px",
                      marginBottom: "12px",
                      textAlign: "center",
                    }}>
                      <div style={{ fontSize: "8px", color: "#555588", lineHeight: "2" }}>
                        {"\u2191"} CLICK A QUEST TO FOCUS {"\u2191"}
                      </div>
                      <div style={{ fontSize: "7px", color: "#444466" }}>
                        SELECT YOUR TARGET!
                      </div>
                    </div>
                  )}

                  {/* Quick-add input */}
                  <div style={{
                    display: "flex",
                    gap: "6px",
                    marginBottom: "12px",
                  }}>
                    <input
                      className="retro-input"
                      value={newTaskText}
                      onChange={(e) => setNewTaskText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addTask()}
                      placeholder="NEW QUEST..."
                      style={{ flex: 1, minWidth: 0, fontSize: "9px", padding: "8px 10px" }}
                    />
                    <button className="retro-btn" onClick={addTask}
                      style={{ background: "#00ff41", fontSize: "14px", padding: "8px 12px", lineHeight: 1 }}>
                      +
                    </button>
                  </div>

                  {/* Compact task list (scrollable) */}
                  <div style={{
                    flex: 1,
                    overflowY: "auto",
                    marginBottom: "12px",
                  }}>
                    {/* Active tasks (inProgress + todo) */}
                    {questLogTasks.length === 0 && doneTasks.length === 0 && (
                      <div style={{
                        fontSize: "8px",
                        color: "#333366",
                        textAlign: "center",
                        padding: "24px 8px",
                        lineHeight: "2",
                      }}>
                        NO QUESTS YET
                        <br />
                        ADD ONE ABOVE!
                      </div>
                    )}
                    {questLogTasks.map((task) => {
                      const isFocused = focusedTaskId === task.id;
                      const isInProg = task.col === "inProgress";
                      return (
                        <div
                          key={task.id}
                          onClick={() => focusTask(task.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "8px 10px",
                            marginBottom: "4px",
                            background: isFocused ? "rgba(255,0,255,0.1)" : "#1a1a2e",
                            border: isFocused ? "2px solid #ff00ff" : "2px solid #2a2a4a",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            boxShadow: isFocused ? "0 0 8px rgba(255,0,255,0.3)" : "none",
                          }}
                        >
                          {/* Status icon */}
                          <span style={{
                            fontSize: "8px",
                            color: isFocused ? "#ff00ff" : isInProg ? "#ff6b35" : "#555588",
                            flexShrink: 0,
                            animation: isFocused && isRunning ? "blink 1s infinite" : "none",
                          }}>
                            {isFocused ? "\u25CF" : isInProg ? "\u25B6" : "\u2610"}
                          </span>
                          {/* Task text */}
                          <span style={{
                            fontSize: "8px",
                            color: isFocused ? "#ff00ff" : "#ccc",
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}>
                            {task.text}
                          </span>
                          {/* Quick complete button */}
                          <button
                            onClick={(e) => { e.stopPropagation(); quickComplete(task.id); }}
                            style={{
                              background: "none",
                              border: "2px solid #00ff41",
                              color: "#00ff41",
                              fontFamily: "'Press Start 2P', monospace",
                              fontSize: "8px",
                              padding: "2px 6px",
                              cursor: "pointer",
                              flexShrink: 0,
                              transition: "all 0.1s",
                            }}
                            onMouseEnter={(e) => { e.target.style.background = "#00ff41"; e.target.style.color = "#0f0f23"; }}
                            onMouseLeave={(e) => { e.target.style.background = "none"; e.target.style.color = "#00ff41"; }}
                          >
                            {"\u2713"}
                          </button>
                        </div>
                      );
                    })}

                    {/* Done tasks section */}
                    {doneTasks.length > 0 && (
                      <div style={{ marginTop: "8px" }}>
                        <div style={{
                          fontSize: "7px",
                          color: "#444466",
                          marginBottom: "4px",
                          paddingTop: "4px",
                          borderTop: "1px solid #2a2a4a",
                          letterSpacing: "1px",
                        }}>
                          {"\u2611"} COMPLETED ({doneTasks.length})
                        </div>
                        {doneTasks.slice(0, maxDoneShown).map((task) => (
                          <div key={task.id} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "4px 10px",
                            marginBottom: "2px",
                            opacity: 0.4,
                          }}>
                            <span style={{ fontSize: "8px", color: "#00ff41" }}>{"\u2611"}</span>
                            <span style={{
                              fontSize: "8px",
                              color: "#555588",
                              textDecoration: "line-through",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>
                              {task.text}
                            </span>
                          </div>
                        ))}
                        {doneTasks.length > maxDoneShown && (
                          <div style={{
                            fontSize: "7px",
                            color: "#444466",
                            padding: "4px 10px",
                          }}>
                            +{doneTasks.length - maxDoneShown} MORE
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Open Full Board Button */}
                  <button
                    className="retro-btn"
                    onClick={() => { ensureAudio(); playClickSound(audioCtxRef.current); setShowFullBoard(!showFullBoard); }}
                    style={{
                      background: showFullBoard ? "#ff6b35" : "#333366",
                      color: showFullBoard ? "#0f0f23" : "#aaa",
                      fontSize: "8px",
                      padding: "8px 12px",
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    {showFullBoard ? (
                      <span>{"\u2716"} CLOSE BOARD</span>
                    ) : (
                      <span>{"\u2630"} OPEN FULL QUEST BOARD</span>
                    )}
                  </button>
                </div>
              </div>

              {/* ===== FULL KANBAN BOARD (toggleable) ===== */}
              {showFullBoard && (
                <div style={{ marginTop: "20px", animation: "slideIn 0.3s ease" }}>
                  {/* Close Board Button */}
                  <div style={{ textAlign: "right", marginBottom: "12px" }}>
                    <button
                      className="retro-btn"
                      onClick={() => { ensureAudio(); playClickSound(audioCtxRef.current); setShowFullBoard(false); }}
                      style={{ background: "#555588", fontSize: "8px", padding: "6px 12px" }}
                    >
                      {"\u2716"} CLOSE BOARD
                    </button>
                  </div>

                  {/* Kanban Columns */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "16px",
                  }}>
                    {[
                      { key: "todo", label: "TO DO", icon: "\u2610", color: "#00d4ff" },
                      { key: "inProgress", label: "IN PROGRESS", icon: "\u25B6", color: "#ff6b35" },
                      { key: "done", label: "DONE", icon: "\u2611", color: "#00ff41" },
                    ].map((col) => (
                      <div
                        key={col.key}
                        onDragOver={(e) => handleDragOver(e, col.key)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, col.key)}
                        className={dragOverColumn === col.key ? "column-drop-target" : ""}
                        style={{
                          background: "#12122a",
                          border: `2px solid ${dragOverColumn === col.key ? "#00d4ff" : "#2a2a4a"}`,
                          padding: "12px",
                          minHeight: "200px",
                          transition: "border-color 0.2s, background 0.2s",
                        }}
                      >
                        {/* Column header */}
                        <div style={{
                          fontSize: "9px",
                          color: col.color,
                          marginBottom: "12px",
                          paddingBottom: "8px",
                          borderBottom: `2px solid ${col.color}44`,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}>
                          <span>{col.icon} {col.label}</span>
                          <span style={{
                            background: col.color,
                            color: "#0f0f23",
                            padding: "2px 6px",
                            fontSize: "8px",
                          }}>{tasks[col.key].length}</span>
                        </div>

                        {/* Tasks */}
                        {tasks[col.key].map((task) => (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={() => handleDragStart(col.key, task.id)}
                            onDragEnd={handleDragEnd}
                            className={`task-card ${draggedTask?.taskId === task.id ? "dragging" : ""}`}
                            style={{
                              background: focusedTaskId === task.id
                                ? "rgba(255,0,255,0.1)"
                                : "#1a1a2e",
                              border: `2px solid ${focusedTaskId === task.id ? "#ff00ff" : "#2a2a4a"}`,
                              padding: "10px",
                              marginBottom: "8px",
                              cursor: "grab",
                              position: "relative",
                              boxShadow: focusedTaskId === task.id
                                ? "0 0 8px rgba(255,0,255,0.3)"
                                : "none",
                            }}
                          >
                            <div style={{
                              fontSize: "8px",
                              color: focusedTaskId === task.id ? "#ff00ff" : "#ccc",
                              marginBottom: "8px",
                              lineHeight: "1.6",
                              wordBreak: "break-word",
                            }}>
                              {focusedTaskId === task.id && (
                                <span style={{ marginRight: "4px", animation: isRunning ? "blink 1s infinite" : "none" }}>
                                  {"\u25C9"}
                                </span>
                              )}
                              {task.text}
                            </div>

                            {/* Task actions */}
                            <div style={{
                              display: "flex",
                              gap: "4px",
                              flexWrap: "wrap",
                            }}>
                              {col.key !== "todo" && (
                                <button
                                  className="retro-btn"
                                  onClick={() => moveTask(col.key, col.key === "done" ? "inProgress" : "todo", task.id)}
                                  style={{
                                    background: "#555588",
                                    fontSize: "7px",
                                    padding: "4px 6px",
                                  }}
                                >
                                  {"\u25C0"}
                                </button>
                              )}
                              {col.key !== "done" && (
                                <button
                                  className="retro-btn"
                                  onClick={() => moveTask(col.key, col.key === "todo" ? "inProgress" : "done", task.id)}
                                  style={{
                                    background: "#555588",
                                    fontSize: "7px",
                                    padding: "4px 6px",
                                  }}
                                >
                                  {"\u25B6"}
                                </button>
                              )}
                              <button
                                className="retro-btn"
                                onClick={() => focusTask(task.id)}
                                style={{
                                  background: focusedTaskId === task.id ? "#ff00ff" : "#8844aa",
                                  fontSize: "7px",
                                  padding: "4px 6px",
                                }}
                              >
                                {focusedTaskId === task.id ? "FOCUSED" : "FOCUS"}
                              </button>
                              <button
                                className="retro-btn"
                                onClick={() => deleteTask(col.key, task.id)}
                                style={{
                                  background: "#cc3333",
                                  fontSize: "7px",
                                  padding: "4px 6px",
                                  marginLeft: "auto",
                                }}
                              >
                                {"\u2716"}
                              </button>
                            </div>
                          </div>
                        ))}

                        {tasks[col.key].length === 0 && (
                          <div style={{
                            fontSize: "8px",
                            color: "#333366",
                            textAlign: "center",
                            padding: "24px 8px",
                            lineHeight: "1.8",
                          }}>
                            {col.key === "todo" && (
                              <span>NO QUESTS YET<br />ADD ONE ABOVE!</span>
                            )}
                            {col.key === "inProgress" && (
                              <span>DRAG TASKS<br />HERE</span>
                            )}
                            {col.key === "done" && (
                              <span>COMPLETED<br />QUESTS</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============ STATS VIEW ============ */}
          {activeView === "STATS" && (
            <div style={{ animation: "slideIn 0.3s ease" }}>
              {/* Today's Stats */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "16px",
                marginBottom: "24px",
              }}>
                {[
                  { label: "TODAY'S SESSIONS", value: todayCount, icon: "\u2665", color: "#ff6b35" },
                  { label: "FOCUS TIME", value: `${todayMinutes}m`, icon: "\u23F1", color: "#00d4ff" },
                  { label: "CURRENT STREAK", value: `${getStreak()} day${getStreak() !== 1 ? "s" : ""}`, icon: "\uD83D\uDD25", color: "#ff00ff" },
                  { label: "ALL-TIME SESSIONS", value: totalSessions, icon: "\u2605", color: "#00ff41" },
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: "#12122a",
                    border: `2px solid ${stat.color}44`,
                    padding: "16px",
                    textAlign: "center",
                  }}>
                    <div style={{ fontSize: "20px", marginBottom: "8px" }}>{stat.icon}</div>
                    <div style={{ fontSize: "20px", color: stat.color, marginBottom: "8px" }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: "7px", color: "#555588", lineHeight: "1.6" }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* All-time focus hours */}
              <div style={{
                background: "#12122a",
                border: "2px solid #333366",
                padding: "16px",
                marginBottom: "24px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "8px", color: "#555588", marginBottom: "8px" }}>
                  TOTAL FOCUS TIME
                </div>
                <div style={{
                  fontSize: "clamp(16px, 4vw, 28px)",
                  color: "#00d4ff",
                  textShadow: "0 0 10px rgba(0,212,255,0.5)",
                }}>
                  {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
                </div>
                <div style={{ fontSize: "8px", color: "#333366", marginTop: "4px" }}>
                  ({totalMinutes} MINUTES)
                </div>
              </div>

              {/* 7-Day Chart */}
              <div style={{
                background: "#12122a",
                border: "2px solid #333366",
                padding: "20px",
                marginBottom: "24px",
              }}>
                <div style={{
                  fontSize: "10px",
                  color: "#00ff41",
                  marginBottom: "20px",
                  textAlign: "center",
                }}>
                  {"\u2593"} LAST 7 DAYS {"\u2593"}
                </div>

                {(() => {
                  const days = getLast7Days();
                  const maxCount = Math.max(...days.map((d) => d.count), 1);
                  const chartHeight = 120;
                  return (
                    <div style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-around",
                      height: `${chartHeight + 30}px`,
                      gap: "8px",
                      padding: "0 8px",
                    }}>
                      {days.map((day, i) => {
                        const barHeight = day.count > 0
                          ? Math.max((day.count / maxCount) * chartHeight, 12)
                          : 4;
                        const isToday = day.date === getToday();
                        return (
                          <div key={i} style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            flex: 1,
                          }}>
                            {/* Count label */}
                            <div style={{
                              fontSize: "8px",
                              color: day.count > 0 ? "#00ff41" : "#333366",
                              marginBottom: "4px",
                            }}>
                              {day.count}
                            </div>
                            {/* Bar */}
                            <div style={{
                              width: "100%",
                              maxWidth: "40px",
                              height: `${barHeight}px`,
                              background: day.count > 0
                                ? isToday
                                  ? "linear-gradient(180deg, #ff6b35, #ff00ff)"
                                  : "linear-gradient(180deg, #00ff41, #00d4ff)"
                                : "#2a2a4a",
                              border: day.count > 0
                                ? `1px solid ${isToday ? "#ff6b35" : "#00ff41"}`
                                : "1px solid #333366",
                              transition: "height 0.5s ease",
                              animation: day.count > 0 ? "barGrow 0.5s ease" : "none",
                              transformOrigin: "bottom",
                              boxShadow: day.count > 0
                                ? `0 0 6px ${isToday ? "#ff6b3555" : "#00ff4155"}`
                                : "none",
                            }} />
                            {/* Day label */}
                            <div style={{
                              fontSize: "7px",
                              color: isToday ? "#ff6b35" : "#555588",
                              marginTop: "6px",
                            }}>
                              {day.label}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Session Log */}
              <div style={{
                background: "#12122a",
                border: "2px solid #333366",
                padding: "16px",
              }}>
                <div style={{
                  fontSize: "10px",
                  color: "#00d4ff",
                  marginBottom: "12px",
                }}>
                  {"\u2593"} SESSION LOG {"\u2593"}
                </div>
                {sessionHistory.length === 0 ? (
                  <div style={{
                    fontSize: "8px",
                    color: "#333366",
                    textAlign: "center",
                    padding: "24px",
                    lineHeight: "2",
                  }}>
                    NO SESSIONS RECORDED YET
                    <br />
                    COMPLETE A POMODORO TO SEE YOUR LOG!
                  </div>
                ) : (
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {[...sessionHistory].reverse().map((session, i) => (
                      <div key={i} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px",
                        borderBottom: "1px solid #2a2a4a",
                        fontSize: "8px",
                      }}>
                        <span style={{ color: "#00ff41" }}>{"\u2665"} SESSION #{sessionHistory.length - i}</span>
                        <span style={{ color: "#555588" }}>
                          {new Date(session.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span style={{ color: "#ff6b35" }}>{session.duration}min</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        {/* ====== SESSION COMPLETION OVERLAY ====== */}
        {showCompletionOverlay && (() => {
          const completedTask = getFocusedTask();
          return (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.92)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10000,
              animation: "slideIn 0.3s ease",
            }}>
              <div style={{
                background: "#0f0f23",
                border: "3px solid #00ff41",
                padding: "32px 40px",
                textAlign: "center",
                maxWidth: "440px",
                width: "90%",
                boxShadow: "0 0 30px rgba(0,255,65,0.3), 0 0 60px rgba(0,255,65,0.1)",
              }}>
                <div style={{
                  fontSize: "14px",
                  color: "#00ff41",
                  marginBottom: "16px",
                  animation: "textGlow 2s infinite",
                }}>
                  {"\u2B50"} SESSION COMPLETE! {"\u2B50"}
                </div>

                <div style={{
                  fontSize: "24px",
                  color: "#ff6b35",
                  marginBottom: "16px",
                  animation: "xpFloat 2s ease-in-out infinite",
                }}>
                  +{durations.WORK} XP
                </div>

                {completedTask && (
                  <div style={{
                    fontSize: "9px",
                    color: "#00d4ff",
                    marginBottom: "16px",
                    padding: "8px",
                    background: "#1a1a2e",
                    border: "1px solid #333366",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    QUEST: {completedTask.text}
                  </div>
                )}

                <div style={{
                  fontSize: "12px",
                  color: "#ff00ff",
                  marginBottom: "20px",
                  animation: "textGlow 2s infinite",
                }}>
                  QUEST COMPLETE?
                </div>

                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="retro-btn" onClick={handleCompletionYes}
                    style={{
                      background: "#00ff41",
                      fontSize: "11px",
                      padding: "12px 24px",
                    }}>
                    {"\u2713"} YES!
                  </button>
                  <button className="retro-btn" onClick={handleCompletionNo}
                    style={{
                      background: "#555588",
                      fontSize: "11px",
                      padding: "12px 24px",
                    }}>
                    NOT YET
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ====== FOOTER ====== */}
        <footer style={{
          textAlign: "center",
          padding: "16px",
          fontSize: "7px",
          color: "#333366",
          borderTop: "2px solid #1a1a2e",
        }}>
          PIXEL POMO v2.0 {"\u2665"} STAY FOCUSED, ADVENTURER!
        </footer>
      </div>
    </>
  );
}
