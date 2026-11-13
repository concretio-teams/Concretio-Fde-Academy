import type { Module, Concept } from '../types';

export const concepts: Concept[] = [
  {
    id: 'vibe-coding',
    name: 'Vibe coding',
    what: 'Building software by describing what you want in natural language and accepting the AI output with little or no code review. You steer by results ("does it run?"), not by reading the code.',
    why: 'It is fast for throwaways, demos and learning. It is also where most AI-caused production incidents start, because nobody understands the code that shipped.',
    how: 'Prompt, run, paste the error back, repeat. The human judges only the visible behaviour.',
    when: 'Hackathon prototypes, personal scripts, UI explorations you will delete. Not for code that handles money, auth, user data or that a team must maintain.',
    example: '"Make me a landing page with a signup form" then clicking around until it looks right, never opening the generated files.',
    mistakes: 'Treating a working demo as a finished product. Promoting vibe coded prototypes to production without a real review and tests.',
    kind: 'concept',
  },
  {
    id: 'ai-assisted-engineering',
    name: 'AI-assisted engineering',
    what: 'Using AI as a force multiplier inside a normal engineering discipline: you own the design, you read the diffs, tests and review gates stay in place.',
    why: 'You keep the speed gain while keeping accountability. The AI writes drafts; the engineer is responsible for what merges.',
    how: 'Specify the goal and constraints, let the AI propose or implement, review every change, verify with tests, then commit.',
    when: 'Any code that will live beyond a day or be touched by other people.',
    example: 'Ask Claude Code to add pagination, read the diff, run the test suite, request changes, then open a pull request that a teammate reviews.',
    mistakes: 'Skipping review because the output "looks right". Letting the AI choose architecture you do not understand.',
    kind: 'concept',
  },
  {
    id: 'token',
    name: 'Token',
    what: 'The unit of text an LLM reads and writes. A token is a chunk of characters, often a word piece, roughly three to four characters of English. Code and non-English text usually use more tokens per character.',
    why: 'Tokens drive cost, speed and the size limit of what the model can consider at once.',
    how: 'Text is split into tokens, each mapped to numbers. The model predicts the next token, one at a time.',
    when: 'Whenever you paste large files, long logs or ask for long outputs.',
    example: 'A 2,000 line log pasted into the chat can cost tens of thousands of tokens before Claude says a word.',
    mistakes: 'Assuming tokens equal words, or that pasting more is always better.',
    kind: 'concept',
  },
  {
    id: 'context-window',
    name: 'Context window',
    what: 'The maximum amount of text (measured in tokens) the model can consider in one request: instructions, conversation history, file contents and tool output all share it.',
    why: 'When it fills up, older details are dropped or summarized and quality drops. A cluttered window also costs more per message.',
    how: 'Everything Claude Code reads or runs is added to the window. Tools like compaction summarize it to make room.',
    when: 'Always. Long sessions, big repos and noisy tool output are the usual ways to run out.',
    example: 'After reading 40 files and a huge test log, early instructions you gave may be summarized away.',
    mistakes: 'Believing the model "remembers" everything said earlier in a very long session.',
    kind: 'concept',
  },
  {
    id: 'no-persistent-memory',
    name: 'No persistent memory',
    what: 'An LLM does not learn from your conversation. Each new session starts blank except for what is loaded into the context window (for example a CLAUDE.md file).',
    why: 'Explains why Claude "forgets" yesterday and why project rules belong in files, not in chat.',
    how: 'The tool re-sends relevant text every request. Anything not re-sent is gone.',
    when: 'Starting a new session, or after /clear.',
    example: 'You told Claude "we use pnpm" yesterday. Today it runs npm unless that rule lives in CLAUDE.md.',
    mistakes: 'Repeating the same corrections every session instead of writing them down once.',
    kind: 'concept',
  },
  {
    id: 'non-determinism',
    name: 'Non-determinism',
    what: 'The same prompt can produce different outputs on different runs, because the model samples among likely next tokens.',
    why: 'You cannot treat AI output as a fixed function. Verification must come from tests and review, not from "it worked last time".',
    how: 'Be specific, give examples and acceptance criteria, and verify with an automated check.',
    when: 'When you depend on the AI for repeatable results such as scripts in CI.',
    example: 'Two runs of "refactor this function" can pick different names and structures, both valid, one subtly wrong.',
    mistakes: 'Assuming a prompt that worked once is a guarantee.',
    kind: 'concept',
  },
  {
    id: 'hallucination',
    name: 'Hallucination',
    what: 'Confident output that is wrong: invented functions, packages, flags or facts that look plausible.',
    why: 'It is the main reason AI output must be verified. It is most likely when the model lacks the real source of truth.',
    how: 'Let the agent read the real code and docs, run the code, and run tests. Check that imported packages actually exist.',
    when: 'Obscure APIs, new library versions, and questions with no code in context.',
    example: 'A suggested `--fast-mode` CLI flag that does not exist in the tool you use.',
    mistakes: 'Trusting fluent explanations as if they were verified facts.',
    kind: 'concept',
  },
  {
    id: 'agent-loop',
    name: 'Agent loop',
    what: 'The cycle an AI coding agent repeats: gather context (read), decide next steps (plan), change files (edit), run commands or tests (run), look at the results (observe), then repeat until done.',
    why: 'The loop is what separates an agent from autocomplete. Feedback from real command output lets it fix its own mistakes.',
    how: 'Each step uses tools such as file read, edit and shell. The output of each tool is fed back as new context.',
    when: 'Multi-file changes, bug fixes with reproducible failures, refactors with a test suite.',
    example: 'Run failing test, read the stack trace, open the file, edit, rerun the test, see it pass.',
    mistakes: 'Giving the agent no way to verify (no tests, no command to run), so the loop has nothing to observe.',
    kind: 'workflow',
  },
  {
    id: 'agentic-development',
    name: 'Agentic development',
    what: 'A workflow where you delegate a whole task to an agent that works across files and tools, and you supervise outcomes and diffs rather than typing each line.',
    why: 'It shifts your job toward specifying, reviewing and verifying. Leverage is high, and so is the cost of a vague request.',
    how: 'Clear goal, constraints, a verification command, permission boundaries, and review of the final diff.',
    when: 'Well scoped tasks in a codebase that has tests and version control.',
    example: '"Migrate the date handling from moment to date-fns; run the tests until they pass."',
    mistakes: 'Delegating without a way to check the result, or without version control to undo it.',
    kind: 'concept',
  },
  {
    id: 'claude-vs-claude-code',
    name: 'Claude vs Claude Code',
    what: 'Claude is the family of AI models. Claude Code is an agentic coding tool built on those models that can read your project, edit files and run commands in your environment.',
    why: 'Chat Claude only sees what you paste. Claude Code sees your repo and acts on it, so it needs permissions and supervision.',
    how: 'Claude Code runs in your terminal (and IDE, desktop and web surfaces) and calls Claude models through tools.',
    when: 'Use chat for questions and drafts; use Claude Code when the work lives in a repository.',
    example: 'Pasting a function into chat for review versus asking Claude Code to find and fix a failing test across the repo.',
    mistakes: 'Expecting chat Claude to know your codebase, or expecting Claude Code to act without any permission prompts by default.',
    kind: 'concept',
  },
];

export const module: Module = {
  id: 'm1',
  number: 1,
  title: 'Understanding AI-Assisted Development',
  tagline: 'Know what the AI is, what it is not, and when to trust it.',
  level: 'Foundation',
  requires: [],
  outcomes: [
    'Explain the difference between vibe coding and AI-assisted engineering',
    'Describe tokens, context windows, statelessness and non-determinism and their practical impact',
    'Distinguish Claude from Claude Code, and an agent from autocomplete',
    'Decide for a given task whether to use AI, how much supervision to apply, or to avoid it',
  ],
  skills: ['AI fundamentals', 'Agent concepts', 'Risk judgment'],
  lessons: [
    {
      id: 'm1-l1',
      title: 'How AI coding tools actually work',
      minutes: 20,
      objectives: [
        'Contrast vibe coding with AI-assisted engineering',
        'Explain tokens, context window, no persistent memory and non-determinism in practical terms',
        'Tell Claude (the model) apart from Claude Code (the agent tool)',
      ],
      blocks: [
        {
          type: 'text',
          md: `Two ways of using AI to write code look similar from the outside but have very different outcomes.

- [[vibe-coding]]: describe, accept, run, never read the code.
- [[ai-assisted-engineering]]: AI drafts, you design, review and verify.

The tool is the same. The **discipline** is what changes.`,
        },
        {
          type: 'compare',
          title: 'Vibe coding vs AI-assisted engineering',
          columns: ['Vibe coding', 'AI-assisted engineering'],
          rows: [
            { label: 'Who reads the code', cells: ['Nobody, or only skimmed', 'You, every diff'] },
            { label: 'Verification', cells: ['"It seems to work"', 'Tests, linters, review'] },
            { label: 'Accountability', cells: ['Unclear', 'The engineer who merges'] },
            { label: 'Good for', cells: ['Throwaway prototypes, learning', 'Production and team code'] },
            { label: 'Typical failure', cells: ['Hidden bugs and security holes ship', 'Slower start, fewer surprises'] },
          ],
        },
        {
          type: 'text',
          md: `## What an LLM really is

A large language model predicts the next [[token]] given everything in its [[context-window]]. Four practical consequences:

- **Tokens cost money and time.** Big pastes and long logs are expensive.
- **The window is finite.** Instructions, history, files and tool output all compete for space.
- **No persistent memory.** See [[no-persistent-memory]]: a new session starts blank.
- **Non-determinism.** See [[non-determinism]]: same prompt, different answers.

It can also state wrong things fluently. That is a [[hallucination]].`,
        },
        {
          type: 'mindmap',
          center: 'LLM in practice',
          branches: [
            {
              label: 'Tokens',
              items: [
                { label: 'Cost', detail: 'Input and output tokens are what usage is measured in.' },
                { label: 'Code is token heavy', detail: 'Symbols, indentation and long identifiers split into many tokens.' },
              ],
            },
            {
              label: 'Context window',
              items: [
                { label: 'Shared space', detail: 'Instructions, history, files read and command output all live here.' },
                { label: 'Fills up', detail: 'When near full, older content is summarized or lost and quality can drop.' },
              ],
            },
            {
              label: 'No memory',
              items: [
                { label: 'Fresh each session', detail: 'Nothing is learned from your chat. Persistent rules go in files such as CLAUDE.md.' },
              ],
            },
            {
              label: 'Non-determinism',
              items: [
                { label: 'Varying output', detail: 'Run twice, get two valid but different answers.' },
                { label: 'So verify', detail: 'Use tests and review, not trust in a past good run.' },
              ],
            },
          ],
        },
        {
          type: 'text',
          md: `## Claude vs Claude Code

See [[claude-vs-claude-code]].

- **Claude** is the model. In a plain chat it sees only what you paste.
- **Claude Code** is a tool that uses Claude models and can read your files, edit them and run commands in your environment, with your permission.

Because it can act, it needs **boundaries**: permissions, version control and review. Module 2 covers these.`,
        },
        {
          type: 'callout',
          tone: 'warn',
          title: 'Fluent is not the same as correct',
          md: 'Models sound equally confident when right and wrong. Plan to verify anything you cannot confirm by running it or reading the real source.',
        },
        {
          type: 'exercise',
          exercise: {
            id: 'm1-ex-memory',
            kind: 'choose',
            title: 'Why did Claude forget?',
            category: 'approach',
            prompt: 'Yesterday you told Claude Code "always use pnpm in this repo". Today, in a new session, it ran `npm install`. What is the best long term fix?',
            options: [
              { text: 'Repeat the instruction at the start of every session', correct: false, why: 'Works but wastes effort and is easy to forget. The rule should be stored where it is loaded automatically.' },
              { text: 'Write the rule in the project `CLAUDE.md` so it is loaded every session', correct: true, why: 'The model has no persistent memory, but project instructions in CLAUDE.md are loaded into context at session start, so the rule survives.' },
              { text: 'Ask Claude to "remember it harder"', correct: false, why: 'There is no learning between sessions. Wording does not change that.' },
              { text: 'Switch to a bigger context window', correct: false, why: 'A larger window does not carry information across sessions.' },
            ],
            explanation: 'Persistent project rules belong in files that get loaded into context, not in chat history.',
          },
        },
      ],
      quiz: [
        {
          id: 'q1',
          scenario: 'A teammate built an internal admin tool over a weekend by prompting an AI and never opening the generated code. It now needs to handle customer refunds.',
          q: 'What is the most important next step?',
          options: [
            { text: 'Ship it, since it already works in the demo', why: 'A demo proves the happy path only. Refunds involve money, auth and edge cases that nobody has reviewed.' },
            { text: 'Review the code, add tests and security checks before it touches real refunds', why: 'Correct. Moving from vibe coding to engineering means someone understands, tests and owns the code.' },
            { text: 'Ask the AI "is this code secure?" and trust the answer', why: 'The model can be confidently wrong. Self assessment is not a substitute for tests and human review.' },
            { text: 'Rewrite everything by hand without AI', why: 'Unnecessary. AI can still help, as long as engineering discipline is applied.' },
          ],
          answer: 1,
        },
        {
          id: 'q2',
          scenario: 'You paste a 5,000 line log into a chat and ask for the root cause. The answer ignores the error at the very top of the log.',
          q: 'What is the most likely practical reason?',
          options: [
            { text: 'The model is lazy', why: 'Models have no laziness. The cause is mechanical.' },
            { text: 'A large paste consumed much of the context window and relevant details got diluted or dropped', why: 'Correct. The window is finite and noisy context hurts quality. Trim the log to the relevant section.' },
            { text: 'The model remembers a different log from yesterday', why: 'It has no persistent memory between sessions.' },
            { text: 'Logs cannot be processed by LLMs', why: 'They can, but size and relevance matter.' },
          ],
          answer: 1,
        },
        {
          id: 'q3',
          scenario: 'A prompt in your CI script generated a perfect changelog last Tuesday. This Tuesday the format is slightly different and a downstream parser fails.',
          q: 'What does this show?',
          options: [
            { text: 'The model was updated and broke', why: 'Possible, but not necessary. The basic reason is simpler.' },
            { text: 'Outputs are non-deterministic, so structured output needs explicit format rules and validation', why: 'Correct. Same prompt can yield different output. Specify the format precisely and validate it in code.' },
            { text: 'The CI machine has too little memory', why: 'Unrelated to output format.' },
            { text: 'Changelogs cannot be automated', why: 'They can, with constraints and validation.' },
          ],
          answer: 1,
        },
        {
          id: 'q4',
          scenario: 'A colleague says: "Claude Code is just Claude chat in a terminal."',
          q: 'What is the most accurate correction?',
          options: [
            { text: 'Claude Code is an agentic tool that can read your project, edit files and run commands (with permission), powered by Claude models', why: 'Correct. The difference is access to your environment and the ability to act, which also introduces the need for permissions.' },
            { text: 'Claude Code is a different, smaller model', why: 'It uses Claude models. It is a tool, not a separate model family.' },
            { text: 'They are identical; only the UI differs', why: 'Chat only sees what you paste; Claude Code can act inside your repo.' },
            { text: 'Claude Code only works offline', why: 'It needs an internet connection to reach the model.' },
          ],
          answer: 0,
        },
        {
          id: 'q5',
          scenario: 'Claude suggests running `npm install fast-json-safe-parse` to fix an issue. You have never heard of this package.',
          q: 'What should you do?',
          options: [
            { text: 'Install it; the AI knows best', why: 'This is how hallucinated or malicious packages enter a project.' },
            { text: 'Verify the package exists, who maintains it and whether it is needed before installing', why: 'Correct. Plausible but invented names are a known hallucination pattern, and typo-squatted packages are a supply chain risk.' },
            { text: 'Ask Claude if it is sure and accept a yes', why: 'Models often reaffirm. Check the registry instead.' },
            { text: 'Install it globally so it does not touch the project', why: 'Global installs still execute code on your machine.' },
          ],
          answer: 1,
        },
        {
          id: 'q6',
          scenario: 'Each Monday you spend ten minutes retyping team conventions into Claude before work starts.',
          q: 'What is the better approach?',
          options: [
            { text: 'Keep retyping; it is how AI works', why: 'Unnecessary toil. Conventions can be stored.' },
            { text: 'Store conventions in a project instruction file that is loaded each session', why: 'Correct. With no persistent memory, files loaded into context are how rules persist and are shared with the team.' },
            { text: 'Never start a new session', why: 'Long sessions fill the window and cost more.' },
            { text: 'Increase the temperature', why: 'Not a mechanism for remembering anything.' },
          ],
          answer: 1,
        },
      ],
    },
    {
      id: 'm1-l2',
      title: 'Agents, limits and when to use AI',
      minutes: 25,
      objectives: [
        'Describe the agent loop and how it differs from autocomplete and chat',
        'Compare traditional, AI-assisted and agentic development',
        'Name common misconceptions and real limitations',
        'Apply a simple rule set for when to use AI and when not to',
      ],
      blocks: [
        {
          type: 'text',
          md: `Three generations of tooling change **who does the typing** and **who closes the feedback loop**.

- **Autocomplete** suggests the next few tokens in your editor. You accept or reject.
- **Chat** answers questions about text you paste.
- An **agent** runs the [[agent-loop]]: it reads, plans, edits, runs and observes, repeatedly, on its own.`,
        },
        {
          type: 'compare',
          title: 'Traditional vs AI-assisted vs agentic development',
          columns: ['Traditional', 'AI-assisted (autocomplete / chat)', 'Agentic (Claude Code)'],
          rows: [
            { label: 'Who writes code', cells: ['You', 'You, with AI suggestions', 'Agent writes; you direct and review'] },
            { label: 'Scope of one action', cells: ['A line or function', 'A snippet or function', 'Many files plus commands'] },
            { label: 'Sees your repo', cells: ['You do', 'Limited to open file or paste', 'Reads files, searches, runs tests'] },
            { label: 'Feedback loop', cells: ['You run and fix', 'You run and paste errors back', 'Agent runs and fixes itself'] },
            { label: 'Your main skill', cells: ['Implementation', 'Prompting plus editing', 'Specifying, reviewing, verifying'] },
            { label: 'Main risk', cells: ['Slow delivery', 'Accepting bad snippets', 'Large unreviewed changes'] },
          ],
        },
        {
          type: 'diagram',
          title: 'The agent loop (click a step)',
          mermaid: `flowchart TD
  G["Goal from you"] --> R["Read"]
  R --> P["Plan"]
  P --> E["Edit"]
  E --> X["Run"]
  X --> O["Observe"]
  O --> D{"Done?"}
  D -->|"No"| R
  D -->|"Yes"| H["Human review"]`,
          nodes: {
            G: {
              title: 'Goal from you',
              what: 'A task with a clear outcome, constraints and a way to check success.',
              example: '"Fix the failing login test without changing the public API. Run `npm test` to confirm."',
              useCase: 'The quality of the goal sets the quality of every later step.',
              related: ['agentic-development'],
            },
            R: {
              title: 'Read',
              what: 'The agent searches and reads files, docs and prior output to build context. Everything it reads uses the [[context-window]].',
              example: 'Opens the test file, the auth module and the failing stack trace.',
              useCase: 'Replaces you manually copying code into a chat.',
              related: ['context-window'],
            },
            P: {
              title: 'Plan',
              what: 'It decides what to change and in what order. You can review this plan before any edits, for example in plan mode.',
              example: '"Token expiry is compared in seconds, not ms. Update the helper, then the test."',
              useCase: 'Catching a wrong approach here is cheaper than undoing wrong edits.',
            },
            E: {
              title: 'Edit',
              what: 'It modifies files using tools. In Claude Code, edits normally require your approval depending on the permission mode.',
              example: 'Changes `expiresAt` comparison in `src/auth/token.ts`.',
              useCase: 'Version control lets you inspect and revert every edit.',
            },
            X: {
              title: 'Run',
              what: 'It runs commands such as tests, linters or builds to check its own work.',
              example: '`npm test -- auth`',
              useCase: 'Without something to run, the agent is guessing. Give it a verification command.',
            },
            O: {
              title: 'Observe',
              what: 'It reads the command output and decides whether the result matches the goal. Errors become new context for the next iteration.',
              example: 'Sees 1 failing test, reads the assertion, adjusts the fix.',
              useCase: 'This feedback is the biggest difference from autocomplete.',
            },
            D: {
              title: 'Done?',
              what: 'The agent judges whether the goal is met, based on what it observed. It can be wrong, so this is not a guarantee.',
              useCase: 'Your acceptance criteria and tests make this decision objective.',
            },
            H: {
              title: 'Human review',
              what: 'You read the diff, run the checks yourself and decide to commit or iterate.',
              useCase: 'Accountability stays with you. See [[ai-assisted-engineering]].',
              related: ['ai-assisted-engineering'],
            },
          },
          caption: 'Autocomplete has no Run or Observe step. That loop is what makes an agent.',
        },
        {
          type: 'text',
          md: `## Benefits and limits

**Strong at**
- Boilerplate, tests, refactors with clear rules
- Explaining unfamiliar code
- Mechanical multi-file changes
- First drafts you then refine

**Weak at**
- Unstated business context
- Novel architecture decisions
- Anything it cannot run or verify
- Very large contexts: quality can drop

Hallucinations and [[non-determinism]] apply to agents too.`,
        },
        {
          type: 'compare',
          title: 'Common misconceptions',
          columns: ['Reality'],
          rows: [
            { label: '"It learns from my project"', cells: ['It is stateless between sessions. Persist rules in files.'] },
            { label: '"If tests pass, it is correct"', cells: ['The agent may have weakened or written weak tests. Review the diff.'] },
            { label: '"AI replaces review"', cells: ['More generated code means review matters more.'] },
            { label: '"More context is always better"', cells: ['Noise dilutes relevant information and raises cost.'] },
            { label: '"It will tell me when it is unsure"', cells: ['Confidence in tone does not track correctness.'] },
          ],
        },
        {
          type: 'workflow',
          title: 'Decide: should I use AI for this task?',
          steps: [
            {
              id: 'blast',
              title: 'Check the blast radius',
              what: 'What happens if this is wrong: money, security, user data, production?',
              why: 'High blast radius means heavier review or no autonomous AI.',
              ask: 'If this change is wrong, what is the worst realistic outcome?',
            },
            {
              id: 'verify',
              title: 'Check you can verify',
              what: 'Do tests, types or a runnable command exist to confirm the result?',
              why: 'Unverifiable work is where hallucinations survive.',
              ask: 'Which command proves this works?',
            },
            {
              id: 'understand',
              title: 'Check you can review it',
              what: 'Can you or a teammate understand the output well enough to approve it?',
              why: 'Code nobody understands is a liability.',
              ask: 'Could I explain this change in code review?',
            },
            {
              id: 'data',
              title: 'Check the data rules',
              what: 'Does the task require sharing secrets, customer data or restricted code with the tool?',
              why: 'Company policy may forbid it. Follow your organization rules.',
              ask: 'Is this code or data allowed to be sent to the AI tool?',
            },
          ],
        },
        {
          type: 'callout',
          tone: 'tip',
          title: 'A useful rule of thumb',
          md: 'Use AI freely when the task is **easy to verify and cheap to undo**. Slow down when it is **hard to verify or costly to undo**.',
        },
      ],
      quiz: [
        {
          id: 'q1',
          scenario: 'Your editor suggests the next line as you type. Separately, Claude Code ran your tests, saw a failure, edited a file and reran the tests until they passed.',
          q: 'What makes the second one an agent?',
          options: [
            { text: 'It is a bigger model', why: 'Model size is not the defining factor.' },
            { text: 'It closes the loop itself: it reads, edits, runs commands and observes results', why: 'Correct. The read, plan, edit, run, observe cycle with real tool feedback is what defines an agent.' },
            { text: 'It types faster', why: 'Speed is not the difference.' },
            { text: 'It never makes mistakes', why: 'Agents can make mistakes; they can detect some of them by running checks.' },
          ],
          answer: 1,
        },
        {
          id: 'q2',
          scenario: 'You ask an agent to "make the build faster" in a repo with no benchmarks and no tests.',
          q: 'What is the main problem?',
          options: [
            { text: 'Agents cannot touch build config', why: 'They can. That is not the issue.' },
            { text: 'The goal is vague and nothing lets the agent observe whether it improved', why: 'Correct. Without a measurable target and verification command, the loop has no signal and results are guesses.' },
            { text: 'The context window is too small', why: 'Nothing indicates that.' },
            { text: 'AI is never good at performance', why: 'Overgeneralization. With measurements it can help.' },
          ],
          answer: 1,
        },
        {
          id: 'q3',
          scenario: 'A manager asks which of these tasks to hand to an agent first: (a) rewrite the payment authorization flow, (b) add unit tests to a well tested utility module, (c) change production database credentials.',
          q: 'Which is the best first candidate?',
          options: [
            { text: '(a) payment flow', why: 'High blast radius and hard to verify without deep domain context.' },
            { text: '(c) credentials', why: 'Secrets and production access should not be delegated casually.' },
            { text: '(b) unit tests for a utility module', why: 'Correct. Low blast radius, easy to verify by running tests, easy to revert.' },
            { text: 'None, AI should never be used', why: 'Too absolute. Risk based selection is the right approach.' },
          ],
          answer: 2,
        },
        {
          id: 'q4',
          scenario: 'The agent reports "all tests pass". In the diff you notice it deleted two failing assertions.',
          q: 'What does this illustrate?',
          options: [
            { text: 'Passing tests always mean correct code', why: 'Disproved here: the check itself was weakened.' },
            { text: 'Reviewing the diff is essential because the agent can satisfy a check without meeting the real goal', why: 'Correct. Agents optimise for the signal they observe. Human review verifies intent.' },
            { text: 'Agents cannot run tests', why: 'They can; that is how this happened.' },
            { text: 'You should disable tests', why: 'The opposite. Keep tests and protect them.' },
          ],
          answer: 1,
        },
        {
          id: 'q5',
          scenario: 'A junior developer says: "I will paste the production customer database export into the AI tool so it can debug faster."',
          q: 'What should the senior developer say?',
          options: [
            { text: 'Fine, if it is faster', why: 'Speed does not override data protection obligations.' },
            { text: 'Do not share real customer data. Use anonymized or synthetic data and follow company policy', why: 'Correct. Data handling rules apply to AI tools as to any third party service.' },
            { text: 'Only share half of it', why: 'Partial exposure is still exposure.' },
            { text: 'Share it but ask the AI to forget it', why: 'There is no reliable "forget" instruction; control what you send in the first place.' },
          ],
          answer: 1,
        },
        {
          id: 'q6',
          scenario: 'You are exploring a new idea and want a clickable demo for tomorrow that you will discard after the meeting.',
          q: 'Which approach fits?',
          options: [
            { text: 'Vibe coding is acceptable here since it is throwaway and low risk', why: 'Correct. Low blast radius and disposable output is where fast, loosely reviewed AI work is reasonable. Just do not promote it to production.' },
            { text: 'Full code review and a test suite first', why: 'Overkill for a disposable demo.' },
            { text: 'Refuse to use AI', why: 'Nothing here justifies avoiding it.' },
            { text: 'Deploy it straight to production afterward', why: 'The throwaway assumption would be violated.' },
          ],
          answer: 0,
        },
        {
          id: 'q7',
          scenario: 'In a very long session Claude starts ignoring a constraint you gave at the beginning.',
          q: 'Which is the most plausible explanation and fix?',
          options: [
            { text: 'The context window is crowded; summarize or start fresh and restate key rules in project instructions', why: 'Correct. Finite context and stateless sessions mean early details can be lost. Persist rules in files and keep sessions focused.' },
            { text: 'The model got bored', why: 'Models do not get bored.' },
            { text: 'The keyboard is faulty', why: 'Unrelated.' },
            { text: 'Switch to a different programming language', why: 'Unrelated to the cause.' },
          ],
          answer: 0,
        },
      ],
    },
  ],
  assignments: [
    {
      id: 'm1-a1',
      title: 'Write an AI usage decision guide for your team',
      brief: 'Produce a one page guide that tells your teammates when to use AI, when to supervise closely, and when not to use it, based on your real codebase and company rules.',
      steps: [
        'List 8 to 10 task types your team actually does (for example writing tests, changing auth, database migrations, docs, bug fixes).',
        'For each, rate blast radius (low, medium, high) and how easily it can be verified.',
        'Assign each a recommendation: use freely, use with close review, or do not delegate.',
        'Add the data rules: what code or data must never be shared with an AI tool.',
        'Add a review checklist of 4 to 5 items every AI generated change must pass.',
        'Have one teammate try to apply it to a new task and note where it was unclear.',
      ],
      deliverable: 'A one page document (markdown or doc) with a task table, data rules and a review checklist.',
      checklist: [
        'Contains at least 8 concrete task types from my team',
        'Each task has blast radius, verifiability and a recommendation',
        'States clearly what data must not be shared',
        'Includes a review checklist',
        'A teammate tested it on a new task',
      ],
      hint: 'Use the workflow from lesson 2: blast radius, can I verify, can I review, data rules.',
    },
  ],
};
