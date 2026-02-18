import { useTheme } from "../context/ThemeContext.jsx";

export default function StatsView({
  todayCount,
  todayMinutes,
  streak,
  totalSessions,
  totalMinutes,
  sessionHistory,
  getLast7Days,
  getToday,
}) {
  const { isRetro, s } = useTheme();

  const statCards = [
    { label: s.todaySessions, value: todayCount, icon: isRetro ? "\u2665" : null, color: "var(--accent-work)" },
    { label: s.focusTime, value: `${todayMinutes}m`, icon: isRetro ? "\u23F1" : null, color: "var(--accent-longbreak)" },
    {
      label: s.currentStreak,
      value: `${streak} day${streak !== 1 ? "s" : ""}`,
      icon: isRetro ? "\uD83D\uDD25" : null,
      color: "var(--accent-focus)",
    },
    { label: s.allTimeSessions, value: totalSessions, icon: isRetro ? "\u2605" : null, color: "var(--accent-success)" },
  ];

  const days = getLast7Days();
  const maxCount = Math.max(...days.map((d) => d.count), 1);
  const chartHeight = 120;

  return (
    <div style={{ animation: "slideIn 0.3s ease" }}>
      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {statCards.map((stat, i) => (
          <div
            key={i}
            style={{
              background: "var(--bg-card)",
              border: isRetro ? `2px solid ${stat.color}44` : "1px solid var(--border-primary)",
              borderRadius: isRetro ? 0 : "var(--border-radius-lg)",
              padding: "16px",
              textAlign: "center",
              boxShadow: isRetro ? "none" : "var(--card-shadow)",
            }}
          >
            {stat.icon && (
              <div style={{ fontSize: "20px", marginBottom: "8px" }}>{stat.icon}</div>
            )}
            <div
              style={{
                fontSize: "var(--font-size-xl)",
                color: stat.color,
                marginBottom: "8px",
                fontWeight: isRetro ? "normal" : 600,
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-muted)",
                lineHeight: "1.6",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Total focus time */}
      <div
        style={{
          background: "var(--bg-card)",
          border: isRetro ? "2px solid var(--border-primary)" : "1px solid var(--border-primary)",
          borderRadius: isRetro ? 0 : "var(--border-radius-lg)",
          padding: "16px",
          marginBottom: "24px",
          textAlign: "center",
          boxShadow: isRetro ? "none" : "var(--card-shadow)",
        }}
      >
        <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", marginBottom: "8px" }}>
          {s.totalFocusTime}
        </div>
        <div
          style={{
            fontSize: "clamp(16px, 4vw, 28px)",
            color: "var(--accent-longbreak)",
            textShadow: isRetro ? "0 0 10px rgba(0,212,255,0.5)" : "none",
            fontWeight: isRetro ? "normal" : 600,
          }}
        >
          {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
        </div>
        <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-dim)", marginTop: "4px" }}>
          ({totalMinutes} {s.minutes})
        </div>
      </div>

      {/* 7-Day Chart */}
      <div
        style={{
          background: "var(--bg-card)",
          border: isRetro ? "2px solid var(--border-primary)" : "1px solid var(--border-primary)",
          borderRadius: isRetro ? 0 : "var(--border-radius-lg)",
          padding: "20px",
          marginBottom: "24px",
          boxShadow: isRetro ? "none" : "var(--card-shadow)",
        }}
      >
        <div
          style={{
            fontSize: "var(--font-size-base)",
            color: "var(--accent-success)",
            marginBottom: "20px",
            textAlign: "center",
            fontWeight: isRetro ? "normal" : 600,
          }}
        >
          {s.last7Days}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-around",
            height: `${chartHeight + 30}px`,
            gap: "8px",
            padding: "0 8px",
          }}
        >
          {days.map((day, i) => {
            const barHeight =
              day.count > 0 ? Math.max((day.count / maxCount) * chartHeight, 12) : 4;
            const isToday = day.date === getToday();
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: day.count > 0 ? "var(--accent-success)" : "var(--text-dim)",
                    marginBottom: "4px",
                  }}
                >
                  {day.count}
                </div>
                <div
                  style={{
                    width: "100%",
                    maxWidth: "40px",
                    height: `${barHeight}px`,
                    background:
                      day.count > 0
                        ? isToday
                          ? isRetro
                            ? "linear-gradient(180deg, #ff6b35, #ff00ff)"
                            : "var(--accent-work)"
                          : isRetro
                          ? "linear-gradient(180deg, #00ff41, #00d4ff)"
                          : "var(--accent-success)"
                        : "var(--border-subtle)",
                    border:
                      day.count > 0
                        ? `1px solid ${isToday ? "var(--accent-work)" : "var(--accent-success)"}`
                        : "1px solid var(--border-primary)",
                    borderRadius: isRetro ? 0 : "4px 4px 0 0",
                    transition: "height 0.5s ease",
                    animation: day.count > 0 ? "barGrow 0.5s ease" : "none",
                    transformOrigin: "bottom",
                    boxShadow:
                      day.count > 0 && isRetro
                        ? `0 0 6px ${isToday ? "#ff6b3555" : "#00ff4155"}`
                        : "none",
                  }}
                />
                <div
                  style={{
                    fontSize: "var(--font-size-xs)",
                    color: isToday ? "var(--accent-work)" : "var(--text-muted)",
                    marginTop: "6px",
                    fontWeight: isToday && !isRetro ? 600 : "normal",
                  }}
                >
                  {day.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session Log */}
      <div
        style={{
          background: "var(--bg-card)",
          border: isRetro ? "2px solid var(--border-primary)" : "1px solid var(--border-primary)",
          borderRadius: isRetro ? 0 : "var(--border-radius-lg)",
          padding: "16px",
          boxShadow: isRetro ? "none" : "var(--card-shadow)",
        }}
      >
        <div
          style={{
            fontSize: "var(--font-size-base)",
            color: "var(--accent-longbreak)",
            marginBottom: "12px",
            fontWeight: isRetro ? "normal" : 600,
          }}
        >
          {s.sessionLog}
        </div>
        {sessionHistory.length === 0 ? (
          <div
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-dim)",
              textAlign: "center",
              padding: "24px",
              lineHeight: "2",
            }}
          >
            {s.noSessions}
            <br />
            {s.noSessionsSub}
          </div>
        ) : (
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            {[...sessionHistory].reverse().map((session, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px",
                  borderBottom: "1px solid var(--border-subtle)",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                <span style={{ color: "var(--accent-success)" }}>
                  {s.sessionEntry(sessionHistory.length - i)}
                </span>
                <span style={{ color: "var(--text-muted)" }}>
                  {new Date(session.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span style={{ color: "var(--accent-work)" }}>{session.duration}min</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
