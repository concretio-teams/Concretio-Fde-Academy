import type { Module, Concept } from '../types';

export const concepts: Concept[] = [
  {
    id: 'm6-vertical-slice',
    name: 'Vertical slice',
    what: 'A thin piece of a feature that works end to end (UI, API, data) instead of one finished layer at a time.',
    why: 'You get something runnable and verifiable after every step, so Claude and you catch wrong assumptions early.',
    how: 'Ask for the smallest path that a user can actually exercise, then widen it in later prompts.',
    when: 'Any new feature or a from-scratch app.',
    example: 'First slice of a notes app: `POST /notes` saves one note and the page lists it. Edit, delete and search come later.',
    mistakes: 'Asking for "the whole app" in one prompt, or building all database tables before any screen exists.',
    kind: 'workflow',
  },
  {
    id: 'm6-verification-loop',
    name: 'Verification loop',
    what: 'Giving Claude a command it can run to prove the work is correct (tests, type check, lint, curl).',
    why: 'Claude can run, read the failure and iterate by itself. Without a check, you become the test runner.',
    how: 'End every prompt with the exact command and the expected result, for example `npm test` must pass and `npx tsc --noEmit` must be clean.',
    when: 'Every task that changes behavior.',
    example: 'Run `npm test -- orders` and fix failures until it is green. Do not edit the tests to make them pass.',
    mistakes: 'Trusting "done" without running anything, or letting Claude weaken a test to get green.',
    kind: 'workflow',
  },
  {
    id: 'm6-plan-mode',
    name: 'Plan mode',
    what: 'A permission mode where Claude reads and explores the code and writes a plan but does not edit files until you approve.',
    why: 'Reviewing a plan is cheaper than reviewing a wrong 20 file diff.',
    how: 'Press `Shift+Tab` to cycle modes, start with `claude --permission-mode plan`, or prefix a prompt with `/plan`.',
    when: 'Unfamiliar codebases, multi file changes, refactors, anything risky.',
    example: '`/plan add soft delete to invoices and list every file you expect to touch`',
    mistakes: 'Skipping the plan on large changes, or approving it without reading the file list.',
    kind: 'command',
  },
  {
    id: 'm6-scope-fence',
    name: 'Scope fence',
    what: 'Explicit constraints in the prompt about what Claude may and may not change.',
    why: 'Claude tends to be helpful beyond the ask. Fences keep diffs small and reviewable.',
    how: 'State files or folders in scope, things to leave alone, and dependencies you do not want added.',
    when: 'Bug fixes, refactors and changes in shared code.',
    example: 'Only touch `src/billing/`. Do not change public function signatures. Add no new dependencies.',
    mistakes: 'Leaving the scope open and then receiving formatting changes across unrelated files.',
    kind: 'concept',
  },
  {
    id: 'm6-repro-first',
    name: 'Reproduce first',
    what: 'Turning a bug report into a failing command or test before changing any code.',
    why: 'A fix you cannot reproduce is a guess. A failing test also becomes the regression guard.',
    how: 'Give the exact steps, input, expected and actual result, and ask Claude to write the failing test first.',
    when: 'Every bug.',
    example: 'Write a test that sends a negative quantity and shows the current 500 response. Then fix it.',
    mistakes: 'Pasting only "it is broken" or fixing the symptom where the error shows up instead of the cause.',
    kind: 'workflow',
  },
  {
    id: 'm6-characterization-test',
    name: 'Characterization test',
    what: 'A test that records what legacy code does today, right or wrong, before you refactor it.',
    why: 'It proves a refactor changed structure and not behavior.',
    how: 'Feed the current function many inputs, assert the current outputs, then refactor while the tests stay green.',
    when: 'Before touching code that has no tests.',
    example: 'Assert `price(100, "GOLD", 3)` equals today\'s output, even if the number looks odd.',
    mistakes: 'Refactoring first and writing tests that match the new code, which proves nothing.',
    kind: 'concept',
  },
  {
    id: 'm6-migration',
    name: 'Database migration',
    what: 'A versioned script that changes the database schema in small, repeatable, reviewable steps.',
    why: 'Schema changes in code review and in version control are safer than ad hoc edits to a live database.',
    how: 'Ask Claude to write the migration and the matching rollback, run it on a local or disposable database, and never point it at production.',
    when: 'Any new table, column or index.',
    example: '`ALTER TABLE tasks ADD COLUMN due_date date;` plus a down script that drops it.',
    mistakes: 'Letting an agent connect to a production database, or editing an already applied migration.',
    kind: 'concept',
  },
  {
    id: 'm6-idempotency',
    name: 'Idempotent operation',
    what: 'An operation that has the same effect whether it runs once or several times.',
    why: 'Third party APIs and webhooks retry. Without idempotency you double charge or double create.',
    how: 'Store an event id or idempotency key and ignore repeats.',
    when: 'Payments, webhooks, retries, queues.',
    example: 'A webhook handler that skips an event id it has already processed.',
    mistakes: 'Retrying a non idempotent POST on timeout.',
    kind: 'concept',
  },
  {
    id: 'm6-claude-md-conventions',
    name: 'Project conventions in CLAUDE.md',
    what: 'A `CLAUDE.md` file with your build, test and style commands that Claude reads at the start of each session.',
    why: 'Claude stops guessing how to run tests or which patterns the repo uses.',
    how: 'Run `/init` to generate a starting file, then trim it to the commands and rules Claude cannot infer. Edit it with `/memory`.',
    when: 'Once per project, refined as you notice repeated corrections.',
    example: 'Test: `npm test`. Lint: `npm run lint`. API errors always use the `AppError` class.',
    mistakes: 'A giant file full of obvious things, or never updating it after conventions change.',
    kind: 'config',
  },
];

export const module: Module = {
  id: 'm6',
  number: 6,
  title: 'Real-World Vibe Coding',
  tagline: 'Ten practical scenarios: from a one line requirement to a complete application.',
  level: 'Core',
  requires: ['m3', 'm4'],
  outcomes: [
    'Turn a vague requirement into a scoped, verifiable prompt with context, constraints and a check command',
    'Explore and change an unfamiliar codebase safely using plan mode and small diffs',
    'Build frontend, backend, database and third party integrations as thin vertical slices',
    'Debug by reproducing first, then fixing the cause and locking it in with a test',
    'Refactor legacy code and write tests without changing behavior by accident',
    'Deliver a complete application from scratch in reviewable steps',
  ],
  skills: ['Feature delivery', 'Debugging with AI', 'Refactoring and tests', 'Full stack prompting'],
  lessons: [
    // ---------------------------------------------------------------- LESSON 1
    {
      id: 'm6-l1',
      title: 'Features, existing code, frontend and APIs',
      minutes: 55,
      summary: 'Practice on realistic jobs: add a feature, change unfamiliar code, build a screen and an API, one small slice at a time.',
      objectives: [
        'Expand a simple requirement into a prompt with acceptance criteria',
        'Understand an unfamiliar app before modifying it',
        'Build a UI and an API as small, verifiable slices',
        'Choose between plan mode and direct execution for a task',
      ],
      blocks: [
        {
          type: 'text',
          md: `Real projects rarely start with a clean prompt. They start with "add a due date to tasks" or "the checkout page looks off".

This lesson covers four everyday scenarios. In each, the pattern is the same: **context, constraints, a verification step**, and a [[m6-vertical-slice|vertical slice]] you can run.

Keep project commands in [[m6-claude-md-conventions|CLAUDE.md]] so every prompt can be short.`,
        },
        {
          type: 'scenario',
          title: 'Scenario 1: Build a feature from a simple requirement',
          problem:
            'Product says: "Users should be able to set a due date on a task and see overdue tasks highlighted." That is one sentence. The details are yours to find.',
          context: [
            'Stack and where tasks live (model, API route, UI component)',
            'How tests run and what style existing code uses',
            'Edge cases: past dates, no date, time zones',
            'What is out of scope (reminders, emails)',
          ],
          prompt:
            'Feature: optional due date on tasks, with overdue tasks highlighted in the list.\n\nContext: tasks are in src/models/task.ts, the API is src/routes/tasks.ts, the UI is src/components/TaskList.tsx. Follow the existing patterns there. Tests run with `npm test`.\n\nBehavior:\n- dueDate is optional (ISO date string), stored in UTC date only, no time.\n- A task is overdue if dueDate is before today and it is not done.\n- Overdue rows get the existing `text-danger` style.\n\nConstraints: no new dependencies, do not change the response shape for existing fields, no reminders or notifications.\n\nFirst, ask me about anything ambiguous. Then give a short plan listing the files you will touch. After I approve, implement it, add tests for the overdue rule, and run `npm test` and `npx tsc --noEmit`.',
          approach: [
            'Use `/plan` so Claude explores the model, route and UI first and lists the files it will change',
            'Let Claude ask clarifying questions, then answer them in the prompt or in CLAUDE.md for next time',
            'Implement the thinnest slice: model field, API accepts and returns it, then the UI',
            'Put the overdue rule in one pure function and test it with past, today, future and done cases',
            'Run tests and the type check, then review the diff with `/diff`',
          ],
          mistakes: [
            'Pasting the one line requirement and accepting whatever Claude assumes about time zones and "overdue"',
            'Letting Claude add a date library for a one line comparison',
            'Skipping the test for the edge case "due today", which is not overdue',
            'Approving a huge diff instead of asking for it in slices',
          ],
          checklist: [
            'Acceptance criteria are written in the prompt, not in your head',
            'Overdue logic lives in one tested function',
            'Existing tasks without a date still load and render',
            'Tests and type check pass when you run them yourself',
            'Diff touches only the files in the plan',
          ],
        },
        {
          type: 'scenario',
          title: 'Scenario 2: Understand and modify an existing application',
          problem:
            'You joined a team and must change how invoice totals are rounded in a 4 year old Node app you have never seen, with thin docs.',
          context: [
            'Repository you can run locally',
            'A concrete entry point: the page, endpoint or function that shows the symptom',
            'The exact change wanted and what must not change',
            'How to run the app and its tests',
          ],
          prompt:
            'I am new to this repo. Do not edit anything yet.\n\n1. Find where invoice totals are calculated and rounded. Start from the GET /invoices/:id route and trace down. Show the call chain with file paths and line numbers.\n2. List every other place that rounds money, and any tests that cover it.\n3. Tell me how you would change rounding from per line to per invoice, and what existing behavior could break.\n\nThen wait. Do not propose code until I confirm the plan.',
          approach: [
            'Start read only: use plan mode and ask for a map of the call chain, not a change',
            'Use `@src/invoices/` style file mentions to focus Claude on the right folder',
            'Ask for existing tests and run them first to get a green baseline',
            'Approve a plan, then make the change with a scope fence on that module',
            'If the session gets long, use `/compact` or `/clear` before the next topic',
          ],
          mistakes: [
            'Asking for the change before the explanation, so Claude edits the wrong rounding site',
            'Not running the baseline tests, so you cannot tell if you broke them',
            'Trusting Claude\'s summary without opening the cited lines',
            'Missing the second place that rounds money, producing mismatched totals',
          ],
          checklist: [
            'You can explain the call chain in your own words',
            'Baseline tests were green before the change',
            'All rounding sites were found and either changed or consciously left alone',
            'A test now pins the new rounding rule',
            'Diff is limited to the invoice module',
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'Plan first when you cannot predict the diff',
          md: `If you cannot say which files will change, start in [[m6-plan-mode|plan mode]]. Press **Shift+Tab** to cycle modes, or use **/plan** before one prompt.

For a one file typo fix, planning is overhead. Match ceremony to risk.`,
        },
        {
          type: 'scenario',
          title: 'Scenario 3: Build a frontend interface',
          problem:
            'You need a filterable, sortable "Orders" table with loading, empty and error states, matching the existing design system.',
          context: [
            'Framework and component library in use (for example React and an internal UI kit)',
            'Design tokens or an existing similar page to copy from',
            'The API contract the table calls (URL, params, response shape)',
            'Accessibility and responsive requirements',
          ],
          prompt:
            'Build an Orders page at src/pages/Orders.tsx.\n\nFollow src/pages/Customers.tsx for layout, data fetching and styling. Use components from src/ui only, no new libraries.\n\nData: GET /api/orders?status=&sort= returns { items: [{ id, customer, total, status, createdAt }] }.\n\nRequirements:\n- Table with columns id, customer, total, status, created.\n- Status filter (select) and sortable created and total columns.\n- Loading skeleton, empty state ("No orders match"), and error state with a retry button.\n- Keyboard accessible: sortable headers are buttons, table has a caption.\n- Works at 375px width (horizontal scroll is acceptable).\n\nVerify: write component tests with Testing Library for the loading, empty, error and filter cases, then run `npm test -- Orders` and `npx tsc --noEmit`. Start the dev server with `npm run dev` and tell me which URL to open to check it visually.',
          approach: [
            'Point Claude at an existing page so it copies real patterns instead of inventing styles',
            'Define the API contract in the prompt so the UI does not guess field names',
            'Build the happy path first, then the loading, empty and error states',
            'Have Claude write tests for each state, and open the page in a browser yourself',
            'Review the diff for hard coded colors, missing keys and inaccessible controls',
          ],
          mistakes: [
            'Not naming a reference page, which yields a new visual style',
            'Only testing the happy path and shipping a blank screen on API errors',
            'Accepting inline styles and hard coded colors that bypass design tokens',
            'Assuming "tests pass" means it looks right; you still need to look at it',
          ],
          checklist: [
            'Matches the reference page in layout and components',
            'Loading, empty and error states each have a test',
            'Sort and filter work from the keyboard',
            'No new dependencies, no hard coded colors',
            'You viewed it in a browser at desktop and phone widths',
          ],
        },
        {
          type: 'scenario',
          title: 'Scenario 4: Create a backend API',
          problem:
            'The Orders page needs endpoints: list with filters, create, and update status, with validation and consistent errors.',
          context: [
            'Framework (Express, Fastify, Nest) and router layout',
            'Validation library and error format already used',
            'Auth model: who may call what',
            'Where data comes from (an interface, since the database arrives in the next lesson)',
          ],
          prompt:
            'Add an Orders API in src/routes/orders.ts, following src/routes/customers.ts for structure and the AppError class for errors.\n\nEndpoints:\n- GET /orders?status=&sort=createdAt|total: list, default sort createdAt desc.\n- POST /orders: body { customerId, items: [{ sku, qty }] }. qty is an integer 1 to 100. Returns 201 with the created order.\n- PATCH /orders/:id/status: body { status } where status is one of pending, paid, shipped. Only allowed transitions: pending to paid, paid to shipped. Otherwise 409.\n\nRules: validate with zod, 400 with field errors on bad input, 404 for unknown id, require the existing auth middleware, use the OrderRepo interface (in-memory implementation for now). No new dependencies.\n\nVerify: write supertest tests for success, validation failure, 404, invalid transition and unauthenticated calls. Run `npm test -- orders` until green and show me the output.',
          approach: [
            'Describe each endpoint as a contract: method, path, input, output and every error code',
            'Ask Claude to code against a repository interface so persistence can change later',
            'Make state transitions explicit, as a small table in code, not scattered ifs',
            'Test unhappy paths first: bad input, unknown id, wrong transition, no auth',
            'Run the server and hit it with curl once to confirm the real wiring, not just the tests',
          ],
          mistakes: [
            'Describing only the happy path, so errors come back as 500s with stack traces',
            'Forgetting the auth middleware on the new routes',
            'Letting validation live inside handlers differently on each route',
            'Trusting a response shape that the frontend does not actually match',
          ],
          checklist: [
            'Every endpoint has a documented success and error response',
            'Input is validated at the boundary and rejected with 400',
            'Illegal status transitions return 409',
            'Auth is enforced and tested',
            'Tests cover unhappy paths and pass when you rerun them',
          ],
        },
        {
          type: 'code',
          lang: 'typescript',
          title: 'Scenario 4: an Express route with validation (what good output looks like)',
          code: `import { Router } from 'express';
import { z } from 'zod';
import { AppError } from '../errors';
import { requireAuth } from '../middleware/auth';
import type { OrderRepo } from '../repos/orderRepo';

const createSchema = z.object({
  customerId: z.string().min(1),
  items: z
    .array(z.object({ sku: z.string().min(1), qty: z.number().int().min(1).max(100) }))
    .min(1),
});

const statusSchema = z.object({ status: z.enum(['pending', 'paid', 'shipped']) });

const allowed: Record<string, string[]> = {
  pending: ['paid'],
  paid: ['shipped'],
  shipped: [],
};

export function ordersRouter(repo: OrderRepo): Router {
  const router = Router();
  router.use(requireAuth);

  router.post('/', async (req, res, next) => {
    try {
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, 'Invalid body', parsed.error.flatten().fieldErrors);
      }
      const order = await repo.create(parsed.data);
      res.status(201).json(order);
    } catch (err) {
      next(err);
    }
  });

  router.patch('/:id/status', async (req, res, next) => {
    try {
      const parsed = statusSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(400, 'Invalid status', parsed.error.flatten().fieldErrors);
      }
      const order = await repo.get(req.params.id);
      if (!order) throw new AppError(404, 'Order not found');
      if (!allowed[order.status].includes(parsed.data.status)) {
        throw new AppError(409, 'Cannot go from ' + order.status + ' to ' + parsed.data.status);
      }
      res.json(await repo.update(order.id, { status: parsed.data.status }));
    } catch (err) {
      next(err);
    }
  });

  return router;
}`,
          note: 'Notice the transition table, input validation at the edge, and the repository interface. These are what you should look for when reviewing generated API code.',
        },
        {
          type: 'diagram',
          title: 'From requirement to merged feature',
          mermaid: `flowchart TD
  A["Vague requirement"] --> B["Write acceptance criteria"]
  B --> C["Plan mode: explore and plan"]
  C --> D{"Plan correct?"}
  D -->|"No"| C
  D -->|"Yes"| E["Implement thin slice"]
  E --> F["Run tests and type check"]
  F --> G{"Green?"}
  G -->|"No"| E
  G -->|"Yes"| H["Review diff yourself"]
  H --> I["Commit"]`,
          nodes: {
            A: {
              title: 'Vague requirement',
              what: 'One sentence from a ticket or a stakeholder. It hides edge cases, scope and definition of done.',
              example: '"Highlight overdue tasks."',
              useCase: 'Every real feature starts here.',
              related: ['m6-vertical-slice'],
            },
            B: {
              title: 'Write acceptance criteria',
              what: 'Turn the sentence into testable statements: inputs, outputs, edge cases, out of scope.',
              example: 'Due today is not overdue. Done tasks are never overdue.',
              useCase: 'These become the test cases and the prompt body.',
            },
            C: {
              title: 'Plan mode',
              what: 'Claude explores the code and proposes a plan and file list without editing.',
              example: '`/plan implement the overdue rule` then read the file list.',
              related: ['m6-plan-mode'],
            },
            D: {
              title: 'Plan correct?',
              what: 'You check scope, files and approach. Reject and refine instead of fixing later.',
              useCase: 'Cheapest place to catch a wrong assumption.',
            },
            E: {
              title: 'Implement thin slice',
              what: 'Smallest end to end change first, widened in later steps.',
              related: ['m6-vertical-slice'],
            },
            F: {
              title: 'Run tests and type check',
              what: 'Claude runs the command you named and fixes failures.',
              example: '`npm test` and `npx tsc --noEmit`',
              related: ['m6-verification-loop'],
            },
            G: {
              title: 'Green?',
              what: 'Confirm yourself by rerunning. If red, Claude iterates on the failure output.',
            },
            H: {
              title: 'Review diff yourself',
              what: 'Read the changes with `/diff` or your git tool. You own what you commit.',
              useCase: 'Look for scope creep, new dependencies, weakened tests.',
            },
            I: {
              title: 'Commit',
              what: 'One reviewable commit per slice with a clear message.',
            },
          },
          caption: 'Click a node to see what happens there and why it matters.',
        },
        {
          type: 'exercise',
          exercise: {
            id: 'm6-ex-l1-approach',
            title: 'Pick the approach: unfamiliar payment code',
            category: 'approach',
            kind: 'choose',
            prompt:
              'Your manager asks you to change how refunds are calculated in a payments module you have never opened. It has about 30 files and few tests. What is the best first move?',
            options: [
              {
                text: 'Ask Claude to change refunds to include shipping, then review the resulting diff afterward.',
                correct: false,
                why: 'It will edit before it understands the module, and you cannot judge a diff in code you do not know.',
              },
              {
                text: 'Use plan mode: map how refunds are computed, list tests and risks, and plan before any edit.',
                correct: true,
                why: 'Read only exploration builds shared understanding and a reviewable plan. Mistakes are caught before code changes.',
              },
              {
                text: 'Rewrite the payments module cleanly first, since the missing tests mean nothing to preserve.',
                correct: false,
                why: 'A rewrite of money code without tests is the riskiest option. Fewer tests means you need more caution, not less.',
              },
              {
                text: 'Ask Claude for a long summary of all 30 files, then start editing from that summary.',
                correct: false,
                why: 'Too broad. A targeted trace from the refund entry point is cheaper and more accurate than summarizing everything.',
              },
            ],
            explanation:
              'Unknown code plus high stakes means explore first. Plan mode keeps Claude read only until you approve.',
          },
        },
        {
          type: 'exercise',
          exercise: {
            id: 'm6-ex-l1-prompt',
            title: 'Fix the weak prompt',
            category: 'prompt',
            kind: 'flaws',
            prompt: 'Tick the real problems with this prompt for adding the Orders API.',
            subject: 'Make an orders API with all the CRUD stuff. Make it good and secure. Use whatever database.',
            flaws: [
              {
                text: 'No framework, file location or existing pattern to follow',
                real: true,
                why: 'Claude has to guess structure instead of matching your repo.',
              },
              {
                text: 'No validation rules, error codes or state transitions',
                real: true,
                why: '"Good and secure" is not testable. Concrete rules are.',
              },
              {
                text: 'No verification step such as tests to run',
                real: true,
                why: 'Without a check, correctness depends on you reading everything.',
              },
              {
                text: 'The prompt is too short to be useful, so it should be a full page of text',
                real: false,
                why: 'Length is not the issue. Missing specifics are. A focused 10 line prompt can be enough.',
              },
              {
                text: '"Use whatever database" decides a major dependency by accident',
                real: true,
                why: 'Persistence is a design choice. Name it, or code against an interface for now.',
              },
            ],
            improved:
              'Add an Orders API in src/routes/orders.ts following customers.ts. Endpoints, bodies and error codes listed. Validate with zod, use the OrderRepo interface, no new dependencies. Write supertest tests for success, 400, 404, 409 and unauthenticated, and run `npm test -- orders`.',
            explanation: 'Good prompts carry context, constraints and a verification step.',
          },
        },
      ],
      quiz: [
        {
          id: 'q1',
          scenario: 'The ticket says: "Add a due date to tasks." You have not opened the repo. Claude is ready to start.',
          q: 'Best way to begin?',
          options: [
            {
              text: 'Paste the one line ticket and let Claude pick the date format, overdue rule and UI placement.',
              why: 'Claude fills gaps with assumptions about time zones, overdue rules and UI. You find out in review.',
            },
            {
              text: 'Write acceptance criteria, name files to follow, and start in plan mode with questions.',
              why: 'Correct. Criteria plus a plan review catches wrong assumptions before any code exists.',
            },
            {
              text: 'Ask Claude to build the due date plus reminders and email alerts in one large first pass.',
              why: 'Reminders and emails were never requested. Large first prompts produce large, hard to review diffs.',
            },
            {
              text: 'Have Claude write the tests first, then work out later what "overdue" should mean.',
              why: 'Tests need the behavior defined first. Without criteria they just encode guesses.',
            },
          ],
          answer: 1,
        },
        {
          id: 'q2',
          scenario: 'Claude finished the overdue feature and says "All tests pass." You did not see the run.',
          q: 'What do you do before committing?',
          options: [
            {
              text: 'Commit now, because Claude ran the tests and reported green, so the run is trustworthy.',
              why: 'A summary is a claim, not evidence. Output can be stale or from a narrower test run.',
            },
            {
              text: 'Rerun `npm test` and the type check yourself, then read the `/diff` before you commit.',
              why: 'Correct. You own the commit. Independent verification and a diff review are the minimum.',
            },
            {
              text: 'Ask Claude to run the tests again and confirm green, then commit with its summary.',
              why: 'Asking the same source again adds no evidence. You still have not seen a run.',
            },
            {
              text: 'Delete the tests that cover the new code so a later run cannot fail the build.',
              why: 'Removing tests destroys your safety net and hides the next regression.',
            },
          ],
          answer: 1,
        },
        {
          id: 'q3',
          scenario: 'Invoice rounding must change in a repo you do not know. You asked Claude to explain and it summarized three files.',
          q: 'Which follow up is best?',
          options: [
            {
              text: 'Ask for file paths and line numbers of the call chain, then open two to check.',
              why: 'Correct. Citations make the explanation checkable, and you spot invented structure quickly.',
            },
            {
              text: 'Accept the three file summary as accurate and ask for the rounding change next.',
              why: 'An unchecked summary may miss a second rounding site, causing inconsistent totals.',
            },
            {
              text: 'Ask Claude to rewrite all three files for clarity before changing the rounding.',
              why: 'A rewrite is unrelated to the requested change and raises risk in code you do not know.',
            },
            {
              text: 'Switch models and trust whichever answer is longer or sounds more confident.',
              why: 'Length and confidence are not accuracy. Verify against the code.',
            },
          ],
          answer: 0,
        },
        {
          id: 'q4',
          scenario: 'You asked for the Orders page. Claude produced a table with inline styles and its own colors. Tests pass.',
          q: 'What is the most likely cause and fix?',
          options: [
            {
              text: 'Tests are too weak. Add unit tests that assert each color value against the design tokens.',
              why: 'Tests check behavior, not your design system. The real cause is a missing reference.',
            },
            {
              text: 'No reference page was named. Point it at `Customers.tsx` and `src/ui`, ban inline styles.',
              why: 'Correct. Claude copies what it is pointed at. Name the pattern and the constraint.',
            },
            {
              text: 'Claude is weak at frontend work. Build the page by hand and use it only for the API.',
              why: 'It can do frontend work when it knows your patterns. This is a prompting gap, not a capability gap.',
            },
            {
              text: 'Accept the styling for now and schedule a cleanup sprint once the feature has shipped.',
              why: 'Design debt compounds. A one line constraint fixes it now.',
            },
          ],
          answer: 1,
        },
        {
          id: 'q5',
          scenario: 'Your new PATCH endpoint returns 500 with a stack trace when the status is "refunded", which is not in the enum.',
          q: 'What should the prompt have included to avoid this?',
          options: [
            {
              text: 'A line saying "make it secure and handle bad input properly" without naming the codes.',
              why: 'Vague. It does not tell Claude the exact behavior for invalid input.',
            },
            {
              text: 'Say bad input must return 400 with field errors, validated at the edge, and test it.',
              why: 'Correct. Specifying the error contract and testing it makes the behavior intentional.',
            },
            {
              text: 'A larger context window so the model sees every route and middleware at once.',
              why: 'The model had enough context. It lacked the requirement.',
            },
            {
              text: 'Nothing; unknown status values are rare, and a 500 is acceptable for rare input.',
              why: 'Bad client input should be a 4xx. A 500 leaks internals and hides client bugs.',
            },
          ],
          answer: 1,
        },
        {
          id: 'q6',
          scenario: 'You are fixing a typo in a button label, one file, one line.',
          q: 'What is the right level of process?',
          options: [
            {
              text: 'Start in plan mode, write acceptance criteria, and approve a plan before the edit.',
              why: 'Overkill for a one line change. Ceremony should match risk.',
            },
            {
              text: 'Ask directly, giving the file and the new label text, then glance at the `/diff`.',
              why: 'Correct. Low risk and easy to verify means no heavy process.',
            },
            {
              text: 'Fix the label, and tidy the whole component for consistency while the file is open.',
              why: 'Scope creep. It turns a trivial change into a review burden.',
            },
            {
              text: 'Avoid Claude for small edits, because the setup costs more than typing it yourself.',
              why: 'Small tasks are fine. Just keep the prompt small and the diff small.',
            },
          ],
          answer: 1,
        },
      ],
    },

    // ---------------------------------------------------------------- LESSON 2
    {
      id: 'm6-l2',
      title: 'Databases, third party APIs and debugging',
      minutes: 50,
      summary: 'Add a database, connect an outside API, and debug by reproducing the problem first.',
      objectives: [
        'Add persistence with a migration and a repository layer safely',
        'Integrate an external API with timeouts, retries and idempotency',
        'Debug by reproducing first and fixing the cause, not the symptom',
        'Decide when to give Claude logs, tests or a debugger session',
      ],
      blocks: [
        {
          type: 'text',
          md: `Data and external systems are where AI generated code fails quietly: a missing index, a retry that double charges, a bug fixed in the wrong place.

The three scenarios here add the safety habits that matter most: **disposable databases, idempotent integrations, and [[m6-repro-first|reproduce first]]**.`,
        },
        {
          type: 'scenario',
          title: 'Scenario 5: Database integration',
          problem:
            'Replace the in-memory OrderRepo with Postgres. You need the schema, a migration, a repository implementation and tests that run against a real database.',
          context: [
            'Database engine and client library already in the project (or your preference)',
            'Entities, relations and the queries the API needs',
            'Migration tool and how to run it locally',
            'A disposable local database (docker or a test schema), never production credentials',
          ],
          prompt:
            'Implement PgOrderRepo in src/repos/pgOrderRepo.ts, replacing the in-memory repo behind the same OrderRepo interface.\n\nSchema: orders(id uuid pk, customer_id uuid not null, status text not null default \'pending\', created_at timestamptz not null default now()) and order_items(order_id fk, sku text, qty int check qty > 0).\n\nRequirements:\n- Create a numbered migration in db/migrations/ with a matching down migration. Do not edit existing migrations.\n- Use parameterized queries only. Create and its items must be one transaction.\n- Add an index for listing by status and created_at.\n\nSafety: use only the DATABASE_URL in .env.test that points at the local docker database. Never read or print other environment files and never connect to anything else.\n\nVerify: run the migration up and down on the local db, then write repository tests against it and run `npm test -- pgOrderRepo`. Show me the generated SQL for review before running it.',
          approach: [
            'Ask for the migration SQL first and read it yourself before it is applied',
            'Run migrations only against a disposable local or test database',
            'Keep the repository interface unchanged so the API and its tests do not move',
            'Insist on parameterized queries and a transaction for multi table writes',
            'Test with a real database, including rollback and a constraint violation',
          ],
          mistakes: [
            'Giving the agent a production connection string "to speed things up"',
            'String concatenated SQL, which is injectable',
            'Editing an already applied migration instead of adding a new one',
            'No index for the main list query, which only hurts once data grows',
            'Mocking the database in tests and never running the SQL',
          ],
          checklist: [
            'Migration has an up and a down and both were run locally',
            'Queries are parameterized; multi table writes are transactional',
            'The API layer needed no change when the repo was swapped',
            'Tests hit a real database and cover a constraint failure',
            'No credentials appear in code, logs or the prompt history',
          ],
        },
        {
          type: 'code',
          lang: 'sql',
          title: 'Scenario 5: a reviewable migration (up, then down)',
          code: `-- db/migrations/0003_create_orders.up.sql
BEGIN;

CREATE TABLE orders (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  status      text NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'paid', 'shipped')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sku      text NOT NULL,
  qty      integer NOT NULL CHECK (qty > 0),
  PRIMARY KEY (order_id, sku)
);

CREATE INDEX orders_status_created_idx ON orders (status, created_at DESC);

COMMIT;

-- db/migrations/0003_create_orders.down.sql
BEGIN;
DROP TABLE order_items;
DROP TABLE orders;
COMMIT;`,
          note: 'Uses `gen_random_uuid()`, built in to PostgreSQL 13 and later. Run it only against a local or test database. Review constraints and the index before applying.',
        },
        {
          type: 'scenario',
          title: 'Scenario 6: Third party API integration',
          problem:
            'Orders must be charged through a payment provider and shipment updates arrive by webhook. The provider times out sometimes and sends duplicate webhooks.',
          context: [
            'Provider docs or an OpenAPI spec (paste the relevant section or put it in the repo)',
            'Sandbox or test keys only, stored in environment variables',
            'Required behavior on timeout, 4xx and 5xx responses',
            'Webhook signature verification method from the provider docs',
          ],
          prompt:
            'Integrate the payment provider using the docs in docs/provider-api.md. Read it fully before writing code.\n\nBuild src/payments/client.ts with createCharge(orderId, amountCents) and a webhook handler at POST /webhooks/payments.\n\nRules:\n- Read the API key from PAYMENTS_API_KEY. Never hard code or log it.\n- 5 second timeout. Retry only on network errors and 5xx, max 2 retries with backoff. Never retry a 4xx.\n- Send an Idempotency-Key header equal to the order id so a retry cannot double charge (check the docs that the provider supports it, and tell me if not).\n- Webhook: verify the signature first and reject with 401 if invalid. Store processed event ids and ignore repeats.\n- Map provider errors to our AppError, no raw provider messages to the client.\n\nVerify: tests with a mocked HTTP layer for success, timeout then success, 4xx no retry, duplicate webhook, and bad signature. Run `npm test -- payments`. Do not call the real API.',
          approach: [
            'Give Claude the real provider docs; do not rely on its memory of an API that may have changed',
            'Wrap the provider in one client module so the rest of the app never sees its details',
            'Define retry, timeout and error mapping rules explicitly',
            'Make charges and webhook handling [[m6-idempotency|idempotent]]',
            'Test with mocked HTTP and use sandbox keys for a manual end to end check',
          ],
          mistakes: [
            'Relying on the model\'s memory of the API instead of the current docs',
            'Retrying non idempotent calls on timeout and double charging customers',
            'Skipping webhook signature verification',
            'Logging full request bodies that include secrets or card related data',
            'Testing against the live API from your laptop',
          ],
          checklist: [
            'Keys come from the environment and never appear in code or logs',
            'Timeouts, retry rules and error mapping are tested',
            'Duplicate webhook delivery is harmless',
            'Signature verification rejects bad requests',
            'Behavior matches the provider docs you supplied',
          ],
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Keep secrets and production out of the session',
          md: `Everything Claude reads or runs can end up in the conversation. Use test keys and a local database.

Use [[m6-migration|migrations]] you review, not live schema edits, and use \`/permissions\` to keep tool access tight. Never paste production credentials into a prompt.`,
        },
        {
          type: 'scenario',
          title: 'Scenario 7: Debug an existing application',
          problem:
            'Users report: "Sometimes my cart total is wrong after removing an item." It is intermittent and nobody knows the cause.',
          context: [
            'Exact steps, input and observed vs expected result',
            'Logs or the stack trace, trimmed to the relevant part',
            'When it started: last deploy, recent commits',
            'How to run the app and tests; any failing test already known',
          ],
          prompt:
            'Bug: after removing an item from the cart, the total is sometimes wrong. Repro from a user: add items A (10.00) and B (5.00), apply promo SAVE10, remove A. Expected total 4.50. Actual 9.00 (promo applied to the old subtotal).\n\nCode lives in src/cart/. It started after the promo refactor two weeks ago (see `git log -- src/cart`).\n\nDo this in order:\n1. Write a failing test that reproduces exactly this sequence. Run it and show me the failure.\n2. Find the root cause. Explain it in two sentences before changing code. Consider whether totals are cached or recomputed.\n3. Fix the cause, not the symptom. Do not touch checkout or payments code.\n4. Run the full cart test suite and confirm the new test passes.\n\nIf you cannot reproduce it, stop and tell me what more you need.',
          approach: [
            'Convert the report to a deterministic failing test before reading any theories',
            'Ask for the root cause explanation first, so you can challenge it',
            'Use `git log`, `git blame` and `git bisect` ideas to find what changed',
            'Fix at the source of the bad value, then run the whole related suite',
            'Keep the failing test as a regression guard',
          ],
          mistakes: [
            'Pasting "cart total is wrong" with no steps and expecting a fix',
            'Letting Claude patch the display instead of the stale calculation',
            'Accepting the first plausible cause without a reproduction',
            'Fixing the bug and deleting or loosening the test that exposed it',
            'Letting the fix spread into unrelated modules',
          ],
          checklist: [
            'A test failed before the fix and passes after',
            'Root cause is explained and you agree with it',
            'Diff is small and limited to the cart module',
            'Full related suite is green',
            'You can state why it was intermittent',
          ],
        },
        {
          type: 'workflow',
          title: 'A repeatable debugging loop with Claude Code',
          steps: [
            {
              id: 'repro',
              title: 'Reproduce',
              what: 'Turn the report into exact steps and a failing test or command.',
              why: 'You cannot know a fix works unless the failure was demonstrated first.',
              ask: 'Write a failing test that reproduces: add A and B, apply SAVE10, remove A. Run it and show the failure.',
            },
            {
              id: 'isolate',
              title: 'Isolate',
              what: 'Narrow down where the wrong value first appears: inputs, state, calculation, output.',
              why: 'The place a bug shows up is rarely where it is created.',
              ask: 'Trace where the subtotal is computed after removeItem. Show each place the value is stored or cached, with file and line.',
            },
            {
              id: 'hypothesis',
              title: 'State the cause',
              what: 'Claude explains the root cause in plain words before editing.',
              why: 'A wrong diagnosis is cheap to reject and expensive to merge.',
              ask: 'Explain the root cause in two sentences and what evidence from the code supports it. Do not change anything yet.',
            },
            {
              id: 'fix',
              title: 'Fix minimally',
              what: 'Smallest change that removes the cause, within a scope fence.',
              why: 'Small diffs are easy to review and unlikely to introduce new bugs.',
              ask: 'Fix the root cause in src/cart only. Do not change public signatures.',
            },
            {
              id: 'verify',
              title: 'Verify and guard',
              what: 'Run the new test and the full suite, keep the test permanently.',
              why: 'Proves the fix and prevents regression.',
              ask: 'Run `npm test -- cart` and show the output. Confirm the new test failed before and passes now.',
            },
          ],
        },
        {
          type: 'exercise',
          exercise: {
            id: 'm6-ex-l2-approach',
            title: 'Pick the approach: duplicate charges in production',
            category: 'approach',
            kind: 'choose',
            prompt:
              'Support reports that some customers were charged twice. Logs show the charge call timed out and was retried. What is the right direction?',
            options: [
              {
                text: 'Raise the charge timeout to 60 seconds so that retries become much less frequent.',
                correct: false,
                why: 'It reduces frequency but does not remove the double charge risk. Slow providers still time out.',
              },
              {
                text: 'Remove the retry logic so a timed out charge is never sent twice, and fail the order.',
                correct: false,
                why: 'Transient failures then fail orders needlessly. The problem is unsafe retries, not retries.',
              },
              {
                text: 'Reproduce a timeout in a test with a mock, then add an idempotency key per order.',
                correct: true,
                why: 'This addresses the cause. A test locks it in and the idempotency key makes retries safe.',
              },
              {
                text: 'Ask Claude to refund every double charged customer using the production API key.',
                correct: false,
                why: 'Never hand production credentials to an agent for a bulk money action. Handle refunds through a reviewed, controlled process.',
              },
            ],
            explanation: 'Fix retries by making the operation idempotent, prove it with a test, and keep production out of the session.',
          },
        },
        {
          type: 'exercise',
          exercise: {
            id: 'm6-ex-l2-order',
            title: 'Order the safe database change',
            category: 'workflow',
            kind: 'order',
            prompt: 'Put the steps for adding a new column to the orders table in the safest order.',
            items: [
              'Ask Claude to write the up and down migration and show the SQL',
              'Review the SQL for constraints, defaults and locking risk',
              'Apply the migration to a local disposable database',
              'Run the down migration, then up again, to confirm both work',
              'Update the repository code and run the tests against the local database',
              'Commit the new migration file without editing earlier ones',
            ],
            explanation: 'Review before applying, test both directions, and treat earlier migrations as immutable.',
          },
        },
      ],
      quiz: [
        {
          id: 'q1',
          scenario: 'You want Claude to test the new repository. A teammate suggests giving it the staging DATABASE_URL because it has real looking data.',
          q: 'What is the best choice?',
          options: [
            {
              text: 'Use the staging database; its realistic data makes the tests closer to production.',
              why: 'Shared environments get polluted or corrupted by an agent running writes and schema changes.',
            },
            {
              text: 'Run a local disposable database with seeded data and point `.env.test` at it.',
              why: 'Correct. Reproducible, isolated, safe to wreck and rebuild.',
            },
            {
              text: 'Use the production database in read only mode so you only ever query real data.',
              why: 'Read only is still access to real customer data in a session you do not fully control.',
            },
            {
              text: 'Skip the database and mock every query so the tests never touch real SQL.',
              why: 'Mocks cannot prove your SQL, constraints or transactions work.',
            },
          ],
          answer: 1,
        },
        {
          id: 'q2',
          scenario: 'Claude generated a repository using string concatenation: "SELECT * FROM orders WHERE status = \'" + status + "\'".',
          q: 'What do you do?',
          options: [
            {
              text: 'Accept it, since status comes from our own enum and users cannot type arbitrary values.',
              why: 'Code gets reused and inputs change. Injection prone patterns should be fixed at the source.',
            },
            {
              text: 'Ask for parameterized queries everywhere and add that rule to CLAUDE.md for next time.',
              why: 'Correct. Fix this instance and prevent the pattern permanently.',
            },
            {
              text: 'Keep the concatenation and add a regex that rejects quotes before the query runs.',
              why: 'Ad hoc escaping is fragile. Parameterization is the reliable tool.',
            },
            {
              text: 'Leave it for now and flag it in the next scheduled security review of the repo.',
              why: 'Cheapest to fix now, before more code copies the pattern.',
            },
          ],
          answer: 1,
        },
        {
          id: 'q3',
          scenario: 'You ask Claude to integrate a payments API. It writes confident code using an endpoint name and header that you do not recognize.',
          q: 'What is the likely problem and fix?',
          options: [
            {
              text: 'Claude is guessing from memory or the API changed. Give it the current docs to follow.',
              why: 'Correct. Ground integrations in the real documentation.',
            },
            {
              text: 'Treat it as correct, since models recall public APIs accurately, and fix failures later.',
              why: 'APIs change and details get misremembered. Unknown endpoints are a warning sign.',
            },
            {
              text: 'Raise the request timeout and retry the call, since the endpoint may just be slow.',
              why: 'A timeout has nothing to do with a wrong endpoint name or header.',
            },
            {
              text: 'Call the live production API with a real key to find out which endpoint works.',
              why: 'Probing production with real keys is unsafe and can create real charges.',
            },
          ],
          answer: 0,
        },
        {
          id: 'q4',
          scenario: 'The provider sends the same webhook twice and your handler marked the order shipped and emailed the customer twice.',
          q: 'Which fix addresses the cause?',
          options: [
            {
              text: 'Ask the provider to turn off webhook retries so each event arrives only one time.',
              why: 'Retries are a standard delivery guarantee. You cannot rely on turning them off.',
            },
            {
              text: 'Store processed event ids and skip repeats, with a test that sends one event twice.',
              why: 'Correct. Idempotent handling makes duplicates harmless.',
            },
            {
              text: 'Add a short delay before the email step so the second delivery arrives too late.',
              why: 'Timing hacks do not prevent a second delivery from being processed.',
            },
            {
              text: 'Disable the shipping email feature until the provider fixes their delivery behavior.',
              why: 'That removes the feature, not the cause. The provider is behaving normally.',
            },
          ],
          answer: 1,
        },
        {
          id: 'q5',
          scenario: 'Intermittent bug: totals are sometimes wrong. You paste only "total is wrong sometimes" into Claude.',
          q: 'Why is that a weak start, and what should change?',
          options: [
            {
              text: 'Leave it as is, since Claude will search the whole repo, locate the cause and fix it alone.',
              why: 'Without steps or evidence it will guess, and the fix will be unverified.',
            },
            {
              text: 'Give a reproducible sequence with expected and actual totals, and ask for a failing test.',
              why: 'Correct. A deterministic repro turns a guess into a check.',
            },
            {
              text: 'Ask Claude to rewrite the cart module so any hidden bug disappears with the old code.',
              why: 'Rewriting hides the bug at best and adds new ones at worst.',
            },
            {
              text: 'Wait for it to happen again in production and capture the logs before touching code.',
              why: 'You can usually build a repro locally from the report and the code history.',
            },
          ],
          answer: 1,
        },
        {
          id: 'q6',
          scenario: 'Claude fixed the bug by editing the failing test\'s expected value from 4.50 to 9.00.',
          q: 'What is wrong?',
          options: [
            {
              text: 'Nothing is wrong; the failing test was outdated, and the new value makes the suite green.',
              why: 'The test was right. It encoded the correct expected behavior.',
            },
            {
              text: 'It edited the test to match the bug. Reject it and say fix the code, never the test.',
              why: 'Correct. Say this explicitly in the prompt: fix the code, do not weaken tests.',
            },
            {
              text: 'The test framework mis-compared the numbers, so upgrade it and rerun the suite.',
              why: 'The framework is reporting correctly. The code was wrong.',
            },
            {
              text: 'Money logic should not be unit tested, because rounding makes expectations unreliable.',
              why: 'Money logic needs the most testing.',
            },
          ],
          answer: 1,
        },
        {
          id: 'q7',
          scenario: 'A migration already ran on a teammate\'s database. You realize a column should be nullable.',
          q: 'Right move?',
          options: [
            {
              text: 'Edit the old migration so the column is nullable, since it is the same change.',
              why: 'Machines that already applied it will not re-run it, so schemas diverge.',
            },
            {
              text: 'Add a new migration that alters the column, with its own down script.',
              why: 'Correct. Migrations are append only history.',
            },
            {
              text: 'Drop and recreate the table in every environment, then rerun all migrations.',
              why: 'Destroys data and breaks shared environments.',
            },
            {
              text: 'Alter the column by hand in each database and mention it in the team chat.',
              why: 'Manual changes are not versioned or repeatable, so environments drift.',
            },
          ],
          answer: 1,
        },
      ],
    },

    // ---------------------------------------------------------------- LESSON 3
    {
      id: 'm6-l3',
      title: 'Refactoring, testing and building from scratch',
      minutes: 55,
      summary: 'Refactor safely, write tests that can fail, build a whole app in slices, and know when to take back control.',
      objectives: [
        'Refactor legacy code safely behind characterization tests',
        'Write meaningful tests, not tests that mirror the implementation',
        'Plan and deliver a complete application as a series of vertical slices',
        'Know where to stop and take back control from the agent',
      ],
      blocks: [
        {
          type: 'text',
          md: `The last three scenarios are about **change you can trust**: restructuring old code, building a safety net, and growing an entire app without losing control.

The common tool is the [[m6-verification-loop|verification loop]]: every step ends with a command that proves it.`,
        },
        {
          type: 'scenario',
          title: 'Scenario 8: Refactor legacy code',
          problem:
            'A 600 line `calculatePrice()` function has nested ifs, magic numbers and no tests. It must be split up so a new discount type can be added.',
          context: [
            'The function, its callers and any known business rules',
            'Whether behavior may change (usually: no)',
            'A way to run it with many inputs, such as recorded production samples or a table of cases',
            'The target structure, for example small pure functions per discount',
          ],
          prompt:
            'Refactor calculatePrice() in src/pricing/calculate.js without changing behavior.\n\nStep 1, do not change the code yet: write characterization tests in test/pricing/calculate.characterization.test.js. Use a table of at least 40 inputs covering each customer tier, quantity break, coupon and edge value (0, negative, very large). Record today\'s actual outputs as the expected values, even if one looks wrong; flag any that look wrong to me in a comment.\n\nStep 2: run the tests and show they pass on the untouched code.\n\nStep 3: refactor into small pure functions (tier discount, quantity discount, coupon, rounding), one at a time. Run `npm test -- pricing` after each extraction and stop if anything fails.\n\nConstraints: no behavior change, keep the exported signature, no new dependencies, do not edit the characterization tests during the refactor. Show me the final `git diff --stat`.',
          approach: [
            'Write [[m6-characterization-test|characterization tests]] against the untouched code first',
            'Refactor in tiny steps, running tests after each so failures are easy to locate',
            'Keep the public signature and lock the tests as read only for the refactor',
            'Report suspicious legacy behavior to a human instead of silently fixing it',
            'Only after structure is clean, add the new feature as a separate change',
          ],
          mistakes: [
            'Refactoring and adding the new discount in the same change',
            'Letting Claude rewrite tests to match the new code',
            'Too few test inputs, so edge branches are never exercised',
            'A single huge diff that cannot be reviewed',
            'Silently "fixing" odd behavior that downstream systems depend on',
          ],
          checklist: [
            'Characterization tests passed on the original code before any edit',
            'The same tests pass unchanged after the refactor',
            'Each extraction was a small, reviewable step',
            'Public signature and behavior are unchanged',
            'Odd legacy behavior was flagged, not silently changed',
          ],
        },
        {
          type: 'scenario',
          title: 'Scenario 9: Write test cases',
          problem:
            'A coupon module with real business rules has no tests. You need tests that find bugs, not tests that merely raise coverage numbers.',
          context: [
            'The module and its business rules, in plain language',
            'Test framework, naming and layout conventions',
            'Which behaviors matter most (money, security, data loss)',
            'Dependencies that should be faked and ones that should not',
          ],
          prompt:
            'Write tests for src/coupons/validate.ts using Vitest, matching the style in src/cart/cart.test.ts.\n\nRules the tests must check (from the product spec):\n- Percent coupons are capped at 50 percent.\n- A coupon cannot be used after its expiry date or more than maxUses times.\n- Coupons marked once_per_customer reject a second use by the same customer.\n- Stackable coupons can be combined; non stackable ones cannot.\n\nFor each rule write a happy case, a boundary case (exactly at the limit, one past it) and an invalid input case. Test behavior through the public validate() function, not private helpers. Use a fixed clock, no real dates.\n\nAfter writing them, do a mutation check: temporarily change the cap from 50 to 60 and the expiry comparison from < to <=, confirm that your tests fail each time, then revert. Run `npm test -- coupons` and report which tests caught which mutation.',
          approach: [
            'List behaviors from the spec first and map each to cases, including boundaries',
            'Test public behavior so the tests survive refactors',
            'Control time and randomness; avoid reading the real clock',
            'Prove the tests can fail with quick manual mutations',
            'Prefer readable test names that describe the rule',
          ],
          mistakes: [
            'Asking for "100 percent coverage", which rewards trivial assertions',
            'Tests that copy the implementation logic, so they pass even when it is wrong',
            'Only happy paths',
            'Tests depending on the current date or on test order',
            'Heavy mocking so the test verifies the mock, not the code',
          ],
          checklist: [
            'Each business rule has happy, boundary and invalid cases',
            'Tests use the public interface and a fixed clock',
            'Mutation checks fail as expected, then are reverted',
            'Test names read like the specification',
            'Suite is deterministic when run twice',
          ],
        },
        {
          type: 'code',
          lang: 'typescript',
          title: 'Scenario 9: boundary focused tests (Vitest)',
          code: `import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateCoupon } from './validate';

const base = {
  code: 'SAVE20',
  percent: 20,
  expiresAt: new Date('2026-12-31T23:59:59Z'),
  maxUses: 100,
  uses: 0,
};

describe('validateCoupon', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'));
  });

  it('accepts a valid coupon', () => {
    expect(validateCoupon(base).ok).toBe(true);
  });

  it('caps percent discounts at 50', () => {
    const result = validateCoupon({ ...base, percent: 80 });
    expect(result.ok).toBe(true);
    expect(result.effectivePercent).toBe(50);
  });

  it('accepts exactly at the max uses limit minus one, rejects at the limit', () => {
    expect(validateCoupon({ ...base, uses: 99 }).ok).toBe(true);
    expect(validateCoupon({ ...base, uses: 100 }).ok).toBe(false);
  });

  it('rejects an expired coupon', () => {
    vi.setSystemTime(new Date('2027-01-01T00:00:00Z'));
    const result = validateCoupon(base);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('expired');
  });

  it('rejects invalid input', () => {
    expect(validateCoupon({ ...base, percent: -5 }).ok).toBe(false);
  });
});`,
          note: 'Assumes `validateCoupon` returns `{ ok, reason?, effectivePercent? }`. Adjust the names to your module. The boundary pairs (99 vs 100) and the fixed clock are the important ideas.',
        },
        {
          type: 'callout',
          tone: 'info',
          title: 'Context is a budget',
          md: `Long builds fill the context window. Use **/compact** to summarize while continuing, or **/clear** to start a fresh conversation between unrelated tasks.

If a mistake happens, **/rewind** (aliases /checkpoint and /undo) restores earlier code or conversation state. Commit after each green slice so history stays clean.`,
        },
        {
          type: 'scenario',
          title: 'Scenario 10: Build a complete application from scratch',
          problem:
            'Build "TeamNotes": a small web app where users register, log in and manage personal notes with tags and search. You want a working, tested, deployable first version.',
          context: [
            'Stack decision with reasons (for example React, Node, Postgres) and any hard constraints',
            'Feature list split into must have and later',
            'Quality bar: tests, lint, type checking, README',
            'Environment: local database, no secrets in the repo',
          ],
          prompt:
            'We are building TeamNotes from an empty folder. Work in vertical slices and stop after each one for my review.\n\nStack: TypeScript, Node with Express, React with Vite, Postgres, Vitest. No other frameworks without asking.\n\nMust have: register and login (hashed passwords, session or JWT), CRUD for notes owned by a user, tags, simple text search. Later: sharing, export. Do not build the later items.\n\nStart in plan mode. Produce: (1) a folder structure, (2) the data model, (3) the API list, (4) the ordered list of slices, each with its own acceptance test. Wait for my approval.\n\nAfter approval, slice 1 is only: project setup, `npm run dev`, `npm test`, `npm run lint`, a /health endpoint with a test, and a CLAUDE.md containing those commands. Run them and show the output.\n\nRules for every slice: write tests alongside, keep secrets in .env (gitignored, with .env.example), run lint, type check and tests before saying done, and give me a suggested commit message.',
          approach: [
            'Decide stack and scope in a plan, and keep a "later" list so the agent does not build it',
            'Slice 1 is tooling: dev server, tests, lint and a CLAUDE.md with the commands',
            'Slice 2 and onward are vertical: auth, then notes CRUD, then tags, then search',
            'Commit after each green slice; use `/clear` between slices if context grows',
            'Finish with security and cleanup passes: input validation, auth checks, README, deploy notes',
          ],
          mistakes: [
            'One giant prompt "build me TeamNotes", yielding thousands of unreviewed lines',
            'Skipping the plan, so the stack and structure are accidental',
            'Letting the agent add features from the later list',
            'Committing generated secrets or an `.env` file',
            'Never running the app yourself; tests passing is not the same as it working',
          ],
          checklist: [
            'There is an approved plan with ordered slices',
            'Each slice has tests, lint and type check passing, and a commit',
            'Auth, ownership checks and validation are reviewed by you',
            'Secrets are in a gitignored `.env`, with `.env.example` committed',
            'A new developer can run the app from the README',
          ],
        },
        {
          type: 'compare',
          title: 'Choosing a strategy for a large task',
          columns: ['One big prompt', 'Vertical slices with review'],
          rows: [
            {
              label: 'Review effort',
              cells: ['Thousands of lines at once, hard to judge', 'Small diff per slice, easy to judge'],
            },
            {
              label: 'Finding wrong assumptions',
              cells: ['Late, after much code is built on them', 'Early, at the plan or the first slice'],
            },
            {
              label: 'Context window',
              cells: ['Fills quickly, quality drops', 'Fresh context per slice with `/clear`, state in the repo and CLAUDE.md'],
            },
            {
              label: 'Rollback',
              cells: ['Painful, one giant change', 'One commit per slice, easy to revert'],
            },
            {
              label: 'When it fits',
              cells: ['Throwaway prototype you will not keep', 'Anything you will maintain or ship'],
            },
          ],
        },
        {
          type: 'exercise',
          exercise: {
            id: 'm6-ex-l3-approach',
            title: 'Pick the approach: untested legacy function',
            category: 'approach',
            kind: 'choose',
            prompt:
              'A 600 line pricing function has no tests, and you must add a new discount tier next week. What should you do first?',
            options: [
              {
                text: 'Add the new discount directly inside the existing function, since that is the fastest path.',
                correct: false,
                why: 'Adding to untested nested logic risks breaking existing tiers with no way to notice.',
              },
              {
                text: 'Have Claude rewrite the function from the spec and compare outputs by eye on samples.',
                correct: false,
                why: 'The legacy code is the real spec. Eyeballing differences across many inputs does not scale.',
              },
              {
                text: 'Write characterization tests on current behavior, refactor in small steps, then add the tier.',
                correct: true,
                why: 'This gives a safety net, separates refactor from feature, and keeps each change reviewable.',
              },
              {
                text: 'Skip tests because the function has run in production for years without complaints.',
                correct: false,
                why: 'Long uptime does not tell you what the code does at edge inputs, and you are about to change it.',
              },
            ],
            explanation: 'Safety net first, refactor second, new behavior third.',
          },
        },
        {
          type: 'exercise',
          exercise: {
            id: 'm6-ex-l3-workflow',
            title: 'Order the from scratch build',
            category: 'workflow',
            kind: 'order',
            prompt: 'Put the stages of building TeamNotes with Claude Code in a sensible order.',
            items: [
              'Define stack, must have features and a later list',
              'Use plan mode to produce structure, data model, API list and ordered slices; approve it',
              'Slice 1: tooling, scripts, health check, CLAUDE.md',
              'Slice 2: authentication with tests; review and commit',
              'Slice 3: notes CRUD with ownership checks and tests; review and commit',
              'Slices 4 and 5: tags and search; review and commit',
              'Final pass: security review, README, run the app yourself end to end',
            ],
            explanation: 'Plan, tooling, then one reviewed vertical slice at a time, and a final hardening pass.',
          },
        },
      ],
      quiz: [
        {
          id: 'q1',
          scenario: 'You ask Claude to refactor an untested function. It rewrites it cleanly and writes new tests that all pass.',
          q: 'What is wrong with this result?',
          options: [
            {
              text: 'Nothing; green tests prove the refactor is safe, since they exercise every code path.',
              why: 'The tests were written against the new code, so they cannot reveal behavior changes.',
            },
            {
              text: 'The tests describe the new code. Write characterization tests on the original first.',
              why: 'Correct. Without a baseline from the original, a refactor can change behavior unnoticed.',
            },
            {
              text: 'Untested functions should never be refactored, so the rewrite should be discarded.',
              why: 'Refactoring is fine with a proper safety net.',
            },
            {
              text: 'Too many tests were generated, which makes the suite slow and hides real failures.',
              why: 'Quantity is not the issue. The order and the baseline are.',
            },
          ],
          answer: 1,
        },
        {
          id: 'q2',
          scenario: 'While writing characterization tests, one recorded output looks like a bug: a 100 percent coupon yields a negative total.',
          q: 'What do you tell Claude?',
          options: [
            {
              text: 'Fix the negative total inside the refactor, since you are already in that function.',
              why: 'Behavior changes mixed into a refactor are hard to spot, and other systems may depend on the quirk.',
            },
            {
              text: 'Record the current behavior, flag it with a comment, and fix it separately.',
              why: 'Correct. Keep refactors behavior preserving and track fixes separately.',
            },
            {
              text: 'Delete that test case, since a negative total is clearly not a valid expectation.',
              why: 'Dropping the case hides the finding and removes coverage.',
            },
            {
              text: 'Set the expected value to zero so the test describes how the coupon should work.',
              why: 'That makes the test fail against legacy code, defeating its purpose.',
            },
          ],
          answer: 1,
        },
        {
          id: 'q3',
          scenario: 'A teammate says: "Prompt Claude to get 100 percent coverage on the coupon module."',
          q: 'What is a better instruction?',
          options: [
            {
              text: 'Agree with the teammate, since full line coverage is the clearest proof of real quality.',
              why: 'Coverage shows lines executed, not behavior verified.',
            },
            {
              text: 'Test happy, boundary and invalid cases per rule, then mutate code to see tests fail.',
              why: 'Correct. This targets bugs, not numbers.',
            },
            {
              text: 'Ask for the largest possible number of tests so every function has many assertions.',
              why: 'Volume without intent creates noise and maintenance cost.',
            },
            {
              text: 'Mock every dependency so the generated tests run faster and never touch real code.',
              why: 'Over mocking makes tests assert the mocks.',
            },
          ],
          answer: 1,
        },
        {
          id: 'q4',
          scenario: 'A test passes locally but fails on CI around midnight. It uses new Date() to check coupon expiry.',
          q: 'Best fix?',
          options: [
            {
              text: 'Add automatic retries to the CI job so the midnight failure passes on a rerun.',
              why: 'Hides a real nondeterminism problem.',
            },
            {
              text: 'Inject a fixed or fake clock in tests so results never depend on real time.',
              why: 'Correct. Control time, randomness and external state in tests.',
            },
            {
              text: 'Delete the expiry test, since the coupon rule is also checked by hand in review.',
              why: 'Loses automated coverage of a business rule.',
            },
            {
              text: 'Schedule CI to run only during daytime hours so the clock never crosses midnight.',
              why: 'Avoids the symptom, not the cause.',
            },
          ],
          answer: 1,
        },
        {
          id: 'q5',
          scenario: 'You prompt: "Build me TeamNotes, a complete notes app with auth, sharing, tags, search, export and a dashboard." Two hours later there are 9,000 lines and you cannot tell what works.',
          q: 'What should you have done?',
          options: [
            {
              text: 'Use a larger model so the nine thousand lines come out with far fewer hidden mistakes in them.',
              why: 'Model size does not solve an unreviewable scope.',
            },
            {
              text: 'Plan in plan mode, split must have from later, and build tested slices, one commit each.',
              why: 'Correct. Small verified steps keep you in control of the result.',
            },
            {
              text: 'Rank all features in a numbered priority list inside the same single prompt.',
              why: 'Ordering features in one prompt still produces one unreviewable build.',
            },
            {
              text: 'Avoid AI for whole applications and write the auth and data layer by hand.',
              why: 'It works well for apps when the process is disciplined.',
            },
          ],
          answer: 1,
        },
        {
          id: 'q6',
          scenario: 'Slice 3 introduced a regression and Claude\'s next attempts made it worse. The conversation is long and messy.',
          q: 'What is the most effective recovery?',
          options: [
            {
              text: 'Keep going in the same thread and repeat the instructions more strongly each time.',
              why: 'A polluted context tends to repeat the same mistakes.',
            },
            {
              text: 'Restore the last good state with `/rewind` or git, then `/clear` and restate the failure.',
              why: 'Correct. Reset code and context, then restate the problem cleanly.',
            },
            {
              text: 'Delete the repository and restart from the first prompt, since the context is lost.',
              why: 'Far too destructive when commits per slice exist.',
            },
            {
              text: 'Comment out the failing tests until the remaining slices are finished, then restore them.',
              why: 'Removes the signal that tells you what is broken.',
            },
          ],
          answer: 1,
        },
        {
          id: 'q7',
          scenario: 'The app works in tests. You have not run it. Claude says it is "ready to deploy".',
          q: 'What do you do?',
          options: [
            {
              text: 'Deploy now, because the passing test suite already covers the wiring and configuration.',
              why: 'Tests cover what was written, not wiring, configuration or UX.',
            },
            {
              text: 'Run it yourself, try a second user on the notes, and review the diff and secrets.',
              why: 'Correct. A human end to end pass and a security review catch what tests missed.',
            },
            {
              text: 'Ask Claude to double check and confirm it is certain the app is ready to deploy.',
              why: 'Self assessment is not independent verification.',
            },
            {
              text: 'Skip the README for now, since the code reads clearly and setup can be explained later.',
              why: 'Reproducible setup is part of a deliverable app.',
            },
          ],
          answer: 1,
        },
      ],
    },
  ],
  assignments: [
    {
      id: 'm6-a1',
      title: 'Build a CRUD application with Claude Code',
      minutes: 180,
      brief: `Build a small, tested CRUD application of your choice (for example "Bookmarks", "Expenses" or "Support tickets") using Claude Code, following the vertical slice process from this module.

You are graded on process and result: a plan, small reviewed slices, tests, and a working app.`,
      steps: [
        'Pick the entity (3 to 5 fields) and write acceptance criteria for create, read, update, delete and one list filter.',
        'Start with `/plan` and have Claude produce structure, data model, API list and ordered slices. Review and edit the plan before approving.',
        'Slice 1: tooling only (dev server, test and lint commands, health endpoint) and a CLAUDE.md with those commands.',
        'Slice 2 to 4: backend CRUD with validation and error codes, then persistence with a migration against a local database, then a basic UI.',
        'For each slice write the prompt with context, constraints and a verification command; run the tests yourself and read the `/diff` before committing.',
        'Add at least one unhappy path test per endpoint (bad input, unknown id) and one test that proves a validation rule can fail.',
        'Run the app and exercise every operation by hand. Write a short README with setup steps.',
      ],
      deliverable:
        'A git repository with one commit per slice, a CLAUDE.md, passing tests, a README, and a short note (half a page) listing three places where you corrected or rejected Claude\'s output and why.',
      checklist: [
        'The plan existed before code and the slices followed it',
        'CRUD works end to end and persists in a real database via a migration',
        'Validation errors return 4xx with clear messages, not 500s',
        'Tests include unhappy paths and pass when you rerun them',
        'No secrets are committed; `.env.example` exists',
        'Each commit is small and has a clear message',
        'The correction note names concrete rejected or edited output',
      ],
      hint: 'Keep the "later" list short and in writing. If Claude starts adding features from it, point to the plan and ask it to stop.',
    },
    {
      id: 'm6-a2',
      title: 'Debug an existing buggy application',
      minutes: 120,
      starter: 'starters/shop-app',
      brief: `Use the Shop app starter in \`starters/shop-app\` in the academy repo. It is a small dependency free Node app with a cart, orders and an HTTP API. All its tests pass today, yet users have reported five bugs.

Your job: use Claude Code to find and fix each bug with the reproduce first loop. Work only from the symptoms in \`BUG_REPORTS.md\`. Do not tell Claude where a bug is, and do not open \`ANSWERS.md\` until you have finished or are truly stuck.`,
      steps: [
        'Copy `starters/shop-app` out of the academy repo to a folder of your own, run `git init` in the copy, then run `npm test` and confirm everything passes. Make one commit of the starting state.',
        'Open `BUG_REPORTS.md`. It has five reports written the way real users write them: steps, expected result and actual result. They describe symptoms only.',
        'Take one report at a time. Give Claude only that report text, with no hint about the file or the cause.',
        'Require this loop for each bug: write a failing test first, state the root cause in two sentences, make the smallest fix, then run the full suite until it is green.',
        'Do not let Claude edit existing tests to get green. Commit once per bug, with a message that names the bug.',
        'After each bug, record whether Claude found the real cause on the first attempt, and what hint or constraint you had to add if not.',
        'When all five are fixed, open `ANSWERS.md` and compare your root causes with the key, not just your fixes. Note any difference in your table.',
      ],
      deliverable:
        'The fixed repository with five regression tests (one per bug), one commit per bug, and a table with columns: bug, report you gave, root cause, fix, first attempt correct (yes or no), what you added to the prompt.',
      checklist: [
        'Every bug had a failing test before the fix and has a passing test now',
        'Root causes are stated and correct, not just symptom patches',
        'Fixes are minimal and stay inside the relevant module',
        'No test expectation was weakened to get green',
        'The race condition is fixed so the stock check and the decrement are one atomic step, and a test with two concurrent orders proves it',
        'The table honestly records Claude\'s misses and your corrections',
      ],
      hint: 'For the race condition, a test that calls two `createOrder` calls with `Promise.all` for `HD-03` reproduces it reliably. For the timezone bug, set `TZ` to a non UTC zone when you run the tests, for example `TZ=Asia/Kolkata npm test`. If Claude cannot reproduce a bug, say so and give it more detail rather than letting it guess.',
    },
  ],
};
