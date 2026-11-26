import { modules } from '../content';
import { moduleStats, overall, startNumber } from './stats';
import type { Progress } from './store';

/** Nine modules grow nine parts of one tree, from the roots up to the golden crown. */
export const PART_NAMES = ['Roots', 'Trunk', 'Lower branches', 'Upper branches', 'Left canopy', 'Right canopy', 'Blossoms', 'Fruit', 'Golden crown'];

/** How far each part has grown, 0 to 1, in module order. */
export function partProgress(p: Progress): number[] {
  // Salesforce learners: the nine parts are nine equal slices of the whole path, so the tree follows their journey.
  if (p.profile.sf) {
    const e = overall(p).pct / 100;
    return PART_NAMES.map((_, i) => Math.min(1, Math.max(0, e * 9 - i)));
  }
  return PART_NAMES.map((_, i) => {
    const m = modules.find((x) => x.number === i + 1);
    return m ? moduleStats(p, m).pct / 100 : 0;
  });
}

/**
 * Parts for modules the learner skipped by choosing a later starting level. They show as a lighter head start,
 * never as real progress: they turn solid once the lessons are passed. A part is a head start only until it is fully grown.
 */
export function headStart(p: Progress, parts: number[] = partProgress(p)): boolean[] {
  const from = startNumber(p);
  return PART_NAMES.map((_, i) => i + 1 < from && parts[i] < 1);
}

export const STAGES: { from: number; name: string }[] = [
  { from: 0, name: 'Seed' },
  { from: 1, name: 'Sprout' },
  { from: 10, name: 'Sapling' },
  { from: 30, name: 'Young tree' },
  { from: 60, name: 'Mature tree' },
  { from: 90, name: 'Nearly full grown' },
  { from: 100, name: 'Full grown tree' },
];

export function treeStage(p: Progress): { pct: number; name: string; left: number } {
  const pct = overall(p).pct;
  let name = STAGES[0].name;
  for (const s of STAGES) if (pct >= s.from) name = s.name;
  return { pct, name, left: 100 - pct };
}
