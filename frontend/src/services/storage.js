const STORAGE_KEY = 'ai-quest-student-state';

export function readStudentState() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

export function writeStudentState(nextState) {
  const current = readStudentState();
  const next = { ...current, ...nextState };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearStudentState() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export const DEFAULT_CAPTION = "I discovered my AI Builder identity with AI Quest by NIAT! I'm exploring AI tools and building my AI project. Join me on this seven-day journey.";
