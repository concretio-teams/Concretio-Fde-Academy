import type { Goal, SfLevel, TimeBudget, Track } from './store';

// Three starting points. Keep this short: the goal is to answer "where do I begin?" in ten seconds.
export interface TrackInfo {
  id: Track;
  title: string;
  who: string;
  startModule: string; // module id where this learner begins
  advice: string;
}

export const TRACKS: TrackInfo[] = [
  {
    id: 'new',
    title: 'I am new to AI coding tools',
    who: 'You have never used one, or only tried a chat window.',
    startModule: 'm1',
    advice: 'Begin at Module 1 and go in order. Nothing is assumed.',
  },
  {
    id: 'some',
    title: 'I use AI assistants, but not Claude Code',
    who: 'You use tools like Copilot or a chatbot, and want to learn Claude Code properly.',
    startModule: 'm2',
    advice: 'Skip the theory in Module 1. Begin at Module 2 and install Claude Code.',
  },
  {
    id: 'pro',
    title: 'I already use Claude Code',
    who: 'You use it most weeks and want the advanced and client-facing parts.',
    startModule: 'm3',
    advice: 'Test out of the early lessons: take their knowledge checks, and pass at 70% to count them as done. Then work from Module 3.',
  },
];

export const LEVELS: [string, string][] = [
  ['Foundation', 'No experience needed. Concepts and first steps.'],
  ['Core', 'Everyday skills you will use on every project.'],
  ['Advanced', 'Extending Claude Code and automating work.'],
  ['Professional', 'Shipping safely and working with clients.'],
];

// Goals are nested on purpose: each one is a longer stretch of the same path, so nothing in a plan
// depends on a module that the plan leaves out. A plan only decides what we recommend, never what is allowed.
export const GOALS: { id: Goal; title: string; sub: string; lastModule: number }[] = [
  { id: 'basics', title: 'Get comfortable with Claude Code', sub: 'The foundations: Modules 1 to 4.', lastModule: 4 },
  { id: 'client', title: 'Use it on real client work', sub: 'Everything through production and client delivery: Modules 1 to 8.', lastModule: 8 },
  { id: 'career', title: 'Grow along the FDE career tiers', sub: 'All 9 modules, plus the career tiers and exam path.', lastModule: 9 },
];

export const TIMES: { id: TimeBudget; title: string; hoursPerWeek: number }[] = [
  { id: 'light', title: '1 to 2 hours', hoursPerWeek: 1.5 },
  { id: 'steady', title: '3 to 5 hours', hoursPerWeek: 4 },
  { id: 'focused', title: '5 hours or more', hoursPerWeek: 6 },
];

/** First question at sign-in. "none" means the general academy path. */
export const SF_CHOICES: { id: SfLevel | 'none'; title: string; sub: string }[] = [
  { id: 'none', title: 'No, I am not on the program', sub: 'You get the general academy path. The Salesforce content stays hidden unless you ask for it.' },
  { id: 'associate', title: 'Yes, I am on the program', sub: 'One fixed path for everyone: Associate, then FDE, then Senior FDE. Salesforce courses first, then Claude Code and vibe coding.' },
];
