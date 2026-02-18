import { useTheme } from "../context/ThemeContext.jsx";

export default function Timer({
  timerMode,
  timeLeft,
  isRunning,
  sessionsCompleted,
  durations,
  TIMER_MODES,
  focusedTask,
  formatTime,
  getTimerProgress,
  onStart,
  onPause,
  onReset,
  onSwitchMode,
  onAdjustDuration,
}) {
  const { isRetro, s } = useTheme();
  const modeColor = TIMER_MODES[timerMode].color;

  return (
    <div>
      {/* Mode Selector */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: isRetro ? "6px" : "8px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        {Object.entries(TIMER_MODES).map(([key, mode]) => {
          const isActive = timerMode === key;
          return (
            <div
              key={key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <button
                onClick={() => onSwitchMode(key)}
                className={isRetro ? "retro-btn" : "clean-btn"}
                style={
                  isRetro
                    ? {
                        background: isActive ? mode.color : "var(--btn-secondary-bg)",
                        color: isActive ? "var(--btn-primary-text)" : "var(--btn-secondary-text)",
                        fontSize: "var(--font-size-sm)",
                        padding: "8px 12px",
                        width: "100%",
                      }
                    : {
                        background: isActive ? mode.color : "var(--btn-secondary-bg)",
                        color: isActive ? "#fff" : "var(--btn-secondary-text)",
                        fontSize: "var(--font-size-sm)",
                        padding: "8px 14px",
                        width: "100%",
                        border: isActive ? "none" : "1px solid var(--border-primary)",
                      }
                }
              >
                {mode.label}
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <button
                  onClick={() => onAdjustDuration(key, -5)}
                  style={{
                    background: "none",
                    border: `1px solid ${isActive ? mode.color : "var(--border-primary)"}`,
                    color: isActive ? mode.color : "var(--text-muted)",
                    fontFamily: "var(--font-primary)",
                    fontSize: "var(--font-size-xs)",
                    padding: "2px 5px",
                    cursor: isRunning ? "not-allowed" : "pointer",
                    opacity: isRunning ? 0.3 : 1,
                    borderRadius: isRetro ? 0 : "4px",
                  }}
                >
                  -
                </button>
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: isActive ? mode.color : "var(--text-muted)",
                    minWidth: "36px",
                    textAlign: "center",
                  }}
                >
                  {durations[key]}m
                </span>
                <button
                  onClick={() => onAdjustDuration(key, 5)}
                  style={{
                    background: "none",
                    border: `1px solid ${isActive ? mode.color : "var(--border-primary)"}`,
                    color: isActive ? mode.color : "var(--text-muted)",
                    fontFamily: "var(--font-primary)",
                    fontSize: "var(--font-size-xs)",
                    padding: "2px 5px",
                    cursor: isRunning ? "not-allowed" : "pointer",
                    opacity: isRunning ? 0.3 : 1,
                    borderRadius: isRetro ? 0 : "4px",
                  }}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timer Display */}
      <div
        style={{
          background: isRetro ? "#0a0a1a" : "var(--bg-card)",
          border: isRetro ? "4px solid var(--border-primary)" : "1px solid var(--border-primary)",
          borderRadius: isRetro ? "8px" : "var(--border-radius-lg)",
          padding: "32px 20px",
          position: "relative",
          boxShadow: isRetro
            ? `inset 0 0 60px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.5), 0 0 40px ${modeColor}22`
            : "var(--card-shadow)",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        {/* CRT inner glow (retro only) */}
        {isRetro && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(ellipse at center, ${modeColor}08 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />
        )}

        {/* Mode label */}
        <div
          style={{
            textAlign: "center",
            fontSize: "var(--font-size-base)",
            color: isRetro ? modeColor : "var(--text-muted)",
            marginBottom: "8px",
            letterSpacing: isRetro ? "4px" : "2px",
            animation: isRetro && isRunning ? "textGlow 2s ease-in-out infinite" : "none",
            textTransform: isRetro ? "uppercase" : "none",
          }}
        >
          {TIMER_MODES[timerMode].label}
        </div>

        {/* Current task banner */}
        {focusedTask && timerMode === "WORK" && (
          <div
            style={{
              textAlign: "center",
              fontSize: "var(--font-size-base)",
              color: "var(--accent-focus)",
              marginBottom: "16px",
              padding: "8px 16px",
              background: isRetro ? "rgba(255,0,255,0.1)" : "var(--bg-secondary)",
              border: isRetro
                ? "2px solid rgba(255,0,255,0.3)"
                : "1px solid var(--border-primary)",
              borderRadius: isRetro ? 0 : "var(--border-radius)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {isRetro && <span>{"\u2694"} {s.currentQuest} {"\u2694"}</span>}
            {!isRetro && <span>{s.currentQuest}</span>}
            <div
              style={{
                marginTop: "4px",
                fontSize: "var(--font-size-sm)",
                color: "var(--text-primary)",
              }}
            >
              {focusedTask.text}
            </div>
          </div>
        )}

        {/* Time display */}
        <div
          style={{
            textAlign: "center",
            fontSize: "var(--font-size-timer)",
            color: isRetro ? modeColor : "var(--text-primary)",
            textShadow: isRetro ? `0 0 20px ${modeColor}, 0 0 40px ${modeColor}88` : "none",
            marginBottom: "16px",
            letterSpacing: isRetro ? "8px" : "4px",
            fontFamily: "var(--font-primary)",
            fontWeight: isRetro ? "normal" : 600,
            position: "relative",
          }}
        >
          {formatTime(timeLeft)}
          {isRunning && isRetro && (
            <span
              style={{
                position: "absolute",
                right: "4px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: modeColor,
                animation: "pulse 1s infinite",
              }}
            />
          )}
        </div>

        {/* Progress bar */}
        <div
          style={{
            width: "100%",
            height: isRetro ? "8px" : "4px",
            background: "var(--bg-secondary)",
            border: isRetro ? "2px solid var(--border-primary)" : "none",
            borderRadius: isRetro ? 0 : "2px",
            marginBottom: "8px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${getTimerProgress()}%`,
              background: isRetro
                ? `linear-gradient(90deg, ${modeColor}, ${modeColor}cc)`
                : modeColor,
              transition: "width 0.5s linear",
              boxShadow: isRetro ? `0 0 8px ${modeColor}` : "none",
              borderRadius: isRetro ? 0 : "2px",
            }}
          />
        </div>

        {/* Session dots */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginTop: "8px",
          }}
        >
          {Array.from({ length: 4 }, (_, i) => {
            const filled = i < sessionsCompleted % 4;
            return (
              <div
                key={i}
                style={{
                  width: isRetro ? "12px" : "8px",
                  height: isRetro ? "12px" : "8px",
                  background: filled ? "var(--accent-work)" : "var(--border-subtle)",
                  border: isRetro
                    ? `2px solid ${filled ? "var(--accent-work)" : "var(--border-primary)"}`
                    : "none",
                  borderRadius: isRetro ? 0 : "50%",
                  boxShadow: filled && isRetro ? "0 0 6px var(--accent-work)" : "none",
                  transition: "all 0.2s ease",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {!isRunning ? (
          <button
            className={isRetro ? "retro-btn" : "clean-btn"}
            onClick={onStart}
            style={{
              background: "var(--accent-success)",
              color: isRetro ? "var(--btn-primary-text)" : "#fff",
              fontSize: "var(--font-size-md)",
              padding: "12px 24px",
            }}
          >
            {timeLeft === TIMER_MODES[timerMode].duration ? s.startBtn : s.resumeBtn}
          </button>
        ) : (
          <button
            className={isRetro ? "retro-btn" : "clean-btn"}
            onClick={onPause}
            style={{
              background: "var(--accent-work)",
              color: isRetro ? "var(--btn-primary-text)" : "#fff",
              fontSize: "var(--font-size-md)",
              padding: "12px 24px",
            }}
          >
            {s.pauseBtn}
          </button>
        )}
        <button
          className={isRetro ? "retro-btn" : "clean-btn"}
          onClick={onReset}
          style={{
            background: "var(--accent-muted-btn)",
            color: isRetro ? "var(--btn-primary-text)" : "#fff",
            fontSize: "var(--font-size-md)",
            padding: "12px 24px",
          }}
        >
          {s.resetBtn}
        </button>
      </div>
    </div>
  );
}
