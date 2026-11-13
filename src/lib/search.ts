import { allAssignments, allExercises, allLessons, conceptMap, modules, resources } from '../content';
import { href } from './router';

export type ResultKind = 'Page' | 'Lesson' | 'Concept' | 'Exercise' | 'Assignment' | 'Resource' | 'Module';
export interface Entry {
  id: string; kind: ResultKind; title: string; sub: string;
  text: string; // lowercase searchable body
  go?: string; // hash href
  concept?: string; // concept id to open in the drawer
}

const strip = (s: string) => s.replace(/\*\*|`|\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2').replace(/\s+/g, ' ');

function collect(v: unknown, out: string[], depth = 0): void {
  if (depth > 6 || v == null) return;
  if (typeof v === 'string') { if (v.length > 2) out.push(strip(v)); return; }
  if (Array.isArray(v)) { for (const x of v) collect(x, out, depth + 1); return; }
  if (typeof v === 'object') for (const [k, x] of Object.entries(v as Record<string, unknown>)) if (k !== 'type' && k !== 'lang' && k !== 'kind' && k !== 'tone') collect(x, out, depth + 1);
}
const bodyOf = (v: unknown) => { const out: string[] = []; collect(v, out); return out.join(' ').toLowerCase(); };

let index: Entry[] | null = null;

export const PAGES: [string, string, string][] = [
  ['start', 'Start here', 'Pick your level and see how the academy works'],
  ['', 'Dashboard', 'Progress, next step and achievements'],
  ['path', 'Learning path', 'All modules and their order'],
  ['playground', 'Playground', 'Hands-on exercises'],
  ['knowledge', 'Knowledge check', 'Quizzes and scores'],
  ['assignments', 'Assignments', 'Practical challenges'],
  ['resources', 'Resources', 'Curated free resources'],
  ['glossary', 'Glossary', 'Every term in plain language'],
  ['final', 'Final assessment', 'Theory exam and practical tasks'],
  ['progress', 'My progress', 'Skills, scores and history'],
];

export function buildIndex(): Entry[] {
  if (index) return index;
  const e: Entry[] = [];
  for (const [k, title, sub] of PAGES) e.push({ id: 'page-' + k, kind: 'Page', title, sub, text: (title + ' ' + sub).toLowerCase(), go: k ? href(k) : '#/' });
  for (const m of modules) e.push({ id: m.id, kind: 'Module', title: `Module ${m.number}: ${m.title}`, sub: m.tagline, text: bodyOf([m.tagline, m.outcomes, m.skills]), go: href('path') });
  for (const { lesson, module } of allLessons)
    e.push({ id: lesson.id, kind: 'Lesson', title: lesson.title, sub: `Module ${module.number}, ${lesson.minutes} min`, text: bodyOf([lesson.objectives, lesson.blocks]), go: href('lesson', lesson.id) });
  for (const c of Object.values(conceptMap))
    e.push({ id: 'c-' + c.id, kind: 'Concept', title: c.name, sub: strip(c.what).slice(0, 90), text: bodyOf(c), concept: c.id });
  for (const { exercise, module } of allExercises)
    e.push({ id: exercise.id, kind: 'Exercise', title: exercise.title, sub: `Module ${module.number}, ${exercise.category}`, text: bodyOf(exercise.prompt), go: href('playground', exercise.id) });
  for (const { assignment, module } of allAssignments)
    e.push({ id: assignment.id, kind: 'Assignment', title: assignment.title, sub: `Module ${module.number}`, text: bodyOf([assignment.brief, assignment.steps]), go: href('assignments', assignment.id) });
  for (const r of resources) e.push({ id: r.id, kind: 'Resource', title: r.title, sub: `${r.type}, ${r.minutes} min`, text: bodyOf(r.learn), go: href('resources') });
  index = e;
  return e;
}

const KIND_WEIGHT: Record<ResultKind, number> = { Page: 6, Module: 5, Lesson: 4, Concept: 4, Exercise: 2, Assignment: 2, Resource: 1 };

export function search(query: string, limit = 14): Entry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const scored: { e: Entry; s: number }[] = [];
  for (const e of buildIndex()) {
    const t = e.title.toLowerCase();
    let s = 0, miss = false;
    for (const w of words) {
      if (t.startsWith(w)) s += 100;
      else if (t.split(/[\s:,-]+/).some((x) => x.startsWith(w))) s += 70;
      else if (t.includes(w)) s += 50;
      else if (e.sub.toLowerCase().includes(w)) s += 25;
      else if (e.text.includes(w)) s += 8;
      else { miss = true; break; }
    }
    if (!miss) scored.push({ e, s: s + KIND_WEIGHT[e.kind] });
  }
  return scored.sort((a, b) => b.s - a.s).slice(0, limit).map((x) => x.e);
}
