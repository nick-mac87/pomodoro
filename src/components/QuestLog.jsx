import { useTheme } from "../context/ThemeContext.jsx";

export default function QuestLog({
  focusedTask,
  focusedTaskId,
  isRunning,
  questLogTasks,
  doneTasks,
  newTaskText,
  setNewTaskText,
  showFullBoard,
  onAddTask,
  onFocusTask,
  onQuickComplete,
  onToggleBoard,
}) {
  const { isRetro, s } = useTheme();
  const maxDoneShown = 3;

  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: isRetro ? "2px solid var(--border-primary)" : "1px solid var(--border-primary)",
        borderRadius: isRetro ? 0 : "var(--border-radius-lg)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        minHeight: "400px",
        boxShadow: isRetro ? "none" : "var(--card-shadow)",
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: "var(--font-size-md)",
          color: "var(--accent-longbreak)",
          marginBottom: "12px",
          paddingBottom: "8px",
          borderBottom: isRetro ? "2px solid var(--border-subtle)" : "1px solid var(--border-primary)",
          letterSpacing: isRetro ? "2px" : "0.5px",
          fontWeight: isRetro ? "normal" : 600,
        }}
      >
        {s.questLog}
      </div>

      {/* Current task banner */}
      {focusedTask ? (
        <div
          style={{
            border: isRetro
              ? "2px solid var(--accent-focus)"
              : "1px solid var(--accent-focus)",
            background: isRetro ? "rgba(255,0,255,0.08)" : "var(--bg-secondary)",
            borderRadius: isRetro ? 0 : "var(--border-radius)",
            padding: "10px 12px",
            marginBottom: "12px",
            animation: isRetro && isRunning ? "focusGlow 2s infinite" : "none",
          }}
        >
          <div
            style={{
              fontSize: "var(--font-size-xs)",
              color: "var(--accent-focus)",
              marginBottom: "4px",
              letterSpacing: isRetro ? "2px" : "0.5px",
              fontWeight: isRetro ? "normal" : 500,
            }}
          >
            {s.currentQuest}
          </div>
          <div
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-primary)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {focusedTask.text}
          </div>
        </div>
      ) : (
        <div
          style={{
            border: isRetro ? "2px dashed var(--text-muted)" : "1px dashed var(--border-primary)",
            borderRadius: isRetro ? 0 : "var(--border-radius)",
            padding: "12px",
            marginBottom: "12px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "var(--font-size-sm)", color: "var(--text-muted)", lineHeight: "2" }}>
            {s.clickToFocus}
          </div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-dim)" }}>
            {s.focusSubtext}
          </div>
        </div>
      )}

      {/* Add task input */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
        <input
          className={isRetro ? "retro-input" : "clean-input"}
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAddTask()}
          placeholder={s.newTaskPlaceholder}
          style={{ flex: 1, minWidth: 0, fontSize: "var(--font-size-sm)", padding: "8px 10px" }}
        />
        <button
          className={isRetro ? "retro-btn" : "clean-btn"}
          onClick={onAddTask}
          style={{
            background: "var(--accent-success)",
            color: isRetro ? "var(--btn-primary-text)" : "#fff",
            fontSize: "var(--font-size-lg)",
            padding: "8px 12px",
            lineHeight: 1,
          }}
        >
          +
        </button>
      </div>

      {/* Task list */}
      <div style={{ flex: 1, overflowY: "auto", marginBottom: "12px" }}>
        {questLogTasks.length === 0 && doneTasks.length === 0 && (
          <div
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--text-dim)",
              textAlign: "center",
              padding: "24px 8px",
              lineHeight: "2",
            }}
          >
            {s.noTasks}
            <br />
            {s.noTasksSub}
          </div>
        )}
        {questLogTasks.map((task) => {
          const isFocused = focusedTaskId === task.id;
          const isInProg = task.col === "inProgress";
          return (
            <div
              key={task.id}
              onClick={() => onFocusTask(task.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 10px",
                marginBottom: "4px",
                background: isFocused
                  ? isRetro ? "rgba(255,0,255,0.1)" : "var(--bg-secondary)"
                  : isRetro ? "var(--bg-secondary)" : "transparent",
                border: isFocused
                  ? isRetro ? "2px solid var(--accent-focus)" : "1px solid var(--accent-focus)"
                  : isRetro ? "2px solid var(--border-subtle)" : "1px solid transparent",
                borderRadius: isRetro ? 0 : "var(--border-radius)",
                cursor: "pointer",
                transition: "all 0.15s",
                boxShadow: isFocused && isRetro ? "0 0 8px rgba(255,0,255,0.3)" : "none",
              }}
            >
              <span
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: isFocused
                    ? "var(--accent-focus)"
                    : isInProg
                    ? "var(--accent-work)"
                    : "var(--text-muted)",
                  flexShrink: 0,
                  animation: isFocused && isRunning && isRetro ? "blink 1s infinite" : "none",
                }}
              >
                {isFocused ? "\u25CF" : isInProg ? "\u25B6" : isRetro ? "\u2610" : "\u25CB"}
              </span>
              <span
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: isFocused ? "var(--accent-focus)" : "var(--text-secondary)",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {task.text}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickComplete(task.id);
                }}
                style={{
                  background: "none",
                  border: isRetro
                    ? "2px solid var(--accent-success)"
                    : "1px solid var(--accent-success)",
                  color: "var(--accent-success)",
                  fontFamily: "var(--font-primary)",
                  fontSize: "var(--font-size-sm)",
                  padding: "2px 6px",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "all 0.1s",
                  borderRadius: isRetro ? 0 : "4px",
                }}
              >
                {"\u2713"}
              </button>
            </div>
          );
        })}

        {/* Done tasks */}
        {doneTasks.length > 0 && (
          <div style={{ marginTop: "8px" }}>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-dim)",
                marginBottom: "4px",
                paddingTop: "4px",
                borderTop: "1px solid var(--border-subtle)",
                letterSpacing: isRetro ? "1px" : "0.3px",
              }}
            >
              {isRetro ? "\u2611" : "\u2713"} {s.completed} ({doneTasks.length})
            </div>
            {doneTasks.slice(0, maxDoneShown).map((task) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "4px 10px",
                  marginBottom: "2px",
                  opacity: 0.4,
                }}
              >
                <span style={{ fontSize: "var(--font-size-sm)", color: "var(--accent-success)" }}>
                  {isRetro ? "\u2611" : "\u2713"}
                </span>
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    color: "var(--text-muted)",
                    textDecoration: "line-through",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {task.text}
                </span>
              </div>
            ))}
            {doneTasks.length > maxDoneShown && (
              <div
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-dim)",
                  padding: "4px 10px",
                }}
              >
                +{doneTasks.length - maxDoneShown} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toggle board */}
      <button
        className={isRetro ? "retro-btn" : "clean-btn"}
        onClick={onToggleBoard}
        style={{
          background: showFullBoard
            ? "var(--accent-work)"
            : isRetro ? "var(--border-primary)" : "var(--btn-secondary-bg)",
          color: showFullBoard
            ? isRetro ? "var(--btn-primary-text)" : "#fff"
            : isRetro ? "var(--text-primary)" : "var(--btn-secondary-text)",
          fontSize: "var(--font-size-sm)",
          padding: "8px 12px",
          width: "100%",
          textAlign: "center",
          border: !isRetro && !showFullBoard ? "1px solid var(--border-primary)" : "none",
        }}
      >
        {showFullBoard ? s.closeBoard : s.openBoard}
      </button>
    </div>
  );
}
