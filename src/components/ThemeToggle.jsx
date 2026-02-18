import { useTheme } from "../context/ThemeContext.jsx";

export default function ThemeToggle({ onSound }) {
  const { isRetro, toggleTheme } = useTheme();

  return (
    <button
      onClick={() => {
        if (onSound) onSound();
        toggleTheme();
      }}
      className={isRetro ? "retro-btn" : "clean-btn"}
      style={{
        background: isRetro ? "var(--accent-focus)" : "var(--btn-secondary-bg)",
        color: isRetro ? "#fff" : "var(--btn-secondary-text)",
        fontSize: "var(--font-size-sm)",
        padding: "8px 12px",
        border: isRetro ? "none" : "1px solid var(--border-primary)",
      }}
      title={isRetro ? "Switch to clean theme" : "Switch to retro theme"}
    >
      {isRetro ? "CLEAN MODE" : "Retro Mode"}
    </button>
  );
}
