import { useTheme } from "../context/ThemeContext.jsx";

export default function QuickStatsBar({ todayCount, todayMinutes, streak, doneTotal, allTotal }) {
  const { isRetro, s } = useTheme();

  const stats = [
    { icon: isRetro ? "\uD83C\uDFAF" : null, label: s.todayLabel, value: String(todayCount), color: "var(--accent-longbreak)" },
    { icon: isRetro ? "\u23F1" : null, label: s.focusLabel, value: `${todayMinutes}m`, color: "var(--accent-break)" },
    { icon: isRetro ? "\uD83D\uDD25" : null, label: s.streakLabel, value: `${streak}d`, color: "var(--accent-work)" },
    { icon: isRetro ? "\u2694" : null, label: s.tasksLabel, value: `${doneTotal}/${allTotal}`, color: "var(--accent-focus)" },
  ];

  return (
    <div
      style={{
        background: "var(--stats-bar-bg)",
        borderBottom: isRetro ? "2px solid var(--border-subtle)" : "1px solid var(--border-primary)",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "center",
        gap: isRetro ? "32px" : "40px",
        flexWrap: "wrap",
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {stat.icon && (
            <span
              style={{
                fontSize: "16px",
                fontFamily: "system-ui, sans-serif",
                lineHeight: 1,
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {stat.icon}
            </span>
          )}
          <span style={{ color: "var(--text-muted)" }}>{stat.label}</span>
          <span style={{ color: stat.color, fontWeight: isRetro ? "normal" : 600 }}>
            {stat.value}
          </span>
        </div>
      ))}
    </div>
  );
}
