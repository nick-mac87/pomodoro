import { useTheme } from "../context/ThemeContext.jsx";

export default function TransitionPrompt({ timerMode, nextMode, TIMER_MODES, onAccept, onDismiss }) {
  const { isRetro, s } = useTheme();
  const nextColor = TIMER_MODES[nextMode]?.color || "var(--accent-break)";

  return (
    <div
      style={{
        background: isRetro ? "rgba(0,0,0,0.85)" : "var(--bg-card)",
        border: isRetro ? `3px solid ${nextColor}` : "1px solid var(--border-primary)",
        borderRadius: isRetro ? 0 : "var(--border-radius-lg)",
        padding: "24px",
        marginBottom: "20px",
        textAlign: "center",
        animation: "slideIn 0.3s ease",
        boxShadow: isRetro ? `0 0 20px ${nextColor}44` : "var(--card-shadow)",
      }}
    >
      <p
        style={{
          fontSize: "var(--font-size-base)",
          marginBottom: "8px",
          color: "var(--accent-success)",
        }}
      >
        {timerMode === "WORK" ? s.sessionComplete : s.breakOver}
      </p>
      <p
        style={{
          fontSize: "var(--font-size-md)",
          color: isRetro ? nextColor : "var(--text-primary)",
          marginBottom: "16px",
        }}
      >
        {s.readyFor} {TIMER_MODES[nextMode]?.label}?
      </p>
      <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
        <button
          className={isRetro ? "retro-btn" : "clean-btn"}
          onClick={onAccept}
          style={{
            background: isRetro ? nextColor : "var(--btn-primary-bg)",
            color: isRetro ? "var(--btn-primary-text)" : "var(--btn-primary-text)",
            fontSize: "var(--font-size-base)",
          }}
        >
          {s.startBtn}
        </button>
        <button
          className={isRetro ? "retro-btn" : "clean-btn"}
          onClick={onDismiss}
          style={{
            background: "var(--accent-muted-btn)",
            color: isRetro ? "var(--btn-primary-text)" : "#fff",
            fontSize: "var(--font-size-base)",
          }}
        >
          {s.skipBtn}
        </button>
      </div>
    </div>
  );
}
