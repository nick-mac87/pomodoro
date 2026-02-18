import { useTheme } from "../context/ThemeContext.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

const VIEWS = ["PLAY", "STATS"];

export default function Header({ activeView, setActiveView, sessionsCompleted, onSound }) {
  const { isRetro, s } = useTheme();

  return (
    <header
      style={{
        background: "var(--header-bg)",
        borderBottom: isRetro ? "3px solid var(--border-primary)" : "1px solid var(--border-primary)",
        padding: isRetro ? "16px 20px" : "12px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}
    >
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {isRetro && (
          <div
            style={{
              width: "24px",
              height: "28px",
              position: "relative",
              flexShrink: 0,
            }}
          >
            <div
              style={{
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
              }}
            />
          </div>
        )}
        <h1
          style={{
            fontSize: isRetro ? "clamp(12px, 2.5vw, 20px)" : "clamp(16px, 2.5vw, 22px)",
            margin: 0,
            fontWeight: isRetro ? "normal" : 600,
            ...(isRetro
              ? {
                  background: "linear-gradient(180deg, #ff6b35, #ff00ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  textShadow: "none",
                  filter: "drop-shadow(0 0 8px rgba(255,107,53,0.4))",
                }
              : {
                  color: "var(--text-primary)",
                }),
          }}
        >
          {s.appTitle}
        </h1>
      </div>

      {/* Nav + Theme Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <nav style={{ display: "flex", gap: "8px" }}>
          {VIEWS.map((view) => {
            const isActive = activeView === view;
            const label = view === "PLAY" ? s.navPlay : s.navStats;
            const icon = isRetro ? (view === "PLAY" ? "\uD83C\uDFAE" : "\u2B50") : null;
            const text = isRetro ? (view === "PLAY" ? "PLAY" : "STATS") : label;
            return (
              <button
                key={view}
                onClick={() => {
                  if (onSound) onSound();
                  setActiveView(view);
                }}
                className={isRetro ? "retro-btn" : "clean-btn"}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  ...(isRetro
                    ? {
                        fontSize: "var(--font-size-md)",
                        padding: "10px 20px",
                        background: isActive ? "var(--accent-success)" : "var(--btn-secondary-bg)",
                        color: isActive ? "var(--btn-primary-text)" : "var(--btn-secondary-text)",
                        border: `2px solid ${isActive ? "var(--accent-success)" : "var(--accent-muted-btn)"}`,
                        boxShadow: isActive
                          ? "0 0 10px rgba(0,255,65,0.5), 0 0 20px rgba(0,255,65,0.2)"
                          : "none",
                        letterSpacing: "2px",
                      }
                    : {
                        padding: "8px 16px",
                        background: isActive ? "var(--btn-primary-bg)" : "var(--btn-secondary-bg)",
                        color: isActive ? "var(--btn-primary-text)" : "var(--btn-secondary-text)",
                        border: isActive ? "none" : "1px solid var(--border-primary)",
                      }),
                }}
              >
                {icon && (
                  <span style={{ fontFamily: "system-ui, sans-serif", fontSize: "16px", lineHeight: 1 }}>
                    {icon}
                  </span>
                )}
                <span>{text}</span>
              </button>
            );
          })}
        </nav>
        <ThemeToggle onSound={onSound} />
      </div>

      {/* Session counter */}
      <div
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--accent-longbreak)",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {isRetro && (
          <span style={{ color: "var(--accent-work)", fontFamily: "system-ui, sans-serif", fontSize: "14px", lineHeight: 1, display: "inline-flex", alignItems: "center", gap: "2px" }}>
            {Array.from({ length: 4 }, (_, i) => (
              <span
                key={i}
                style={{
                  color: i < sessionsCompleted % 4 ? "var(--accent-work)" : "var(--border-primary)",
                }}
              >
                {"\u2665"}
              </span>
            ))}
          </span>
        )}
        <span>
          {sessionsCompleted} {s.done}
        </span>
      </div>
    </header>
  );
}
