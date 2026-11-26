// The one fixed path for learners on the Salesforce FDE program. Per Harting (26 Nov 2026): there is no level choice,
// everyone starts at Associate, then FDE, then Senior FDE. Inside each level the Salesforce courses come first and the
// Claude courses and academy modules follow. We change the path, not the content.
// The order of Salesforce items follows Harting's list; the placement of the Claude items and modules is our draft.

import type { Goal } from '../../shared/progress';
import { SF_LEVELS, sfItems, type SfItem } from './sfProgram';
import type { Progress } from './store';

export type PathStep = { t: 'h'; title: string; sub?: string } | { t: 'm'; n: number } | { t: 'sf'; ids: string[] };
const h = (title: string, sub?: string): PathStep => ({ t: 'h', title, sub });
const m = (n: number): PathStep => ({ t: 'm', n });
const s = (...ids: string[]): PathStep => ({ t: 'sf', ids });

/** The path ends at the full academy, so every module is recommended. */
export const SF_GOAL: Goal = 'career';

export const SF_PATH: PathStep[] = [
  h('FDE Associate: Salesforce courses', '0 to 2 years'),
  s('sf-a1', 'sf-a2', 'sf-a3', 'sf-a4', 'sf-vibes', 'sf-a6', 'sf-a7', 'sf-a8'),
  h('FDE Associate: Claude Code basics and vibe coding'),
  s('sf-a9', 'sf-a10'), m(1), m(2), s('sf-a11'), m(3), s('sf-a12'), m(4),

  h('FDE: Salesforce courses', '2 to 6 years'),
  s('sf-f1', 'sf-f2', 'sf-f3', 'sf-f4', 'sf-f5', 'sf-f6', 'sf-g1', 'sf-g2', 'sf-g3'),
  h('FDE: Claude, MCP and client delivery'),
  m(5), s('sf-g5', 'sf-g4'), m(6), m(7), m(8), s('sf-g7', 'sf-g8'),

  h('Senior FDE: Salesforce courses', '6+ years'),
  s('sf-s1', 'sf-s3'),
  h('Senior FDE: Claude, architecture and rollout'),
  s('sf-s2'), m(9), s('sf-s4', 'sf-s5'),
];

/** Every Salesforce item on the path, by id. */
export function sfItemMap(): Map<string, SfItem> {
  const map = new Map<string, SfItem>();
  for (const l of SF_LEVELS) for (const i of sfItems(l)) if (!map.has(i.id)) map.set(i.id, i);
  return map;
}

/** Items the learner is expected to do: the required ones that sit on the path, once each. */
export const requiredSfItems = (): SfItem[] => {
  const on = new Set(SF_PATH.flatMap((st) => (st.t === 'sf' ? st.ids : [])));
  return [...sfItemMap().values()].filter((i) => i.status === 'Required' && on.has(i.id));
};

/** How much a Salesforce item counts toward growth. Exams and unpublished durations get a small weight so ticking them still moves the tree. */
export const SF_WEIGHT_DEFAULT = 30;
export const sfWeight = (i: SfItem): number => i.minutes ?? SF_WEIGHT_DEFAULT;

/** Minutes of Salesforce items still to do (exams and unpublished durations count as zero). */
export const sfMinutesLeft = (p: Progress): number =>
  requiredSfItems().filter((i) => !p.sf[i.id]?.done).reduce((a, i) => a + (i.minutes ?? 0), 0);

/** First required Salesforce item not done yet, in path order. */
export function nextSfItem(p: Progress): SfItem | null {
  const map = sfItemMap();
  for (const st of SF_PATH) {
    if (st.t !== 'sf') continue;
    for (const id of st.ids) { const i = map.get(id); if (i && !p.sf[id]?.done) return i; }
  }
  return null;
}
