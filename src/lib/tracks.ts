import type { Track } from './store';

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
