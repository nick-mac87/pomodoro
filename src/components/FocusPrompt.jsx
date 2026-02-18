import { useTheme } from "../context/ThemeContext.jsx";

export default function FocusPrompt({ onStartAnyway }) {
  const { isRetro, s } = useTheme();

  return (
    <div
      style={{
        background: isRetro ? "rgba(0,0,0,0.9)" : "var(--bg-card)",
        border: isRetro ? "3px solid var(--accent-focus)" : "1px solid var(--border-primary)",
        borderRadius: isRetro ? 0 : "var(--border-radius-lg)",
        padding: "24px",
        marginBottom: "20px",
        textAlign: "center",
        animation: "slideIn 0.3s ease",
        boxShadow: isRetro ? "0 0 20px rgba(255,0,255,0.3)" : "var(--card-shadow)",
      }}
    >
      <p
        style={{
          fontSize: "var(--font-size-md)",
          color: "var(--accent-focus)",
          marginBottom: "12px",
          animation: isRetro ? "textGlow 2s infinite" : "none",
        }}
      >
        {s.focusPromptTitle}
      </p>
      <p
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--text-muted)",
          marginBottom: "16px",
          lineHeight: "1.8",
        }}
      >
        {s.focusPromptSub}
      </p>
      <button
        className={isRetro ? "retro-btn" : "clean-btn"}
        onClick={onStartAnyway}
        style={{
          background: "var(--accent-work)",
          color: "#fff",
          fontSize: "var(--font-size-base)",
          padding: "10px 20px",
        }}
      >
        {s.startAnyway}
      </button>
    </div>
  );
}
