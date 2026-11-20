// Content schema for Claude Code Academy. Every module file in src/content/modules/
// exports `module` (Module) and optionally `concepts` (Concept[]).

/** Rich text. Supports: **bold**, `code`, [[concept-id]] or [[concept-id|label]] (click-to-learn),
 *  blank line = new paragraph, lines starting with "- " = bullets, "1. " = numbered list. */
export type Rich = string;

export interface Concept {
  id: string; // kebab-case, globally unique
  name: string;
  what: string;
  why: string;
  how: string;
  when: string;
  example: string; // may contain `code`
  mistakes: string;
  kind?: 'concept' | 'command' | 'config' | 'workflow';
}

export interface NodeInfo {
  title: string;
  what: Rich;
  example?: Rich;
  useCase?: Rich;
  related?: string[]; // concept ids
}

export interface Question {
  id: string; // unique within lesson
  scenario?: Rich; // optional real-world setup, preferred over pure definitions
  q: Rich;
  options: { text: Rich; why: Rich }[]; // `why` explains correct OR incorrect
  answer: number; // index of the single correct option
}

export type ExerciseCategory = 'command' | 'workflow' | 'prompt' | 'security' | 'approach';

interface ExBase {
  id: string; // globally unique
  title: string;
  category: ExerciseCategory;
  prompt: Rich;
  explanation?: Rich; // shown after completion
}
export interface ChooseExercise extends ExBase {
  kind: 'choose'; // pick the right command / approach / prompt
  options: { text: Rich; correct: boolean; why: Rich }[];
}
export interface OrderExercise extends ExBase {
  kind: 'order'; // `items` are given in the CORRECT order; UI shuffles
  items: string[];
}
export interface FlawsExercise extends ExBase {
  kind: 'flaws'; // show `subject` (a bad prompt), user ticks the real problems
  subject: string;
  flaws: { text: Rich; real: boolean; why: Rich }[];
  improved?: string; // a better version shown on completion
}
export interface SpotExercise extends ExBase {
  kind: 'spot'; // user clicks vulnerable lines of code
  lang: string;
  lines: string[];
  issues: { line: number; title: string; why: Rich; fix: Rich }[]; // line is 1-based
}
export type Exercise = ChooseExercise | OrderExercise | FlawsExercise | SpotExercise;

export interface ScenarioBlock {
  type: 'scenario';
  title: string;
  problem: Rich;
  context: string[]; // required context
  prompt: string; // suggested prompt (plain text, shown in code box)
  approach: string[]; // expected implementation approach, ordered
  mistakes: Rich[]; // common mistakes
  checklist: string[]; // validation checklist
}

export type Block =
  | { type: 'text'; md: Rich }
  | { type: 'callout'; tone: 'info' | 'warn' | 'tip' | 'version'; title?: string; md: Rich }
  | { type: 'code'; lang: string; title?: string; code: string; note?: Rich }
  | {
      type: 'diagram';
      title: string;
      // Mermaid source. For click-to-explore use `flowchart` / `graph` ONLY and make `nodes` keys
      // equal to the mermaid node ids (e.g. A, B, plan). Sequence diagrams are allowed with nodes = {}.
      mermaid: string;
      nodes: Record<string, NodeInfo>;
      caption?: Rich;
    }
  | { type: 'compare'; title: string; columns: string[]; rows: { label: string; cells: Rich[] }[] }
  | {
      type: 'workflow'; // clickable step chain
      title: string;
      steps: { id: string; title: string; what: Rich; why: Rich; ask: string }[];
    }
  | { type: 'promptCompare'; title: string; bad: string; good: string; why: Rich[] }
  | {
      type: 'promptBuilder';
      title: string;
      scenario: Rich;
      fields: { key: string; label: string; hint: string; example: string }[];
    }
  | { type: 'video'; title: string; url: string; minutes: number; blurb: Rich }
  | { type: 'tabs'; tabs: { label: string; md: Rich }[] }
  | {
      type: 'mindmap';
      center: string;
      branches: { label: string; items: { label: string; detail: Rich }[] }[];
    }
  | { type: 'exercise'; exercise: Exercise }
  | ScenarioBlock
  | { type: 'claudeUi' }; // interactive Claude Code interface (Module 2 only)

export interface Lesson {
  id: string; // e.g. "m1-l1", globally unique
  title: string;
  minutes: number;
  summary?: string; // one plain sentence shown at the top of the lesson ("In short")
  objectives: string[];
  blocks: Block[];
  quiz: Question[]; // 5 to 10 questions, mostly scenario / decision based
}

export interface Assignment {
  id: string; // e.g. "m3-a1"
  title: string;
  brief: Rich;
  steps: string[];
  deliverable: string;
  minutes?: number; // honest estimate of effort in minutes
  example?: Rich; // a short worked example the learner can open, so they know what good looks like
  starter?: string; // folder in the academy repo with a starter project, e.g. starters/shop-app
  checklist: string[]; // self-assessment criteria the learner ticks
  hint?: Rich;
}

export interface Module {
  id: string; // "m1".."m8"
  number: number;
  title: string;
  tagline: string;
  level: 'Foundation' | 'Core' | 'Advanced' | 'Professional';
  requires: string[]; // module ids that should be done first
  outcomes: string[];
  skills: string[]; // skill names this module builds (used by My Progress)
  lessons: Lesson[];
  assignments: Assignment[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'Docs' | 'Video' | 'Guide' | 'Course';
  url: string;
  minutes: number;
  free: true;
  learn: string; // what developers will learn
  modules: string[]; // module ids it supplements
  lessons?: string[]; // lesson ids it supports, earliest first; shown as "Go deeper" on each lesson page
  verified: string; // ISO date the link was checked
}

export interface FinalAssessment {
  passMark: number; // percent, e.g. 75
  questions: (Question & { module: string })[]; // 20 to 25 scenario questions across all modules
  practical: { id: string; title: string; brief: Rich; criteria: string[] }[]; // 3 practical tasks, self-assessed
}
