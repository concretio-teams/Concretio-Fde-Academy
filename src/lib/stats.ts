import { allLessons, allAssignments, modules } from '../content';
import type { Lesson, Module } from '../content/types';
import type { Progress } from './store';

export const LESSON_PASS_PCT = 70;

export function lessonDone(p: Progress, l: Lesson): boolean {
  if (l.quiz.length === 0) return !!p.lessonsManual[l.id];
  const q = p.quiz[l.id];
  return !!q && (q.best / q.total) * 100 >= LESSON_PASS_PCT;
}

export interface ModuleStats {
  lessonsDone: number; lessonsTotal: number;
  assignmentsDone: number; assignmentsTotal: number;
  quizAvg: number | null; pct: number; complete: boolean; started: boolean;
}

export function moduleStats(p: Progress, m: Module): ModuleStats {
  const lessonsDone = m.lessons.filter((l) => lessonDone(p, l)).length;
  const assignmentsDone = m.assignments.filter((a) => p.assignments[a.id]?.done).length;
  const scores = m.lessons.map((l) => p.quiz[l.id]).filter(Boolean).map((q) => (q.best / q.total) * 100);
  const total = m.lessons.length + m.assignments.length;
  const done = lessonsDone + assignmentsDone;
  const started = m.lessons.some((l) => p.lessonsViewed[l.id] || p.quiz[l.id]) || assignmentsDone > 0;
  return {
    lessonsDone, lessonsTotal: m.lessons.length,
    assignmentsDone, assignmentsTotal: m.assignments.length,
    quizAvg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
    pct: total ? Math.round((done / total) * 100) : 0,
    complete: total > 0 && done === total,
    started,
  };
}

export function overall(p: Progress) {
  const lessons = allLessons.filter((x) => lessonDone(p, x.lesson)).length;
  const assigns = allAssignments.filter((x) => p.assignments[x.assignment.id]?.done).length;
  const finalDone = p.final?.passed ? 1 : 0;
  const total = allLessons.length + allAssignments.length + 1;
  const done = lessons + assigns + finalDone;
  return { lessons, assigns, finalDone, total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function skillLevels(p: Progress): { skill: string; pct: number; level: string }[] {
  const map = new Map<string, number[]>();
  for (const m of modules) {
    const s = moduleStats(p, m);
    const blend = s.quizAvg === null ? s.pct * 0.6 : s.pct * 0.6 + s.quizAvg * 0.4 * (s.pct > 0 ? 1 : 0);
    for (const sk of m.skills) map.set(sk, [...(map.get(sk) ?? []), blend]);
  }
  return [...map.entries()].map(([skill, v]) => {
    const pct = Math.round(v.reduce((a, b) => a + b, 0) / v.length);
    const level = pct >= 85 ? 'Expert' : pct >= 60 ? 'Proficient' : pct >= 25 ? 'Practitioner' : pct > 0 ? 'Novice' : 'Not started';
    return { skill, pct, level };
  });
}

export function recommended(p: Progress) {
  // first lesson not done whose module prerequisites are satisfied (or any first not done)
  for (const x of allLessons) {
    if (lessonDone(p, x.lesson)) continue;
    return x;
  }
  return null;
}

export interface NextAction { label: string; why: string; href: string; step: 'Learn' | 'Practice' | 'Prove' }

/** The single best next thing to do, module by module: lesson, then its quiz, then its assignment, finally the exam. */
export function nextAction(p: Progress): NextAction {
  for (const m of modules) {
    for (const l of m.lessons) {
      if (lessonDone(p, l)) continue;
      const q = p.quiz[l.id];
      if (q) return { step: 'Learn', label: `Retake quiz: ${l.title}`, why: `You scored ${q.best}/${q.total}. Reach ${LESSON_PASS_PCT}% to complete it.`, href: `#/lesson/${l.id}/quiz` };
      if (p.lessonsViewed[l.id]) return { step: 'Learn', label: `Continue: ${l.title}`, why: `Module ${m.number}. Finish the lesson, then take its quiz.`, href: `#/lesson/${l.id}` };
      return { step: 'Learn', label: `${Object.keys(p.lessonsViewed).length ? 'Next lesson' : 'Start here'}: ${l.title}`, why: `Module ${m.number}: ${m.title}. About ${l.minutes} minutes.`, href: `#/lesson/${l.id}` };
    }
    const a = m.assignments.find((x) => !p.assignments[x.id]?.done);
    if (a) return { step: 'Practice', label: `Assignment: ${a.title}`, why: `Apply Module ${m.number} on real code.`, href: `#/assignments/${a.id}` };
  }
  if (!p.final?.passed) return { step: 'Prove', label: 'Take the final assessment', why: 'Show you can use Claude Code on real work.', href: '#/final' };
  return { step: 'Prove', label: 'Review your progress', why: 'You have completed the academy.', href: '#/progress' };
}

export function unmetRequirements(p: Progress, m: Module): Module[] {
  return m.requires
    .map((id) => modules.find((x) => x.id === id))
    .filter((x): x is Module => !!x && !moduleStats(p, x).complete && moduleStats(p, x).lessonsDone < x.lessons.length);
}
