import { useTheme } from "../context/ThemeContext.jsx";

export default function CompletionOverlay({ focusedTask, duration, onYes, onNo }) {
  const { isRetro, s } = useTheme();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "var(--bg-overlay)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        animation: "slideIn 0.3s ease",
      }}
    >
      <div
        style={{
          background: "var(--bg-primary)",
          border: isRetro ? "3px solid var(--accent-success)" : "1px solid var(--border-primary)",
          borderRadius: isRetro ? 0 : "var(--border-radius-lg)",
          padding: "32px 40px",
          textAlign: "center",
          maxWidth: "440px",
          width: "90%",
          boxShadow: isRetro
            ? "0 0 30px rgba(0,255,65,0.3), 0 0 60px rgba(0,255,65,0.1)"
            : "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            fontSize: "var(--font-size-lg)",
            color: "var(--accent-success)",
            marginBottom: "16px",
            animation: isRetro ? "textGlow 2s infinite" : "none",
          }}
        >
          {s.sessionComplete}
        </div>

        <div
          style={{
            fontSize: "var(--font-size-xl)",
            color: "var(--accent-work)",
            marginBottom: "16px",
            animation: isRetro ? "xpFloat 2s ease-in-out infinite" : "cleanFadeUp 2s ease-in-out infinite",
          }}
        >
          {s.xpGain(duration)}
        </div>

        {focusedTask && (
          <div
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--accent-longbreak)",
              marginBottom: "16px",
              padding: "8px",
              background: "var(--bg-secondary)",
              border: isRetro ? "1px solid var(--border-primary)" : "1px solid var(--border-primary)",
              borderRadius: isRetro ? 0 : "var(--border-radius)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {s.taskLabel}: {focusedTask.text}
          </div>
        )}

        <div
          style={{
            fontSize: "var(--font-size-md)",
            color: "var(--accent-focus)",
            marginBottom: "20px",
            animation: isRetro ? "textGlow 2s infinite" : "none",
          }}
        >
          {s.taskComplete}
        </div>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <button
            className={isRetro ? "retro-btn" : "clean-btn"}
            onClick={onYes}
            style={{
              background: "var(--accent-success)",
              color: isRetro ? "var(--btn-primary-text)" : "#fff",
              fontSize: "var(--font-size-base)",
              padding: "12px 24px",
            }}
          >
            {s.yesBtn}
          </button>
          <button
            className={isRetro ? "retro-btn" : "clean-btn"}
            onClick={onNo}
            style={{
              background: "var(--accent-muted-btn)",
              color: isRetro ? "var(--btn-primary-text)" : "#fff",
              fontSize: "var(--font-size-base)",
              padding: "12px 24px",
            }}
          >
            {s.notYetBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
