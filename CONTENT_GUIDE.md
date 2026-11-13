# Content authoring guide (for module writers)

Schema: `src/content/types.ts` (read it first). One file per module in `src/content/modules/mN.ts`:

```ts
import type { Module, Concept } from '../types';
export const concepts: Concept[] = [ /* 6-12 click-to-learn concepts used by your lessons */ ];
export const module: Module = { ... };
```

## Hard rules
1. Technical accuracy first. Verify every Claude Code command, flag, config key, file path and feature against the CURRENT official docs (https://code.claude.com/docs, also docs.claude.com / docs.anthropic.com redirects) before writing it. Never invent slash commands or settings. If unsure, leave it out or phrase generally.
2. Where a feature depends on version, plan or platform, add a `callout` with tone `version`.
3. NO em dashes anywhere (use commas, colons, semicolons or rewrite). No decorative hyphen separators.
4. Concise: bullets and short paragraphs (max 3 lines). No documentation-style walls of text. Tables via `compare` blocks.
5. Practical and scenario based. Quiz questions must test decisions, not definitions: each has a realistic `scenario`, 4 options (3 for some), and a `why` on EVERY option (correct and incorrect). Put the correct answer at varied indexes. Make wrong options as long and specific as the correct one: the correct answer must never be guessable from its length. Check with a quick script that the correct option is the longest in no more than about 40% of questions.
6. Per lesson: 4 to 8 content blocks mixing text, code, callouts, at least one interactive block (diagram / workflow / compare / promptCompare / mindmap / exercise), 5 to 8 quiz questions, 3 to 4 objectives.
7. Per module: 2 to 4 lessons, 1 to 2 assignments, outcomes, skills (2 to 4 short skill names, reused consistently). Every lesson has a one sentence `summary` (plain words, shown as "In short"). Every assignment has an honest `minutes` estimate, and a `starter` folder when one exists in `starters/`.
8. Use `[[concept-id]]` in `Rich` text for click-to-learn; every id you reference must exist in your `concepts` export or be defined in another module (prefer your own). Concept ids must be globally unique: prefix is NOT required, but check `grep -r "id: 'your-id'" src/content` first.
9. Diagrams: Mermaid `flowchart TD/LR` for clickable ones. `nodes` keys must equal mermaid node ids exactly (letters/digits/underscore only, e.g. `A`, `plan`). Keep node labels short, wrap in quotes if they contain punctuation: `A["Claude Code"]`. Do not use `click`, `style` or `classDef`. Sequence diagrams are allowed with `nodes: {}`.
10. Exercises: ids globally unique (`mN-ex-...`). Use the four kinds; spread categories (command, workflow, prompt, security, approach) across the curriculum.
11. Video blocks: only link to real, verified free videos or official docs pages; fetch the URL to confirm it resolves. Prefer official Anthropic docs. If you cannot verify, omit.
12. Code samples must be correct and runnable where claimed. Security `spot` exercises: use realistic AI-generated code with 2 to 4 real issues.
13. Finish by running `npx tsc --noEmit` from the project root (deps are installed; ignore errors in files you do not own) and fix every error in your file(s). Do not edit files you do not own.
