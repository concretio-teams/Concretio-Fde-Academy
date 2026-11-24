import { modules } from '../content';
import type { Goal, TimeBudget, Track } from '../../shared/progress';
import type { Module } from '../content/types';
import { lessonDone } from './stats';
import type { Progress } from './store';
import { GOALS, TIMES, TRACKS } from './tracks';

export interface Plan {
  goal: Goal;
  modules: Module[]; // recommended, in order
  rest: Module[]; // everything else: still open, just not recommended
  minutesLeft: number;
  weeks: number | null; // null when no weekly time was given
  hoursPerWeek: number | null;
}

const startNumberFor = (track: Track | null) => modules.find((m) => m.id === TRACKS.find((t) => t.id === track)?.startModule)?.number ?? 0;

/** Build a plan from answers. Used for the live preview on the questions page and for the saved plan. */
export function buildPlan(p: Progress, track: Track | null, goal: Goal | null, time: TimeBudget | null): Plan | null {
  const g = GOALS.find((x) => x.id === goal);
  if (!g) return null;
  const from = startNumberFor(track);
  const mine = modules.filter((m) => m.number >= from && m.number <= g.lastModule);
  const rest = modules.filter((m) => !mine.includes(m));
  const minutesLeft = mine.reduce((sum, m) =>
    sum + m.lessons.filter((l) => !lessonDone(p, l)).reduce((a, l) => a + l.minutes, 0)
        + m.assignments.filter((a) => !p.assignments[a.id]?.done).reduce((a, x) => a + (x.minutes ?? 0), 0), 0);
  const per = TIMES.find((x) => x.id === time)?.hoursPerWeek ?? null;
  return { goal: g.id, modules: mine, rest, minutesLeft, weeks: per ? Math.max(1, Math.ceil(minutesLeft / 60 / per)) : null, hoursPerWeek: per };
}

/** The saved plan, or null until the learner has answered the questions (or if they skipped the goal). */
export function planOf(p: Progress): Plan | null {
  return p.profile.done ? buildPlan(p, p.track, p.profile.goal, p.profile.time) : null;
}

