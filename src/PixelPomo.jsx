import { useState, useCallback } from "react";
import { useTheme } from "./context/ThemeContext.jsx";
import { useSound } from "./hooks/useSound.js";
import { useTimer } from "./hooks/useTimer.js";
import { useTasks } from "./hooks/useTasks.js";

import Header from "./components/Header.jsx";
import QuickStatsBar from "./components/QuickStatsBar.jsx";
import Timer from "./components/Timer.jsx";
import QuestLog from "./components/QuestLog.jsx";
import KanbanBoard from "./components/KanbanBoard.jsx";
import StatsView from "./components/StatsView.jsx";
import TransitionPrompt from "./components/TransitionPrompt.jsx";
import FocusPrompt from "./components/FocusPrompt.jsx";
import CompletionOverlay from "./components/CompletionOverlay.jsx";

export default function PixelPomo() {
  const { isRetro, s } = useTheme();
  const sound = useSound(isRetro);

  // UI state
  const [activeView, setActiveView] = useState("PLAY");
  const [showFocusPrompt, setShowFocusPrompt] = useState(false);
  const [showCompletionOverlay, setShowCompletionOverlay] = useState(false);
  const [showFullBoard, setShowFullBoard] = useState(false);

  // Tasks
  const taskState = useTasks();

  // Timer completion callback
  const handleTimerComplete = useCallback(
    (type) => {
      sound.playComplete();
      if (type === "work_with_focus") {
        setShowCompletionOverlay(true);
      }
    },
    [sound]
  );

  // Timer
  const timer = useTimer({
    focusedTaskId: taskState.focusedTaskId,
    onTimerComplete: handleTimerComplete,
  });

  // --- Orchestration handlers ---

  const handleStart = () => {
    sound.ensureAudio();
    // Focus prompt: if WORK mode, tasks exist but no focused task
    if (timer.timerMode === "WORK") {
      const availableTasks = taskState.tasks.todo.length + taskState.tasks.inProgress.length;
      if (availableTasks > 0 && taskState.focusedTaskId === null) {
        setShowFocusPrompt(true);
        return;
      }
    }
    sound.playStart();
    timer.startTimer();
  };

  const handlePause = () => {
    sound.playClick();
    timer.pauseTimer();
  };

  const handleReset = () => {
    sound.playClick();
    timer.resetTimer();
  };

  const handleSwitchMode = (mode) => {
    sound.playClick();
    timer.switchMode(mode);
  };

  const handleAdjustDuration = (mode, delta) => {
    sound.playClick();
    timer.adjustDuration(mode, delta);
  };

  const handleAcceptTransition = () => {
    sound.playStart();
    timer.acceptTransition();
  };

  const handleDismissTransition = () => {
    sound.playClick();
    timer.dismissTransition();
  };

  const handleStartAnyway = () => {
    sound.playStart();
    setShowFocusPrompt(false);
    timer.startTimer();
  };

  const handleFocusTask = (taskId) => {
    sound.playClick();
    taskState.focusTask(taskId);
    // If focus prompt is showing and we selected a task, start timer
    if (showFocusPrompt && taskState.focusedTaskId !== taskId) {
      setShowFocusPrompt(false);
      sound.playStart();
      timer.startTimer();
    }
  };

  const handleAddTask = () => {
    if (!taskState.newTaskText.trim()) return;
    sound.playClick();
    taskState.addTask();
  };

  const handleDeleteTask = (col, id) => {
    sound.playDelete();
    taskState.deleteTask(col, id);
  };

  const handleQuickComplete = (id) => {
    sound.playClick();
    taskState.quickComplete(id);
  };

  const handleMoveTask = (from, to, id) => {
    sound.playClick();
    taskState.moveTask(from, to, id);
  };

  const handleCompletionYes = () => {
    sound.playCelebration();
    taskState.completeFocusedTask();
    setShowCompletionOverlay(false);
    const next = timer.determineNextMode();
    timer.switchMode(next);
    // Show transition to let user decide
    // We can't directly set showTransition from here, so we just switch the mode
  };

  const handleCompletionNo = () => {
    sound.playClick();
    setShowCompletionOverlay(false);
    const next = timer.determineNextMode();
    timer.switchMode(next);
  };

  const handleToggleBoard = () => {
    sound.playClick();
    setShowFullBoard(!showFullBoard);
  };

  const focusedTask = taskState.getFocusedTask();

  return (
    <div
      className={isRetro ? "scanlines crt-effect" : ""}
      style={{
        minHeight: "100vh",
        background: "var(--gradient-bg)",
        fontFamily: "var(--font-primary)",
        padding: 0,
      }}
    >
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        sessionsCompleted={timer.sessionsCompleted}
        onSound={sound.playClick}
      />

      <QuickStatsBar
        todayCount={timer.todayCount}
        todayMinutes={timer.todayMinutes}
        streak={timer.getStreak()}
        doneTotal={taskState.doneTotal}
        allTotal={taskState.allTotal}
      />

      <main style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* PLAY VIEW */}
        {activeView === "PLAY" && (
          <div style={{ animation: "slideIn 0.3s ease" }}>
            <div
              className="play-layout"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {/* Left: Timer */}
              <div>
                {timer.showTransition && (
                  <TransitionPrompt
                    timerMode={timer.timerMode}
                    nextMode={timer.nextMode}
                    TIMER_MODES={timer.TIMER_MODES}
                    onAccept={handleAcceptTransition}
                    onDismiss={handleDismissTransition}
                  />
                )}

                {showFocusPrompt && <FocusPrompt onStartAnyway={handleStartAnyway} />}

                <Timer
                  timerMode={timer.timerMode}
                  timeLeft={timer.timeLeft}
                  isRunning={timer.isRunning}
                  sessionsCompleted={timer.sessionsCompleted}
                  durations={timer.durations}
                  TIMER_MODES={timer.TIMER_MODES}
                  focusedTask={focusedTask}
                  formatTime={timer.formatTime}
                  getTimerProgress={timer.getTimerProgress}
                  onStart={handleStart}
                  onPause={handlePause}
                  onReset={handleReset}
                  onSwitchMode={handleSwitchMode}
                  onAdjustDuration={handleAdjustDuration}
                />
              </div>

              {/* Right: Quest Log */}
              <QuestLog
                focusedTask={focusedTask}
                focusedTaskId={taskState.focusedTaskId}
                isRunning={timer.isRunning}
                questLogTasks={taskState.questLogTasks}
                doneTasks={taskState.doneTasks}
                newTaskText={taskState.newTaskText}
                setNewTaskText={taskState.setNewTaskText}
                showFullBoard={showFullBoard}
                onAddTask={handleAddTask}
                onFocusTask={handleFocusTask}
                onQuickComplete={handleQuickComplete}
                onToggleBoard={handleToggleBoard}
              />
            </div>

            {showFullBoard && (
              <KanbanBoard
                tasks={taskState.tasks}
                focusedTaskId={taskState.focusedTaskId}
                isRunning={timer.isRunning}
                draggedTask={taskState.draggedTask}
                dragOverColumn={taskState.dragOverColumn}
                onMoveTask={handleMoveTask}
                onFocusTask={handleFocusTask}
                onDeleteTask={handleDeleteTask}
                onDragStart={taskState.handleDragStart}
                onDragOver={taskState.handleDragOver}
                onDragLeave={taskState.handleDragLeave}
                onDrop={taskState.handleDrop}
                onDragEnd={taskState.handleDragEnd}
                onClose={() => {
                  sound.playClick();
                  setShowFullBoard(false);
                }}
              />
            )}
          </div>
        )}

        {/* STATS VIEW */}
        {activeView === "STATS" && (
          <StatsView
            todayCount={timer.todayCount}
            todayMinutes={timer.todayMinutes}
            streak={timer.getStreak()}
            totalSessions={timer.totalSessions}
            totalMinutes={timer.totalMinutes}
            sessionHistory={timer.sessionHistory}
            getLast7Days={timer.getLast7Days}
            getToday={timer.getToday}
          />
        )}
      </main>

      {/* Completion overlay */}
      {showCompletionOverlay && (
        <CompletionOverlay
          focusedTask={focusedTask}
          duration={timer.durations.WORK}
          onYes={handleCompletionYes}
          onNo={handleCompletionNo}
        />
      )}

      {/* Footer */}
      <footer
        style={{
          textAlign: "center",
          padding: "16px",
          fontSize: "var(--font-size-xs)",
          color: "var(--text-dim)",
          borderTop: isRetro ? "2px solid var(--bg-secondary)" : "1px solid var(--border-primary)",
        }}
      >
        {s.footer}
      </footer>
    </div>
  );
}
