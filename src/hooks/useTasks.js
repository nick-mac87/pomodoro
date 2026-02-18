import { useState, useRef, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage.js";

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage("pixelpomo-tasks", {
    todo: [],
    inProgress: [],
    done: [],
  });
  const [newTaskText, setNewTaskText] = useState("");
  const [focusedTaskId, setFocusedTaskId] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const nextTaskId = useRef(
    Math.max(
      0,
      ...tasks.todo.map((t) => t.id),
      ...tasks.inProgress.map((t) => t.id),
      ...tasks.done.map((t) => t.id)
    ) + 1
  );

  const addTask = useCallback(() => {
    if (!newTaskText.trim()) return;
    const id = nextTaskId.current++;
    const shouldAutoFocus = focusedTaskId === null;
    setTasks((prev) => ({
      ...prev,
      todo: [...prev.todo, { id, text: newTaskText.trim(), createdAt: Date.now() }],
    }));
    if (shouldAutoFocus) setFocusedTaskId(id);
    setNewTaskText("");
    return id;
  }, [newTaskText, focusedTaskId, setTasks]);

  const deleteTask = useCallback(
    (column, taskId) => {
      if (focusedTaskId === taskId) setFocusedTaskId(null);
      setTasks((prev) => ({
        ...prev,
        [column]: prev[column].filter((t) => t.id !== taskId),
      }));
    },
    [focusedTaskId, setTasks]
  );

  const moveTask = useCallback(
    (fromCol, toCol, taskId) => {
      setTasks((prev) => {
        const task = prev[fromCol].find((t) => t.id === taskId);
        if (!task) return prev;
        return {
          ...prev,
          [fromCol]: prev[fromCol].filter((t) => t.id !== taskId),
          [toCol]: [...prev[toCol], task],
        };
      });
    },
    [setTasks]
  );

  const quickComplete = useCallback(
    (taskId) => {
      if (focusedTaskId === taskId) setFocusedTaskId(null);
      setTasks((prev) => {
        let task = null;
        let fromCol = null;
        for (const col of ["todo", "inProgress"]) {
          const found = prev[col].find((t) => t.id === taskId);
          if (found) {
            task = found;
            fromCol = col;
            break;
          }
        }
        if (!task) return prev;
        return {
          ...prev,
          [fromCol]: prev[fromCol].filter((t) => t.id !== taskId),
          done: [...prev.done, task],
        };
      });
    },
    [focusedTaskId, setTasks]
  );

  const completeFocusedTask = useCallback(() => {
    if (focusedTaskId === null) return;
    setTasks((prev) => {
      let task = null;
      let fromCol = null;
      for (const col of ["todo", "inProgress", "done"]) {
        const found = prev[col].find((t) => t.id === focusedTaskId);
        if (found) {
          task = found;
          fromCol = col;
          break;
        }
      }
      if (!task || fromCol === "done") return prev;
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter((t) => t.id !== focusedTaskId),
        done: [...prev.done, task],
      };
    });
    setFocusedTaskId(null);
  }, [focusedTaskId, setTasks]);

  const focusTask = useCallback(
    (taskId) => {
      setFocusedTaskId((prev) => (prev === taskId ? null : taskId));
    },
    []
  );

  const getFocusedTask = useCallback(() => {
    for (const col of ["todo", "inProgress", "done"]) {
      const t = tasks[col].find((t) => t.id === focusedTaskId);
      if (t) return t;
    }
    return null;
  }, [tasks, focusedTaskId]);

  // Drag and drop
  const handleDragStart = (column, taskId) => setDraggedTask({ column, taskId });
  const handleDragOver = (e, column) => {
    e.preventDefault();
    setDragOverColumn(column);
  };
  const handleDragLeave = () => setDragOverColumn(null);
  const handleDrop = (e, toCol) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (draggedTask && draggedTask.column !== toCol) {
      moveTask(draggedTask.column, toCol, draggedTask.taskId);
    }
    setDraggedTask(null);
  };
  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // Computed values
  const doneTotal = tasks.done.length;
  const allTotal = tasks.todo.length + tasks.inProgress.length + tasks.done.length;
  const questLogTasks = [
    ...tasks.inProgress.map((t) => ({ ...t, col: "inProgress" })),
    ...tasks.todo.map((t) => ({ ...t, col: "todo" })),
  ];
  const doneTasks = tasks.done.map((t) => ({ ...t, col: "done" }));

  return {
    tasks,
    newTaskText,
    setNewTaskText,
    focusedTaskId,
    setFocusedTaskId,
    draggedTask,
    dragOverColumn,
    doneTotal,
    allTotal,
    questLogTasks,
    doneTasks,

    addTask,
    deleteTask,
    moveTask,
    quickComplete,
    completeFocusedTask,
    focusTask,
    getFocusedTask,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
}
