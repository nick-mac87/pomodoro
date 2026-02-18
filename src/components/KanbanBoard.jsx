import { useTheme } from "../context/ThemeContext.jsx";

const COLUMNS = [
  { key: "todo", color: "var(--accent-longbreak)" },
  { key: "inProgress", color: "var(--accent-work)" },
  { key: "done", color: "var(--accent-success)" },
];

export default function KanbanBoard({
  tasks,
  focusedTaskId,
  isRunning,
  draggedTask,
  dragOverColumn,
  onMoveTask,
  onFocusTask,
  onDeleteTask,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onClose,
}) {
  const { isRetro, s } = useTheme();

  const colLabels = {
    todo: s.columnTodo,
    inProgress: s.columnInProgress,
    done: s.columnDone,
  };
  const colIcons = {
    todo: isRetro ? "\u2610" : "",
    inProgress: isRetro ? "\u25B6" : "",
    done: isRetro ? "\u2611" : "",
  };
  const emptyText = {
    todo: [s.emptyTodo, s.emptyTodoSub],
    inProgress: [s.emptyInProgress, s.emptyInProgressSub],
    done: [s.emptyDone, s.emptyDoneSub],
  };

  return (
    <div style={{ marginTop: "20px", animation: "slideIn 0.3s ease" }}>
      <div style={{ textAlign: "right", marginBottom: "12px" }}>
        <button
          className={isRetro ? "retro-btn" : "clean-btn"}
          onClick={onClose}
          style={{
            background: "var(--accent-muted-btn)",
            color: isRetro ? "var(--btn-primary-text)" : "#fff",
            fontSize: "var(--font-size-sm)",
            padding: "6px 12px",
          }}
        >
          {s.closeBoard}
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "16px",
        }}
      >
        {COLUMNS.map((col) => (
          <div
            key={col.key}
            onDragOver={(e) => onDragOver(e, col.key)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, col.key)}
            className={dragOverColumn === col.key ? "column-drop-target" : ""}
            style={{
              background: "var(--bg-card)",
              border: `${isRetro ? "2px" : "1px"} solid ${
                dragOverColumn === col.key ? "var(--accent-longbreak)" : "var(--border-subtle)"
              }`,
              borderRadius: isRetro ? 0 : "var(--border-radius-lg)",
              padding: "12px",
              minHeight: "200px",
              transition: "border-color 0.2s, background 0.2s",
              boxShadow: isRetro ? "none" : "var(--card-shadow)",
            }}
          >
            {/* Column header */}
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                color: col.color,
                marginBottom: "12px",
                paddingBottom: "8px",
                borderBottom: `${isRetro ? "2px" : "1px"} solid ${col.color}44`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: isRetro ? "normal" : 500,
              }}
            >
              <span>
                {colIcons[col.key]} {colLabels[col.key]}
              </span>
              <span
                style={{
                  background: col.color,
                  color: isRetro ? "var(--btn-primary-text)" : "#fff",
                  padding: "2px 6px",
                  fontSize: "var(--font-size-sm)",
                  borderRadius: isRetro ? 0 : "4px",
                }}
              >
                {tasks[col.key].length}
              </span>
            </div>

            {/* Tasks */}
            {tasks[col.key].map((task) => {
              const isFocused = focusedTaskId === task.id;
              return (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => onDragStart(col.key, task.id)}
                  onDragEnd={onDragEnd}
                  className={`task-card ${draggedTask?.taskId === task.id ? "dragging" : ""}`}
                  style={{
                    background: isFocused
                      ? isRetro ? "rgba(255,0,255,0.1)" : "var(--bg-secondary)"
                      : isRetro ? "var(--bg-secondary)" : "var(--bg-secondary)",
                    border: `${isRetro ? "2px" : "1px"} solid ${
                      isFocused ? "var(--accent-focus)" : "var(--border-subtle)"
                    }`,
                    borderRadius: isRetro ? 0 : "var(--border-radius)",
                    padding: "10px",
                    marginBottom: "8px",
                    cursor: "grab",
                    position: "relative",
                    boxShadow: isFocused && isRetro ? "0 0 8px rgba(255,0,255,0.3)" : "none",
                  }}
                >
                  <div
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: isFocused ? "var(--accent-focus)" : "var(--text-secondary)",
                      marginBottom: "8px",
                      lineHeight: "1.6",
                      wordBreak: "break-word",
                    }}
                  >
                    {isFocused && isRetro && (
                      <span
                        style={{
                          marginRight: "4px",
                          animation: isRunning ? "blink 1s infinite" : "none",
                        }}
                      >
                        {"\u25C9"}
                      </span>
                    )}
                    {task.text}
                  </div>

                  <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {col.key !== "todo" && (
                      <button
                        className={isRetro ? "retro-btn" : "clean-btn"}
                        onClick={() =>
                          onMoveTask(col.key, col.key === "done" ? "inProgress" : "todo", task.id)
                        }
                        style={{
                          background: "var(--accent-muted-btn)",
                          color: isRetro ? "var(--btn-primary-text)" : "#fff",
                          fontSize: "var(--font-size-xs)",
                          padding: "4px 6px",
                        }}
                      >
                        {"\u25C0"}
                      </button>
                    )}
                    {col.key !== "done" && (
                      <button
                        className={isRetro ? "retro-btn" : "clean-btn"}
                        onClick={() =>
                          onMoveTask(col.key, col.key === "todo" ? "inProgress" : "done", task.id)
                        }
                        style={{
                          background: "var(--accent-muted-btn)",
                          color: isRetro ? "var(--btn-primary-text)" : "#fff",
                          fontSize: "var(--font-size-xs)",
                          padding: "4px 6px",
                        }}
                      >
                        {"\u25B6"}
                      </button>
                    )}
                    <button
                      className={isRetro ? "retro-btn" : "clean-btn"}
                      onClick={() => onFocusTask(task.id)}
                      style={{
                        background: isFocused ? "var(--accent-focus)" : isRetro ? "var(--accent-focus)" : "var(--accent-focus)",
                        color: isRetro ? "var(--btn-primary-text)" : "#fff",
                        fontSize: "var(--font-size-xs)",
                        padding: "4px 6px",
                        opacity: isFocused ? 1 : 0.7,
                      }}
                    >
                      {isFocused ? s.focused : s.focus}
                    </button>
                    <button
                      className={isRetro ? "retro-btn" : "clean-btn"}
                      onClick={() => onDeleteTask(col.key, task.id)}
                      style={{
                        background: "var(--accent-danger)",
                        color: isRetro ? "var(--btn-primary-text)" : "#fff",
                        fontSize: "var(--font-size-xs)",
                        padding: "4px 6px",
                        marginLeft: "auto",
                      }}
                    >
                      {"\u2716"}
                    </button>
                  </div>
                </div>
              );
            })}

            {tasks[col.key].length === 0 && (
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  color: "var(--text-dim)",
                  textAlign: "center",
                  padding: "24px 8px",
                  lineHeight: "1.8",
                }}
              >
                {emptyText[col.key][0]}
                {emptyText[col.key][1] && (
                  <>
                    <br />
                    {emptyText[col.key][1]}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
