// Progress shape and merge logic, shared by the browser and the API server.
// Pure functions only, no imports, so both sides can use it.

export interface QuizResult { best: number; last: number; total: number; attempts: number; at: number }
export interface AssignmentState { checked: number[]; done: boolean; notes: string; at?: number }
export interface FinalState {
  score: number; total: number; passed: boolean; at: number; attempts: number;
}
export type Track = 'new' | 'some' | 'pro';
export type Goal = 'basics' | 'client' | 'career';
export type TimeBudget = 'light' | 'steady' | 'focused';
/** Answers to the first sign-in questions. They only shape recommendations; nothing is ever locked. */
export interface Profile { goal: Goal | null; time: TimeBudget | null; done: boolean; at: number }
export interface ProgressData {
  theme: 'light' | 'dark';
  track: Track | null; // starting level picked on the Start page
  profile: Profile;
  lessonsViewed: Record<string, number>;
  lessonsManual: Record<string, boolean>;
  quiz: Record<string, QuizResult>;
  exercises: Record<string, { done: boolean; attempts: number }>;
  assignments: Record<string, AssignmentState>;
  final: FinalState | null;
  finalPractical: Record<string, number[]>;
  days: string[];
  history: { t: number; text: string }[];
}

export const emptyProgress = (theme: 'light' | 'dark' = 'light'): ProgressData => ({
  theme, track: null, profile: { goal: null, time: null, done: false, at: 0 }, lessonsViewed: {}, lessonsManual: {}, quiz: {}, exercises: {}, assignments: {},
  final: null, finalPractical: {}, days: [], history: [],
});

const isObj = (v: unknown): v is Record<string, any> => typeof v === 'object' && v !== null && !Array.isArray(v);
const union = (a: number[] = [], b: number[] = []) => [...new Set([...a, ...b])].sort((x, y) => x - y);

function sanitizeProfile(v: unknown): Profile {
  if (!isObj(v)) return { goal: null, time: null, done: false, at: 0 };
  return {
    goal: v.goal === 'basics' || v.goal === 'client' || v.goal === 'career' ? v.goal : null,
    time: v.time === 'light' || v.time === 'steady' || v.time === 'focused' ? v.time : null,
    done: v.done === true,
    at: typeof v.at === 'number' && Number.isFinite(v.at) ? v.at : 0,
  };
}

/** Defensive normaliser: never trust stored or incoming data. */
export function sanitize(input: unknown): ProgressData {
  const base = emptyProgress();
  if (!isObj(input)) return base;
  const rec = (v: unknown) => (isObj(v) ? v : {});
  return {
    theme: input.theme === 'dark' ? 'dark' : 'light',
    track: input.track === 'new' || input.track === 'some' || input.track === 'pro' ? input.track : null,
    profile: sanitizeProfile(input.profile),
    lessonsViewed: rec(input.lessonsViewed),
    lessonsManual: rec(input.lessonsManual),
    quiz: rec(input.quiz) as ProgressData['quiz'],
    exercises: rec(input.exercises) as ProgressData['exercises'],
    assignments: rec(input.assignments) as ProgressData['assignments'],
    final: isObj(input.final) ? (input.final as unknown as FinalState) : null,
    finalPractical: rec(input.finalPractical) as ProgressData['finalPractical'],
    days: Array.isArray(input.days) ? input.days.filter((d): d is string => typeof d === 'string').slice(-800) : [],
    history: Array.isArray(input.history) ? (input.history.filter((h) => isObj(h) && typeof h.t === 'number' && typeof h.text === 'string').slice(0, 150) as ProgressData['history']) : [],
  };
}

/** Merge two progress records without losing anything either side has earned. */
export function mergeProgress(a: ProgressData, b: ProgressData): ProgressData {
  const out = emptyProgress(a.theme);
  out.track = a.track ?? b.track;
  // The most recently saved answers win, so changing them on one device carries to the others.
  out.profile = a.profile.done && (!b.profile.done || a.profile.at >= b.profile.at) ? a.profile : b.profile;
  for (const k of new Set([...Object.keys(a.lessonsViewed), ...Object.keys(b.lessonsViewed)]))
    out.lessonsViewed[k] = Math.min(a.lessonsViewed[k] ?? Infinity, b.lessonsViewed[k] ?? Infinity);
  for (const k of new Set([...Object.keys(a.lessonsManual), ...Object.keys(b.lessonsManual)]))
    out.lessonsManual[k] = !!(a.lessonsManual[k] || b.lessonsManual[k]);
  for (const k of new Set([...Object.keys(a.quiz), ...Object.keys(b.quiz)])) {
    const x = a.quiz[k], y = b.quiz[k];
    if (!x || !y) { out.quiz[k] = (x ?? y) as QuizResult; continue; }
    const newer = x.at >= y.at ? x : y;
    // best is only comparable when totals match; otherwise keep the better ratio
    const better = x.best / x.total >= y.best / y.total ? x : y;
    out.quiz[k] = { best: better.best, total: better.total, last: newer.last, at: newer.at, attempts: Math.max(x.attempts, y.attempts) };
  }
  for (const k of new Set([...Object.keys(a.exercises), ...Object.keys(b.exercises)])) {
    const x = a.exercises[k], y = b.exercises[k];
    out.exercises[k] = { done: !!(x?.done || y?.done), attempts: Math.max(x?.attempts ?? 0, y?.attempts ?? 0) };
  }
  for (const k of new Set([...Object.keys(a.assignments), ...Object.keys(b.assignments)])) {
    const x = a.assignments[k], y = b.assignments[k];
    if (!x || !y) { out.assignments[k] = (x ?? y) as AssignmentState; continue; }
    const done = x.done || y.done;
    out.assignments[k] = {
      checked: union(x.checked, y.checked), done,
      notes: (x.at ?? 0) >= (y.at ?? 0) && x.notes ? x.notes : y.notes || x.notes,
      at: done ? Math.min(x.at ?? Infinity, y.at ?? Infinity) || undefined : undefined,
    };
    if (out.assignments[k].at === Infinity) out.assignments[k].at = undefined;
  }
  if (a.final && b.final) {
    const better = a.final.passed !== b.final.passed ? (a.final.passed ? a.final : b.final)
      : a.final.score / a.final.total >= b.final.score / b.final.total ? a.final : b.final;
    out.final = { ...better, passed: a.final.passed || b.final.passed, attempts: Math.max(a.final.attempts, b.final.attempts) };
  } else out.final = a.final ?? b.final;
  for (const k of new Set([...Object.keys(a.finalPractical), ...Object.keys(b.finalPractical)]))
    out.finalPractical[k] = union(a.finalPractical[k], b.finalPractical[k]);
  out.days = [...new Set([...a.days, ...b.days])].sort();
  const seen = new Set<string>();
  out.history = [...a.history, ...b.history]
    .sort((x, y) => y.t - x.t)
    .filter((h) => { const key = h.t + h.text; if (seen.has(key)) return false; seen.add(key); return true; })
    .slice(0, 150);
  return out;
}

export function sameProgress(a: ProgressData, b: ProgressData): boolean {
  return JSON.stringify({ ...a, theme: '' }) === JSON.stringify({ ...b, theme: '' });
}
