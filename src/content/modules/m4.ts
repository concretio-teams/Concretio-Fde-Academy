import type { Module, Concept } from '../types';

export const concepts: Concept[] = [
  {
    id: 'claude-md-file',
    name: 'CLAUDE.md',
    kind: 'config',
    what: 'A markdown file of persistent instructions that Claude reads at the start of every session.',
    why: 'Each session starts with a fresh context window. CLAUDE.md carries your build commands, conventions and rules so you do not repeat them.',
    how: 'Put it at `./CLAUDE.md` or `./.claude/CLAUDE.md` for the team, `~/.claude/CLAUDE.md` for personal rules across projects, `./CLAUDE.local.md` for private project notes (gitignore it). Keep each file under about 200 lines.',
    when: 'For anything Claude cannot discover from the code and that you would otherwise type again and again.',
    example: '"Run `npm test` before finishing. API handlers live in src/routes. Never edit src/generated."',
    mistakes: 'Writing a novel. Vague rules ("write good code"). Contradicting instructions across files. Treating it as enforcement: it is context, not a hard rule. Use hooks or permissions to enforce.',
  },
  {
    id: 'claude-md-hierarchy',
    name: 'CLAUDE.md hierarchy',
    kind: 'concept',
    what: 'Claude loads CLAUDE.md files from your working directory and every directory above it, plus managed, user and local files. Files in subdirectories load on demand.',
    why: 'You can layer org policy, personal preferences and per package rules without copying them.',
    how: 'All discovered files are concatenated, not overridden. Order runs from filesystem root down to your working directory, so the closest file is read last. CLAUDE.local.md is appended after CLAUDE.md in each directory.',
    when: 'Monorepos and teams with shared standards.',
    example: 'Running Claude in `repo/packages/api/` loads `repo/CLAUDE.md` then `repo/packages/api/CLAUDE.md`.',
    mistakes: 'Assuming the nearest file replaces the others. Leaving conflicting rules at different levels.',
  },
  {
    id: 'init-command',
    name: '/init',
    kind: 'command',
    what: 'A command that analyzes your codebase and generates a starting CLAUDE.md.',
    why: 'Fast bootstrap with the build and test commands and conventions Claude discovers.',
    how: 'Run `/init` in the project. If a CLAUDE.md exists, it suggests improvements rather than overwriting. Then trim and add what Claude could not discover.',
    when: 'First time you use Claude in a repo.',
    example: '`/init` then edit the result: delete generic lines, add your gotchas.',
    mistakes: 'Committing the generated file untouched. It often has filler and misses your tribal knowledge.',
  },
  {
    id: 'claude-md-imports',
    name: '@ imports in CLAUDE.md',
    kind: 'config',
    what: 'The `@path/to/file` syntax inside a CLAUDE.md pulls another file into context with it.',
    why: 'Reuse existing docs (README, package.json, shared guidelines) without copying.',
    how: 'Write `@docs/git-instructions.md`. Relative paths resolve from the file containing the import. Imports can nest up to four hops. Imported files load with the parent, so they do not save context.',
    when: 'Sharing one source of truth, or importing a personal file from your home directory.',
    example: 'See @README.md for overview and @package.json for npm commands.',
    mistakes: 'Believing imports reduce context cost. They only organize.',
  },
  {
    id: 'claude-rules-dir',
    name: '.claude/rules',
    kind: 'config',
    what: 'A directory of topic files (testing.md, api-design.md) that can be scoped to file paths.',
    why: 'Splits a long CLAUDE.md and loads path specific rules only when relevant.',
    how: 'Create markdown files under `.claude/rules/`. Add `paths` frontmatter to scope a rule to matching files. Personal rules go in `~/.claude/rules/`.',
    when: 'Instructions that matter for only part of the codebase.',
    example: '`.claude/rules/testing.md` scoped to test files.',
    mistakes: 'Putting everything in one giant file.',
  },
  {
    id: 'auto-memory',
    name: 'Auto memory',
    kind: 'concept',
    what: 'Notes Claude writes itself from your corrections and preferences, stored per repository as plain markdown.',
    why: 'Claude accumulates learnings across sessions without you editing files.',
    how: 'Stored under `~/.claude/projects/<project>/memory/` with a `MEMORY.md` index; the first 200 lines or 25KB load each session. Run `/memory` to browse, edit, or toggle it. It is machine local.',
    when: 'Personal preferences and learned patterns. Team rules still belong in CLAUDE.md.',
    example: 'Tell Claude "remember the API tests need a local Redis" and it saves it.',
    mistakes: 'Expecting auto memory to be shared with teammates. It is not committed or synced.',
  },
  {
    id: 'at-mentions',
    name: '@ file mentions',
    kind: 'command',
    what: 'Typing `@path` in a prompt includes a file, or lists a directory, in the conversation.',
    why: 'Faster and more precise than describing where code lives.',
    how: 'Type `@` to open a path menu. Files are included if they fit the Read limit (25,000 tokens by default). Directories show a listing, not contents. MCP resources use `@server:resource`.',
    when: 'Whenever you know which files matter.',
    example: '`Explain the logic in @src/utils/auth.js`',
    mistakes: 'Mentioning whole directories expecting contents. Mentioning huge files that do not fit.',
  },
  {
    id: 'context-window-mgmt',
    name: 'Context window',
    kind: 'concept',
    what: 'The working memory of a session: your prompts, file reads, tool output and Claude replies.',
    why: 'It is finite. As it fills, cost rises and older detail can be lost or degraded.',
    how: 'Check with `/context`. Use `/clear` between unrelated tasks, `/compact` to summarize a long session, and subagents for research.',
    when: 'Long sessions, big exploration, switching tasks.',
    example: '`/compact focus on the webhook design decisions`',
    mistakes: 'Using one session for everything. Pasting giant logs. Putting a rule only in chat, where compaction can lose it; put durable rules in CLAUDE.md.',
  },
  {
    id: 'prompt-constraints',
    name: 'Examples and constraints',
    kind: 'concept',
    what: 'Concrete examples of desired output and explicit limits (scope, style, what not to do).',
    why: 'They narrow the solution space so Claude matches your expectations the first time.',
    how: 'Show one input and output sample. State boundaries: files in scope, no new dependencies, keep public API.',
    when: 'Formatting, naming, migrations, anything with a house style.',
    example: '"Match the style of @src/routes/users.ts. No new dependencies."',
    mistakes: 'Only saying what you want, never what to avoid. Giving contradictory examples.',
  },
];

export const module: Module = {
  id: 'm4',
  number: 4,
  title: 'Context Engineering and Prompting',
  tagline: 'Give Claude the right information, in the right place, in the right size.',
  level: 'Core',
  requires: ['m2'],
  outcomes: [
    'Write specific prompts with goal, context, constraints and a check',
    'Write and structure a CLAUDE.md and know where each file lives',
    'Reference files with @ and manage persistent memory',
    'Split complex work into focused prompts',
    'Manage the context window with /context, /clear and /compact',
  ],
  skills: ['Prompting', 'CLAUDE.md', 'Context management'],
  lessons: [
    {
      id: 'm4-l1',
      title: 'Effective prompts: context, examples and constraints',
      minutes: 30,
      summary: 'Good prompts say the goal, the context, the limits and how to check success. Compare weak and strong examples.',
      objectives: [
        'Replace vague instructions with specific, verifiable ones',
        'Give Claude the right context using @ mentions',
        'Use examples and constraints to narrow the result',
        'Break complex tasks into smaller prompts',
      ],
      blocks: [
        {
          type: 'text',
          md: 'A strong prompt has four parts: **goal**, **context**, **constraints**, and a **check**. Most bad results trace back to a missing part, not a weak model.',
        },
        {
          type: 'promptCompare',
          title: 'Vague vs specific',
          bad: 'Add validation to the signup form.',
          good: 'Add client and server validation to the signup form in @src/components/SignupForm.tsx and @src/api/signup.ts.\nRules: email format, password at least 12 chars with one digit, name required.\nShow inline error messages using the existing <FieldError> component.\nDo not add libraries; reuse the zod schemas in @src/lib/schemas.ts.\nAdd tests, then run `npm test -- signup`.',
          why: [
            'Names the exact files, so Claude does not search or guess.',
            'Lists the rules instead of leaving "validation" to interpretation.',
            'Constraints (no libraries, reuse schemas) stop unwanted choices.',
            'The test command gives Claude a built in way to verify.',
          ],
        },
        {
          type: 'text',
          md: 'Use [[at-mentions|@ mentions]] to point at code. A file is included when it fits the Read limit; a directory gives a listing, not contents. Mentioning a file also brings in the `CLAUDE.md` files in its directory and parents.',
        },
        {
          type: 'promptCompare',
          title: 'With and without an example',
          bad: 'Write a changelog entry for this change.',
          good: 'Write a changelog entry for this change in the format used in @CHANGELOG.md.\nExample of the style I want:\n  - Fixed: checkout no longer fails when a coupon expires mid session (#412)\nOne line, past tense, user visible impact first, include the PR number.',
          why: [
            'A concrete example communicates format faster than a paragraph of rules.',
            'Explicit style constraints (one line, past tense) remove ambiguity.',
            'Pointing at the real file keeps Claude consistent with history.',
          ],
        },
        {
          type: 'promptBuilder',
          title: 'Build a strong prompt',
          scenario: 'Your team needs rate limiting on a public API endpoint. Fill the fields to assemble a prompt.',
          fields: [
            { key: 'goal', label: 'Goal', hint: 'The outcome, not the solution.', example: 'Limit POST /api/messages to 30 requests per minute per API key.' },
            { key: 'context', label: 'Context', hint: 'Files, docs, existing patterns (use @).', example: 'Middleware lives in @src/middleware/. Redis client is in @src/lib/redis.ts.' },
            { key: 'constraints', label: 'Constraints', hint: 'Scope limits and things to avoid.', example: 'No new dependencies. Do not change response shapes for success cases.' },
            { key: 'format', label: 'Output / examples', hint: 'What a good answer looks like.', example: 'Return 429 with a Retry-After header and JSON { error: "rate_limited" }.' },
            { key: 'check', label: 'Verification', hint: 'How Claude proves it works.', example: 'Add tests and run `npm test -- ratelimit`. Show me the output.' },
          ],
        },
        {
          type: 'text',
          md: '**Break complex tasks into smaller prompts.** One prompt, one outcome. Plan first, then implement step by step, checking each result.\n\n- Prompt 1: "Explore how rate limiting could fit. Read only."\n- Prompt 2: "Plan the change. List files and tests."\n- Prompt 3: "Implement the middleware only. Run its tests."\n- Prompt 4: "Wire it into the route. Run the route tests."',
        },
        {
          type: 'exercise',
          exercise: {
            id: 'm4-ex-flaws-vague',
            kind: 'flaws',
            category: 'prompt',
            title: 'Spot the problems',
            prompt: 'Tick the real problems with this prompt.',
            subject: 'Make the app faster and fix the bugs. Also add dark mode and clean up the code. Use best practices.',
            flaws: [
              { text: 'Bundles several unrelated tasks into one prompt', real: true, why: 'Performance, bugs, dark mode and cleanup should be separate focused prompts.' },
              { text: 'No measurable target for "faster"', real: true, why: 'Without a baseline and goal, Claude cannot know when it is done.' },
              { text: 'No files or context given', real: true, why: 'Claude must guess where anything is.' },
              { text: '"Use best practices" is vague', real: true, why: 'Subjective and unverifiable. Name the concrete standards instead.' },
              { text: 'The prompt is too short to be effective in any case', real: false, why: 'Length is not the issue; specificity and focus are.' },
              { text: 'It should be written in a formal tone', real: false, why: 'Tone does not matter to the result.' },
            ],
            improved: 'Step 1: Profile @src/pages/Dashboard.tsx. Initial load is 6s p95; find the top 3 causes. Read only.\nStep 2 (new prompt): Fix the top cause. Verify with `npm run perf` and keep tests green.',
          },
        },
      ],
      quiz: [
        {
          id: 'q1',
          scenario: 'You ask "fix the login bug" and Claude edits three unrelated files.',
          q: 'Most likely root cause?',
          options: [
            { text: 'Claude ignores instructions once a prompt mentions more than one file', why: 'Claude follows instructions; the prompt gave it nothing to anchor the scope on.' },
            { text: 'The prompt gave no error, no file and no "only touch X" limit', why: 'Correct. Add the symptom, the location and a scope limit.' },
            { text: 'Claude should have been told to read the whole repo before editing', why: 'Reading everything adds noise. The fix is a narrower prompt, not a broader search.' },
            { text: 'The prompt did not name the framework and language version', why: 'Useful sometimes, but not why unrelated files changed. Scope was the missing piece.' },
          ],
          answer: 1,
        },
        {
          id: 'q2',
          scenario: 'You type "what is in @src/components" expecting file contents.',
          q: 'What do you actually get?',
          options: [
            { text: 'The first 25,000 tokens of the files found in that folder', why: 'The 25,000 token limit applies to single files. A directory shows a listing only.' },
            { text: 'A listing of the folder, not the file contents', why: 'Correct. Reference specific files when you want their content.' },
            { text: 'A summary of each component written by Claude', why: 'No summary is generated; you get a plain listing.' },
            { text: 'An error asking you to name one specific file', why: 'Directory mentions are supported and return a listing.' },
          ],
          answer: 1,
        },
        {
          id: 'q3',
          scenario: 'You need output in a strict house format for 40 release notes.',
          q: 'What most improves consistency?',
          options: [
            { text: 'A detailed paragraph describing the tone and voice of each note', why: 'Descriptions are read differently each time, so the output drifts.' },
            { text: 'One or two concrete examples plus explicit format rules', why: 'Correct. Examples pin down the format.' },
            { text: 'Telling Claude to be consistent and strict about the format', why: 'This restates the goal without showing what the format is.' },
            { text: 'Generating all 40 separately and fixing mismatches by hand', why: 'This treats the symptom. The instructions stay ambiguous.' },
          ],
          answer: 1,
        },
        {
          id: 'q4',
          scenario: 'A prompt asks for a new feature, a migration and a refactor at once. Results are tangled.',
          q: 'Best fix?',
          options: [
            { text: 'Add a longer description of each of the three jobs to the same prompt', why: 'A bigger prompt still mixes three outcomes together.' },
            { text: 'Split into focused prompts, checking each result before the next', why: 'Correct. One outcome per prompt, verified before moving on.' },
            { text: 'Ask for the refactor last so it can tidy the feature and migration', why: 'Still one prompt with tangled results, and refactoring unchecked work compounds mistakes.' },
            { text: 'Ask Claude to skip the tests so it can finish all three faster', why: 'Removing tests removes the only check on each change.' },
          ],
          answer: 1,
        },
        {
          id: 'q5',
          scenario: 'You want Claude to follow an existing pattern when adding an endpoint.',
          q: 'Best instruction?',
          options: [
            { text: 'Tell Claude to follow industry best practices for REST endpoints', why: 'Vague. Claude will pick its own idea of best practice, not yours.' },
            { text: 'Match @src/routes/users.ts and reuse its validation helper', why: 'Correct. It points at a concrete reference in your code.' },
            { text: 'Describe the endpoint in one sentence and let Claude choose the layout', why: 'Leaving the layout open invites drift from your structure.' },
            { text: 'Paste a generic Express tutorial into the prompt as a style guide', why: 'A generic tutorial does not show your pattern.' },
          ],
          answer: 1,
        },
      ],
    },
    {
      id: 'm4-l2',
      title: 'CLAUDE.md and project instructions',
      minutes: 35,
      summary: 'CLAUDE.md is the file Claude reads every session. Learn where it lives, what to put in it, and what to leave out.',
      objectives: [
        'Locate and choose the right CLAUDE.md file',
        'Explain how files combine and load',
        'Bootstrap with /init and refine into a concise file',
        'Use imports and rules to keep instructions modular',
      ],
      blocks: [
        {
          type: 'text',
          md: '[[claude-md-file|CLAUDE.md]] is persistent context loaded every session. Claude treats it as context, **not enforced configuration**. The more specific and concise it is, the better it is followed.',
        },
        {
          type: 'compare',
          title: 'Where instructions live',
          columns: ['Location', 'Shared with', 'Use for'],
          rows: [
            { label: 'Managed policy', cells: ['Windows: `C:\\Program Files\\ClaudeCode\\CLAUDE.md`; Linux and WSL: `/etc/claude-code/CLAUDE.md`; macOS: `/Library/Application Support/ClaudeCode/CLAUDE.md`', 'Everyone in the organization', 'Company standards, security policy'] },
            { label: 'Project', cells: ['`./CLAUDE.md` or `./.claude/CLAUDE.md`', 'Team via source control', 'Architecture, commands, conventions'] },
            { label: 'User', cells: ['`~/.claude/CLAUDE.md`', 'Only you, all projects', 'Personal style and tooling preferences'] },
            { label: 'Local', cells: ['`./CLAUDE.local.md` (add to .gitignore)', 'Only you, this project', 'Sandbox URLs, personal test data'] },
          ],
        },
        {
          type: 'callout',
          tone: 'version',
          title: 'Verify against your version',
          md: 'Behavior described here follows https://code.claude.com/docs/en/memory. `AGENTS.md` is read only when no CLAUDE.md applies (requires v2.1.277 or later), and `CLAUDE_CODE_NEW_INIT` changes `/init` behavior. Run `/context all` and check **Memory files** to see exactly what loaded.',
        },
        {
          type: 'diagram',
          title: 'How CLAUDE.md files load',
          mermaid:
            'flowchart TD\n  A["Session starts in repo/packages/api"] --> B["Managed policy CLAUDE.md"]\n  A --> C["User CLAUDE.md"]\n  A --> D["Ancestors: repo/CLAUDE.md"]\n  A --> E["Working dir: packages/api/CLAUDE.md"]\n  E --> F["CLAUDE.local.md appended last"]\n  A --> G["Subdirectory files load on demand"]\n  D --> H["All concatenated into context"]\n  E --> H\n  F --> H',
          nodes: {
            A: { title: 'Session start', what: 'Claude Code reads CLAUDE.md and CLAUDE.local.md from the working directory and every directory above it.', related: ['claude-md-hierarchy'] },
            B: { title: 'Managed policy', what: 'Organization wide file deployed by IT. Cannot be excluded by claudeMdExcludes.', useCase: 'Compliance and security guidance.' },
            C: { title: 'User CLAUDE.md', what: 'Your personal file at `~/.claude/CLAUDE.md`, applied to every project.' },
            D: { title: 'Ancestor files', what: 'Files above your working directory. Ordered from filesystem root downward.', example: 'repo/CLAUDE.md appears before packages/api/CLAUDE.md.' },
            E: { title: 'Working directory file', what: 'The closest file is read last, so it is closest to your task.' },
            F: { title: 'CLAUDE.local.md', what: 'Private file appended after CLAUDE.md at that level. Gitignore it.' },
            G: { title: 'On demand', what: 'CLAUDE.md files in subdirectories load when Claude works with files there.' },
            H: { title: 'Concatenated', what: 'Files are combined, not overridden. Contradictions can be resolved arbitrarily, so remove conflicts.', related: ['claude-md-file'] },
          },
          caption: 'Concatenation, not replacement. Put package specific rules in the package, shared rules at the root.',
        },
        {
          type: 'code',
          lang: 'markdown',
          title: 'CLAUDE.md for a sample app (Bookly API)',
          code: `# Bookly API

Node 20 + Express + PostgreSQL service for a book lending app.
Overview: @README.md

## Commands
- Install: npm ci
- Dev server: npm run dev (port 4000)
- Test all: npm test
- Test one file: npm test -- path/to/file.test.ts
- Lint and typecheck: npm run lint && npm run typecheck
- Run migrations: npm run db:migrate

## Architecture
- src/routes: HTTP handlers only, no business logic
- src/services: business logic, one file per domain
- src/db: query functions using the pg client; no ORM
- src/generated: generated from openapi.yaml, never edit by hand

## Conventions
- TypeScript strict. No any; use unknown and narrow.
- Validate every request body with the zod schemas in src/lib/schemas.ts
- Errors: throw AppError from src/lib/errors.ts; never send raw error text to clients
- Tests live next to the code as *.test.ts and use vitest

## Workflow
- Before finishing any task run npm run lint and npm test
- Make small commits; message format: type(scope): summary
- Never commit .env files or secrets

## Gotchas
- Integration tests need Postgres: docker compose up -d db
- Money is stored as integer cents. Never use floats.

## Do not
- Add dependencies without asking first
- Modify files under migrations/ that are already merged`,
          note: 'Start with [[init-command|`/init`]] to generate a first file (if one exists it suggests improvements instead of overwriting). Then edit hard: keep what Claude **cannot discover**, delete the rest, and aim for **under 200 lines**. Every line above is something Claude cannot reliably infer from the code.',
        },
        {
          type: 'tabs',
          tabs: [
            { label: 'Header and overview', md: '**What:** One line on the project plus an import of the README.\n\n**Why:** Orients Claude cheaply. The `@README.md` import reuses docs you already maintain (imports load with the file, so they add to context).\n\n**Tip:** Do not paste the whole README.' },
            { label: 'Commands', md: '**What:** Exact install, run, test, lint and migrate commands.\n\n**Why:** Claude cannot guess your scripts reliably, and this enables the [[verification-loop|verify and fix]] cycle.\n\n**Tip:** Include how to run a single test. It saves large amounts of time and context.' },
            { label: 'Architecture', md: '**What:** Where code lives and what each layer may do.\n\n**Why:** Stops logic leaking into route handlers and makes new files land in the right place.\n\n**Tip:** Mark generated or off limits folders explicitly.' },
            { label: 'Conventions', md: '**What:** Rules a linter will not catch: validation, error handling, test layout.\n\n**Why:** Keeps generated code consistent with the team.\n\n**Tip:** Be concrete and verifiable. "Use zod schemas" beats "validate input properly".' },
            { label: 'Workflow', md: '**What:** What Claude must do before declaring done.\n\n**Why:** Bakes in verification so every task ends with lint and tests.\n\n**Tip:** CLAUDE.md is guidance, not enforcement. For must-happen actions, use hooks.' },
            { label: 'Gotchas and Do not', md: '**What:** Non obvious pitfalls and hard boundaries.\n\n**Why:** This is the highest value content: it is tribal knowledge Claude cannot discover.\n\n**Tip:** Add a line whenever Claude makes the same mistake twice. Remove lines that are outdated.' },
            { label: 'Splitting a big file', md: '**What:** Move big topics out with [[claude-md-imports|imports]] (`@docs/testing.md`, up to four hops) or [[claude-rules-dir|`.claude/rules/`]] files that can be scoped to paths.\n\n**Why:** Keeps the main file short and easy to follow.\n\n**Tip:** Imports organize, but do not reduce context cost; path scoped rules do.' },
          ],
        },
        {
          type: 'exercise',
          exercise: {
            id: 'm4-ex-flaws-claudemd',
            kind: 'flaws',
            category: 'prompt',
            title: 'Critique this CLAUDE.md excerpt',
            prompt: 'Tick the real problems.',
            subject: '# Rules\n- Write clean, high quality code\n- Be careful with the database\n- Always use tabs\n- Always use 2 spaces for indentation\n- This app is a React app. React is a JavaScript library by Meta for building UIs with components and hooks...\n- Never run tests (they are slow)',
            flaws: [
              { text: 'Vague rules ("clean code", "be careful") that cannot be verified', real: true, why: 'Not actionable. State concrete behavior, for example "migrations are append only".' },
              { text: 'Contradicting instructions (tabs vs 2 spaces)', real: true, why: 'Docs warn Claude may pick one arbitrarily. Remove conflicts.' },
              { text: 'Explains what Claude already knows (what React is)', real: true, why: 'Wastes context and dilutes real rules.' },
              { text: 'Forbids running tests', real: true, why: 'Removes Claude verification loop. Give the fast command instead.' },
              { text: 'It is a markdown file', real: false, why: 'CLAUDE.md is meant to be markdown.' },
              { text: 'It has a heading', real: false, why: 'Headings are fine and helpful.' },
            ],
            improved: '# Rules\n- Indentation: 2 spaces (enforced by npm run lint)\n- Migrations in db/migrations are append only; never edit merged ones\n- Run the fast unit tests with npm test -- --changed before finishing',
          },
        },
        {
          type: 'exercise',
          exercise: {
            id: 'm4-ex-choose-prompt',
            kind: 'choose',
            category: 'prompt',
            title: 'Pick the best prompt',
            prompt: 'You want Claude to add pagination to the GET /books endpoint. Which prompt is best?',
            options: [
              { text: 'Add pagination to the GET /books endpoint so it handles large result sets well, using whatever approach is most scalable, and keep the response fast.', correct: false, why: 'No file, parameters or check, and "scalable" and "fast" are not measurable.' },
              { text: 'Add cursor pagination to GET /books in @src/routes/books.ts with limit (default 20, max 100) and cursor params. Match @src/routes/authors.ts, add tests, run npm test -- books.', correct: true, why: 'Specific files, parameters, reference pattern, scope and verification.' },
              { text: 'Make the books API better and scalable by applying all best practices, including pagination, caching and rate limiting, across every route in the project.', correct: false, why: 'Subjective and unbounded. It bundles several jobs and touches far more than needed.' },
              { text: 'Rewrite the routes folder so every list endpoint, including books, authors and users, supports pagination, and update all of the tests to match.', correct: false, why: 'Over broad. It changes far more than the one endpoint you asked about.' },
            ],
          },
        },
      ],
      quiz: [
        {
          id: 'q1',
          scenario: 'You want personal sandbox URLs for this repo that your team should not see.',
          q: 'Where do they go?',
          options: [
            { text: './CLAUDE.md committed to the repository and shared via git', why: 'Anyone who clones the repo would see them.' },
            { text: './CLAUDE.local.md in the repo root, added to .gitignore', why: 'Correct. Private and specific to this project.' },
            { text: '~/.claude/CLAUDE.md, the personal file in your home folder', why: 'Private, but it loads in every project, so repo specific URLs would leak into others.' },
            { text: 'The managed policy CLAUDE.md in the system folder', why: 'It applies to everyone in the organization.' },
          ],
          answer: 1,
        },
        {
          id: 'q2',
          scenario: 'You run Claude in repo/packages/api. Both repo/CLAUDE.md and packages/api/CLAUDE.md exist.',
          q: 'What happens?',
          options: [
            { text: 'Only packages/api/CLAUDE.md loads because it is the nearest', why: 'Files are concatenated, so the parent file loads too.' },
            { text: 'Both load into context, repo root first and packages/api last', why: 'Correct. The closest file is read last.' },
            { text: 'Only repo/CLAUDE.md loads; subfolder files need an @ import', why: 'The working directory file loads automatically.' },
            { text: 'Both load, but the nearest file replaces any conflicting rules', why: 'Files are combined, not overridden. Conflicts may be resolved arbitrarily, so remove them.' },
          ],
          answer: 1,
        },
        {
          id: 'q3',
          scenario: 'You ran /init and got a 300 line file full of generic statements.',
          q: 'Best next step?',
          options: [
            { text: 'Commit it as is, since /init output already reflects your repo', why: 'It often contains filler, and long files reduce adherence.' },
            { text: 'Trim to commands, gotchas and undiscoverable rules, under 200 lines', why: 'Correct. Keep what Claude cannot learn from the code.' },
            { text: 'Delete it and rely on Claude reading the code each session', why: 'You lose the commands and gotchas the code does not reveal.' },
            { text: 'Expand it with a full tutorial of each library the app uses', why: 'Claude already knows the libraries, and a longer file is followed less well.' },
          ],
          answer: 1,
        },
        {
          id: 'q4',
          scenario: 'Your CLAUDE.md says "never edit migrations" but Claude edited one anyway under pressure.',
          q: 'If this must never happen, what is the right control?',
          options: [
            { text: 'Repeat the migration rule at the top and bottom of CLAUDE.md', why: 'Repeating it is still only context, not enforcement.' },
            { text: 'Add a permission deny rule or a PreToolUse hook for that folder', why: 'Correct. CLAUDE.md is guidance; permissions and hooks enforce.' },
            { text: 'Move the rule into .claude/rules so it loads separately', why: 'Rules files are still context. They organize or scope, they do not enforce.' },
            { text: 'Put the rule in CLAUDE.local.md so it is read last', why: 'Being read last does not make a rule enforced.' },
          ],
          answer: 1,
        },
        {
          id: 'q5',
          scenario: 'You want to confirm which instruction files Claude actually loaded.',
          q: 'What do you run?',
          options: [
            { text: '/context all, then read the Memory files section of the output', why: 'Correct, per the docs.' },
            { text: '/init, which lists every file it finds before regenerating', why: '/init creates or improves a CLAUDE.md. It does not report what loaded.' },
            { text: '/compact, which prints the instructions it kept in the summary', why: '/compact summarizes the conversation. It is not a loaded files report.' },
            { text: 'Ask Claude to recite its rules and trust the answer', why: 'Claude can paraphrase or miss a file, so a recital is not a reliable check.' },
          ],
          answer: 0,
        },
        {
          id: 'q6',
          scenario: 'You import @docs/testing.md into CLAUDE.md hoping to save context.',
          q: 'What is true?',
          options: [
            { text: 'It saves context because imported files load only when needed', why: 'Imports load together with the parent file.' },
            { text: 'It organizes the content but still costs the same context', why: 'Correct. Path scoped rules are what reduce the load.' },
            { text: 'It is ignored unless the import sits inside a .claude/rules file', why: 'Imports work in CLAUDE.md, up to four hops deep.' },
            { text: 'It turns the imported rules into enforced settings', why: 'Imported text is still context, not enforcement.' },
          ],
          answer: 1,
        },
      ],
    },
    {
      id: 'm4-l3',
      title: 'Memory and managing the context window',
      minutes: 25,
      summary: 'Decide what Claude should remember, what belongs in chat, and how to manage the context window as sessions grow.',
      objectives: [
        'Distinguish CLAUDE.md from auto memory',
        'Monitor and control context with /context, /clear and /compact',
        'Choose what belongs in chat, CLAUDE.md or memory',
      ],
      blocks: [
        {
          type: 'text',
          md: 'Each session starts fresh. Two mechanisms carry knowledge forward: **CLAUDE.md** (you write it) and [[auto-memory|auto memory]] (Claude writes it).',
        },
        {
          type: 'compare',
          title: 'CLAUDE.md vs auto memory',
          columns: ['CLAUDE.md', 'Auto memory'],
          rows: [
            { label: 'Written by', cells: ['You', 'Claude, from your corrections'] },
            { label: 'Contains', cells: ['Rules and instructions', 'Learnings and patterns'] },
            { label: 'Shared', cells: ['Team via git (project file)', 'Machine local, per repository'] },
            { label: 'Manage with', cells: ['Editor or `/memory`', '`/memory` (browse, edit, toggle)'] },
          ],
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Where chat instructions go',
          md: 'Something said only in conversation can be lost after `/compact`. Project root CLAUDE.md is re-read from disk after compaction. Say "add this to CLAUDE.md" for rules that must persist.',
        },
        {
          type: 'text',
          md: 'The [[context-window-mgmt|context window]] fills with prompts, file reads and tool output. Manage it actively.\n\n- `/context` shows what is using space\n- `/clear` starts fresh between unrelated tasks\n- `/compact` summarizes a long session; you can add focus instructions\n- Subagents keep heavy research out of your main context\n- Reference exact files instead of letting Claude search broadly',
        },
        {
          type: 'promptCompare',
          title: 'Keeping context lean',
          bad: 'Here is the full 4,000 line log. Figure out what is wrong.\n[pastes everything]',
          good: 'Tests fail in CI. Here are the 30 lines around the first failure:\n[pastes trimmed error and stack trace]\nThe failing file is @src/billing/invoice.ts. Find the root cause before editing.',
          why: [
            'Trimmed, relevant output uses a fraction of the space.',
            'Pointing at the file avoids broad searching.',
            'Less noise means better focus on the real problem.',
          ],
        },
        {
          type: 'promptCompare',
          title: 'Handing off between sessions',
          bad: 'Continue what we were doing yesterday.',
          good: 'We are adding webhooks. Plan is in @docs/webhooks-plan.md; steps 1 and 2 are done and committed. Start step 3 only: the retry worker. Check git log for what changed.',
          why: [
            'A fresh session has no memory of yesterday; give it the state.',
            'A written plan on disk survives clears and compaction.',
            'It scopes the new session to one step.',
          ],
        },
        {
          type: 'exercise',
          exercise: {
            id: 'm4-ex-choose-context',
            kind: 'choose',
            category: 'approach',
            title: 'Context getting crowded',
            prompt: 'You finished a payments bug and now want to start an unrelated task on the search feature in the same terminal. What is best?',
            options: [
              { text: 'Stay in this session and tell Claude to ignore the payments work', correct: false, why: 'Ignored text still takes up context and can still influence results.' },
              { text: 'Run /clear, then start the search task with fresh context', correct: true, why: 'Unrelated work should start clean. Durable rules already live in CLAUDE.md.' },
              { text: 'Run /compact and continue with the search task in that session', correct: false, why: 'Compaction keeps a summary of payments work you no longer need.' },
              { text: 'Start the search task here, and run /clear only if it gets slow', correct: false, why: 'By then the payments noise has already hurt the early answers.' },
            ],
          },
        },
      ],
      quiz: [
        {
          id: 'q1',
          scenario: 'You told Claude mid chat "always use pnpm". After a long session and /compact it uses npm.',
          q: 'Why, and what is the fix?',
          options: [
            { text: 'Claude forgets tool preferences by design; retype the rule each prompt', why: 'Not by design. Rules in CLAUDE.md persist, so retyping is only a workaround.' },
            { text: 'The rule lived only in chat and was lost; add it to CLAUDE.md', why: 'Correct. CLAUDE.md is re-read from disk after compaction.' },
            { text: 'The model changed after compaction; start a new session and retry', why: '/compact does not change the model, and a new session would lose the chat rule too.' },
            { text: 'Auto memory overrode it; turn memory off to restore pnpm', why: 'Nothing suggests that. The rule was only in chat, and disabling memory will not bring it back.' },
          ],
          answer: 1,
        },
        {
          id: 'q2',
          scenario: 'You want to see and edit what Claude remembered about your repo.',
          q: 'What do you use?',
          options: [
            { text: '/memory, which lists memory files and opens the memory folder', why: 'Correct. You can browse, edit or toggle memory there.' },
            { text: '/context, which lists every remembered fact for you to edit', why: '/context shows what is using space. It is not an editor for memory.' },
            { text: '/compact, which writes remembered facts into CLAUDE.md for you', why: '/compact summarizes the conversation. It does not manage memory files.' },
            { text: '/clear, which shows memory entries before wiping the session', why: '/clear starts a fresh session. It does not show memory entries.' },
          ],
          answer: 0,
        },
        {
          id: 'q3',
          scenario: 'A teammate asks why their Claude does not know the Redis tip you taught yours.',
          q: 'Most likely reason?',
          options: [
            { text: 'Auto memory is machine local, so it never reached their setup', why: 'Correct. Put team knowledge in CLAUDE.md.' },
            { text: 'Their Claude needs the same model version to read your memory', why: 'Memory is plain markdown stored on your machine, not tied to a model version.' },
            { text: 'Auto memory syncs only if the teammate runs /init in the repo', why: '/init creates a CLAUDE.md. It does not sync auto memory.' },
            { text: 'Auto memory is committed to git, so they must pull it first', why: 'It is stored under your home folder and is not committed.' },
          ],
          answer: 0,
        },
        {
          id: 'q4',
          scenario: 'Mid session context is large and responses are drifting. You are still on the same task.',
          q: 'Best action?',
          options: [
            { text: '/compact with focus instructions naming the current task and decisions', why: 'Correct. It summarizes while keeping the task state.' },
            { text: '/clear, then retype the task in your own words from scratch', why: 'This loses the decisions and progress made so far.' },
            { text: 'Keep going; later turns reset the drift automatically', why: 'Quality keeps degrading as the context fills.' },
            { text: 'Paste the earlier discussion again so Claude has the full picture', why: 'This adds even more to a crowded context.' },
          ],
          answer: 0,
        },
        {
          id: 'q5',
          scenario: 'You need to investigate a huge module but keep your main context small.',
          q: 'Which approach fits?',
          options: [
            { text: 'Ask Claude to use a subagent to investigate and report back a summary', why: 'Correct. The reading happens in a separate context.' },
            { text: 'Open the key files with @ so Claude has all of them up front', why: 'Every mentioned file loads into your main context.' },
            { text: 'Paste the module into the prompt and ask for a short summary', why: 'The paste fills your context before any summary is written.' },
            { text: 'Run /compact first, then read the module in the main session', why: '/compact shrinks past history. New file reads still fill the context.' },
          ],
          answer: 0,
        },
      ],
    },
  ],
  assignments: [
    {
      id: 'm4-a1',
      title: 'Create a CLAUDE.md for a sample application',
      minutes: 45,
      starter: 'starters/shop-app',
      brief: 'Use the starter project in `starters/shop-app` of the academy repository (copy the folder out first) or your own small app. Create a CLAUDE.md that makes Claude productive in it, then prove it works.',
      steps: [
        'Run `/init` in the project and read the generated file',
        'Cut anything Claude could discover itself and anything generic',
        'Add exact commands, architecture map, conventions, gotchas and a Do not list',
        'Keep it under 200 lines; move big topics to an import or `.claude/rules/` file',
        'Start a new session, run `/context all` and confirm CLAUDE.md is under Memory files',
        'Test it: give a task and check Claude follows two of your rules without being told',
      ],
      deliverable: 'The final CLAUDE.md plus a short note describing one rule Claude followed and one it missed (and how you fixed it).',
      checklist: [
        'File is under 200 lines',
        'Commands are exact and include running a single test',
        'No contradictions or vague rules',
        'Includes a Gotchas or Do not section',
        'Verified loaded with /context all',
        'Personal notes are in CLAUDE.local.md, which is gitignored',
      ],
      hint: 'If Claude ignores a rule, make it more specific. If it must be enforced, use a hook or permission rule instead.',
    },
  ],
};
