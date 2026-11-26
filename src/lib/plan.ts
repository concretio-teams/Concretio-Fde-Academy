import { modules } from '../content';
import type { Goal, SfLevel, TimeBudget, Track } from '../../shared/progress';
import type { Module } from '../content/types';
import { lessonDone } from './stats';
import type { Progress } from './store';
import { SF_GOAL, sfMinutesLeft } from './sfPath';
import { GOALS, TIMES, TRACKS } from './tracks';

export interface Plan {
  goal: Goal;
  modules: Module[]; // recommended, in order
  rest: Module[]; // everything else: still open, just not recommended
  minutesLeft: number; // academy plus Salesforce, so the weeks estimate is honest
  sf: SfLevel | null; // set when the learner is on the Salesforce FDE program
  sfMinutes: number; // the Salesforce part of minutesLeft
  weeks: number | null; // null when no weekly time was given
  hoursPerWeek: number | null;
}

const startNumberFor = (track: Track | null) => modules.find((m) => m.id === TRACKS.find((t) => t.id === track)?.startModule)?.number ?? 0;

/** Build a plan from answers. Used for the live preview on the questions page and for the saved plan. */
export function buildPlan(p: Progress, track: Track | null, goal: Goal | null, time: TimeBudget | null, sf: SfLevel | null = p.profile.sf): Plan | null {
  // On the Salesforce program the fixed path recommends the whole academy.
  const g = GOALS.find((x) => x.id === (sf ? SF_GOAL : goal));
  if (!g) return null;
  const from = startNumberFor(track);
  const mine = modules.filter((m) => m.number >= from && m.number <= g.lastModule);
  const rest = modules.filter((m) => !mine.includes(m));
  const academyMinutes = mine.reduce((sum, m) =>
    sum + m.lessons.filter((l) => !lessonDone(p, l)).reduce((a, l) => a + l.minutes, 0)
        + m.assignments.filter((a) => !p.assignments[a.id]?.done).reduce((a, x) => a + (x.minutes ?? 0), 0), 0);
  const sfMinutes = sf ? sfMinutesLeft(p) : 0;
  const minutesLeft = academyMinutes + sfMinutes;
  const per = TIMES.find((x) => x.id === time)?.hoursPerWeek ?? null;
  return { goal: g.id, modules: mine, rest, minutesLeft, sf, sfMinutes, weeks: per ? Math.max(1, Math.ceil(minutesLeft / 60 / per)) : null, hoursPerWeek: per };
}

/** The saved plan, or null until the learner has answered the questions (or if they skipped the goal). */
export function planOf(p: Progress): Plan | null {
  return p.profile.done ? buildPlan(p, p.track, p.profile.goal, p.profile.time) : null;
}


/** Last academy module the final exam draws from. Salesforce learners are examined on their own path; "show everything" restores the full exam. */
export function finalLastModule(p: Progress): number {
  if (p.profile.sf && p.profile.all) return Infinity;
  const plan = planOf(p);
  return plan ? GOALS.find((g) => g.id === plan.goal)?.lastModule ?? Infinity : Infinity;
}
