const STORAGE_VERSION = 1;

export function migrateStorage() {
  try {
    const version = JSON.parse(
      localStorage.getItem("pixelpomo-version") || "0"
    );
    if (version < STORAGE_VERSION) {
      localStorage.setItem(
        "pixelpomo-version",
        JSON.stringify(STORAGE_VERSION)
      );
    }
  } catch {
    clearAllData();
  }
}

export function clearAllData() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith("pixelpomo-"))
    .forEach((k) => localStorage.removeItem(k));
}

export function validateTasks(data) {
  if (!data || typeof data !== "object") return null;
  const { todo, inProgress, done } = data;
  if (
    !Array.isArray(todo) ||
    !Array.isArray(inProgress) ||
    !Array.isArray(done)
  )
    return null;
  const valid = (arr) =>
    arr.every((t) => typeof t.id === "number" && typeof t.text === "string");
  if (!valid(todo) || !valid(inProgress) || !valid(done)) return null;
  return data;
}
