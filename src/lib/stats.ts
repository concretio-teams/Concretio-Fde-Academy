import { allLessons, allAssignments, allExercises, modules } from '../content';
import type { Assignment } from '../content/types';
import type { Lesson, Module } from '../content/types';
import type { Progress } from './store';
import { GOALS, TRACKS } from './tracks';

export const LESSON_PASS_PCT = 70;

/** Day 1 proof: the Module 2 assignment, done with evidence of a real Claude Code session. Modules 3 and later expect it. */
export const DAY1_ID = 'm2-a1';
export const day1Done = (p: Progress): boolean => !!p.assignments[DAY1_ID]?.done;

export function lessonDone(p: Progress, l: Lesson): boolean {
  if (l.quiz.length === 0) return !!p.lessonsManual[l.id];
  const q = p.quiz[l.id];
  return !!q && (q.best / q.total) * 100 >= LESSON_PASS_PCT;
}

export interface ModuleStats {
  lessonsDone: number; lessonsTotal: number;
  assignmentsDone: number; assignmentsTotal: number;
  exercisesDone: number; exercisesTotal: number;
  quizAvg: number | null; pct: number; complete: boolean; started: boolean;
}

/** Partial credit, so ticking the steps of an assignment moves the bar before it is marked complete. */
export function assignmentCredit(p: Progress, a: Assignment): number {
  const st = p.assignments[a.id];
  if (!st) return 0;
  if (st.done) return 1;
  return a.checklist.length ? Math.min(0.9, (st.checked.length / a.checklist.length) * 0.9) : 0;
}

/** 100 only when everything is truly done; otherwise at most 99 so rounding never lies. */
const pctOf = (earned: number, total: number, complete: boolean) =>
  total ? (complete ? 100 : Math.min(99, Math.floor((earned / total) * 100))) : 0;

/** Progress counts every kind of task: quizzes passed, exercises solved, assignments and the final exam. */
export function moduleStats(p: Progress, m: Module): ModuleStats {
  const lessonsDone = m.lessons.filter((l) => lessonDone(p, l)).length;
  const assignmentsDone = m.assignments.filter((a) => p.assignments[a.id]?.done).length;
  const mex = allExercises.filter((x) => x.module.id === m.id);
  const exercisesDone = mex.filter((x) => p.exercises[x.exercise.id]?.done).length;
  const scores = m.lessons.map((l) => p.quiz[l.id]).filter(Boolean).map((q) => (q.best / q.total) * 100);
  const total = m.lessons.length + m.assignments.length + mex.length;
  const earned = lessonsDone + exercisesDone + m.assignments.reduce((a, x) => a + assignmentCredit(p, x), 0);
  const complete = total > 0 && lessonsDone === m.lessons.length && assignmentsDone === m.assignments.length && exercisesDone === mex.length;
  const started = m.lessons.some((l) => p.lessonsViewed[l.id] || p.quiz[l.id]) || assignmentsDone > 0 || exercisesDone > 0;
  return {
    lessonsDone, lessonsTotal: m.lessons.length,
    assignmentsDone, assignmentsTotal: m.assignments.length,
    exercisesDone, exercisesTotal: mex.length,
    quizAvg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
    pct: pctOf(earned, total, complete),
    complete, started,
  };
}

export function overall(p: Progress) {
  const lessons = allLessons.filter((x) => lessonDone(p, x.lesson)).length;
  const assigns = allAssignments.filter((x) => p.assignments[x.assignment.id]?.done).length;
  const exercises = allExercises.filter((x) => p.exercises[x.exercise.id]?.done).length;
  const finalDone = p.final?.passed ? 1 : 0;
  const total = allLessons.length + allExercises.length + allAssignments.length + 1;
  const earned = lessons + exercises + finalDone + allAssignments.reduce((a, x) => a + assignmentCredit(p, x.assignment), 0);
  const complete = lessons === allLessons.length && exercises === allExercises.length && assigns === allAssignments.length && finalDone === 1;
  return { lessons, assigns, exercises, finalDone, total, done: Math.floor(earned), pct: pctOf(earned, total, complete) };
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

/** Module number a learner starts from, based on the level they picked on the Start page. */
export function startNumber(p: Progress): number {
  const t = TRACKS.find((x) => x.id === p.track);
  return modules.find((m) => m.id === t?.startModule)?.number ?? 0;
}

/** Honest total time: reading time of lessons plus estimated assignment effort, in minutes. */
export function totalMinutes(): { lessons: number; assignments: number } {
  return {
    lessons: allLessons.reduce((a, x) => a + x.lesson.minutes, 0),
    assignments: allAssignments.reduce((a, x) => a + (x.assignment.minutes ?? 0), 0),
  };
}

export const hours = (min: number) => (min < 90 ? `${min} min` : `about ${Math.round(min / 6) / 10} hours`);

export function recommended(p: Progress) {
  // first lesson not done whose module prerequisites are satisfied (or any first not done)
  for (const x of allLessons) {
    if (lessonDone(p, x.lesson)) continue;
    return x;
  }
  return null;
}

interface NextBase { label: string; why: string; href: string; step: 'Learn' | 'Practice' | 'Prove' }
export interface NextAction extends NextBase { verb: string; target: string }

/** The single best next thing to do, module by module: lesson, then its quiz, then its assignment, finally the exam. */
function nextIn(p: Progress, from: number, to: number): NextBase | null {
  for (const m of modules) {
    if (m.number < from || m.number > to) continue; // before their starting point, or beyond their plan
    if (m.number >= 3 && !day1Done(p)) {
      return { step: 'Practice', label: 'Assignment: Prove Claude Code runs on your machine', why: 'Day 1 proof. Everything after Module 2 assumes you have used the real tool.', href: `#/assignments/${DAY1_ID}` };
    }
    for (const l of m.lessons) {
      if (lessonDone(p, l)) continue;
      const q = p.quiz[l.id];
      if (q) return { step: 'Learn', label: `Retake quiz: ${l.title}`, why: `You scored ${q.best}/${q.total}. Reach ${LESSON_PASS_PCT}% to complete it.`, href: `#/lesson/${l.id}/quiz` };
      if (p.lessonsViewed[l.id]) return { step: 'Learn', label: `Continue: ${l.title}`, why: `Module ${m.number}. Finish the lesson, then take its quiz.`, href: `#/lesson/${l.id}` };
      return { step: 'Learn', label: `${Object.keys(p.lessonsViewed).length ? 'Next lesson' : 'Start'}: ${l.title}`, why: `Module ${m.number}: ${m.title}. About ${l.minutes} minutes.`, href: `#/lesson/${l.id}` };
    }
    const ex = allExercises.find((x) => x.module.id === m.id && !p.exercises[x.exercise.id]?.done);
    if (ex) return { step: 'Practice', label: `Practice: ${ex.exercise.title}`, why: `Try it hands-on in the Playground (Module ${m.number}).`, href: `#/playground/${ex.exercise.id}` };
    const a = m.assignments.find((x) => !p.assignments[x.id]?.done);
    if (a) return { step: 'Practice', label: `Assignment: ${a.title}`, why: `Apply Module ${m.number} on real code.`, href: `#/assignments/${a.id}` };
  }
  return null;
}

function baseNext(p: Progress): NextBase {
  const from = startNumber(p);
  const goal = p.profile.done ? GOALS.find((g) => g.id === p.profile.goal) : undefined;
  // With a plan, finish it first; then carry on with whatever lies beyond it.
  const planned = goal ? nextIn(p, from, goal.lastModule) : null;
  if (planned) return planned;
  const rest = nextIn(p, from, Infinity);
  if (rest) return goal ? { ...rest, why: `Your plan is done. This is the next step beyond it. ${rest.why}` } : rest;
  if (!p.final?.passed) return { step: 'Prove', label: 'Take the final assessment', why: 'Show you can use Claude Code on real work.', href: '#/final' };
  return { step: 'Prove', label: 'Review your progress', why: 'You have completed the academy.', href: '#/progress' };
}

/** The next step with its label split into a short verb and the thing to do, for compact buttons. */
export function nextAction(p: Progress): NextAction {
  const a = baseNext(p);
  const i = a.label.indexOf(': ');
  if (i > 0) return { ...a, verb: a.label.slice(0, i), target: a.label.slice(i + 2) };
  return { ...a, verb: a.step === 'Prove' ? 'Final step' : 'Next', target: a.label };
}

export function unmetRequirements(p: Progress, m: Module): Module[] {
  return m.requires
    .map((id) => modules.find((x) => x.id === id))
    .filter((x): x is Module => !!x && !moduleStats(p, x).complete && moduleStats(p, x).lessonsDone < x.lessons.length);
}
