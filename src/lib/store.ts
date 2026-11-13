import { useSyncExternalStore } from 'react';

const KEY = 'cca-progress-v1';

export interface QuizResult { best: number; last: number; total: number; attempts: number; at: number }
export interface AssignmentState { checked: number[]; done: boolean; notes: string; at?: number }
export interface FinalState {
  score: number; total: number; passed: boolean; at: number; attempts: number;
  practical: Record<string, number[]>;
}
export interface Progress {
  theme: 'light' | 'dark';
  lessonsViewed: Record<string, number>;
  lessonsManual: Record<string, boolean>;
  quiz: Record<string, QuizResult>;
  exercises: Record<string, { done: boolean; attempts: number }>;
  assignments: Record<string, AssignmentState>;
  final: FinalState | null;
  finalPractical: Record<string, number[]>;
  days: string[]; // active days, YYYY-MM-DD
  history: { t: number; text: string }[];
}

const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;

const empty = (): Progress => ({
  theme: prefersDark ? 'dark' : 'light',
  lessonsViewed: {}, lessonsManual: {}, quiz: {}, exercises: {}, assignments: {},
  final: null, finalPractical: {}, days: [], history: [],
});

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...empty(), ...JSON.parse(raw) };
  } catch { /* storage unavailable */ }
  return empty();
}

let state: Progress = load();
const subs = new Set<() => void>();

function today(d = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function commit(next: Progress, log?: string) {
  const t = Date.now();
  const days = next.days.includes(today()) ? next.days : [...next.days, today()];
  const history = log ? [{ t, text: log }, ...next.history].slice(0, 150) : next.history;
  state = { ...next, days, history };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  subs.forEach((f) => f());
}

export function useProgress(): Progress {
  return useSyncExternalStore(
    (cb) => { subs.add(cb); return () => { subs.delete(cb); }; },
    () => state,
  );
}

export const actions = {
  setTheme(theme: 'light' | 'dark') { commit({ ...state, theme }); },
  viewLesson(id: string, title: string) {
    const first = !state.lessonsViewed[id];
    commit({ ...state, lessonsViewed: { ...state.lessonsViewed, [id]: Date.now() } }, first ? `Started lesson: ${title}` : undefined);
  },
  markLesson(id: string, title: string, done: boolean) {
    commit({ ...state, lessonsManual: { ...state.lessonsManual, [id]: done } }, done ? `Completed lesson: ${title}` : undefined);
  },
  recordQuiz(id: string, title: string, score: number, total: number) {
    const prev = state.quiz[id];
    const r: QuizResult = {
      best: Math.max(prev?.best ?? 0, score), last: score, total,
      attempts: (prev?.attempts ?? 0) + 1, at: Date.now(),
    };
    commit({ ...state, quiz: { ...state.quiz, [id]: r } }, `Quiz ${score}/${total}: ${title}`);
  },
  recordExercise(id: string, title: string, ok: boolean) {
    const prev = state.exercises[id] ?? { done: false, attempts: 0 };
    const first = ok && !prev.done;
    commit(
      { ...state, exercises: { ...state.exercises, [id]: { done: prev.done || ok, attempts: prev.attempts + 1 } } },
      first ? `Solved exercise: ${title}` : undefined,
    );
  },
  toggleCheck(id: string, idx: number) {
    const a = state.assignments[id] ?? { checked: [], done: false, notes: '' };
    const checked = a.checked.includes(idx) ? a.checked.filter((i) => i !== idx) : [...a.checked, idx];
    commit({ ...state, assignments: { ...state.assignments, [id]: { ...a, checked, done: a.done && false } } });
  },
  setNotes(id: string, notes: string) {
    const a = state.assignments[id] ?? { checked: [], done: false, notes: '' };
    commit({ ...state, assignments: { ...state.assignments, [id]: { ...a, notes } } });
  },
  completeAssignment(id: string, title: string, done: boolean) {
    const a = state.assignments[id] ?? { checked: [], done: false, notes: '' };
    commit(
      { ...state, assignments: { ...state.assignments, [id]: { ...a, done, at: done ? Date.now() : undefined } } },
      done ? `Completed assignment: ${title}` : undefined,
    );
  },
  togglePractical(taskId: string, idx: number) {
    const cur = state.finalPractical[taskId] ?? [];
    const next = cur.includes(idx) ? cur.filter((i) => i !== idx) : [...cur, idx];
    commit({ ...state, finalPractical: { ...state.finalPractical, [taskId]: next } });
  },
  saveFinal(score: number, total: number, passMark: number) {
    const pct = total ? Math.round((score / total) * 100) : 0;
    const prev = state.final;
    const passed = pct >= passMark || (prev?.passed ?? false);
    commit(
      {
        ...state,
        final: { score, total, passed, at: Date.now(), attempts: (prev?.attempts ?? 0) + 1, practical: {} },
      },
      `Final assessment theory: ${score}/${total} (${pct}%)`,
    );
  },
  reset() {
    const theme = state.theme;
    commit({ ...empty(), theme });
  },
};

export function streak(days: string[]): { current: number; best: number } {
  const set = new Set(days);
  const sorted = [...set].sort();
  let best = 0, run = 0, prev: Date | null = null;
  for (const s of sorted) {
    const d = new Date(s + 'T00:00:00');
    run = prev && Math.round((d.getTime() - prev.getTime()) / 86400000) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = d;
  }
  let current = 0;
  const cur = new Date();
  if (!set.has(today(cur))) cur.setDate(cur.getDate() - 1);
  while (set.has(today(cur))) { current++; cur.setDate(cur.getDate() - 1); }
  return { current, best };
}
