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
      summary: 'AI coding tools predict text from what they can see. They are fast and fluent, not always right, so you stay the engineer.',
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
              { text: 'Paste the pnpm rule as the first message of every new session', correct: false, why: 'Works, but it depends on you remembering each time. The rule should load automatically.' },
              { text: 'Add the rule to the project `CLAUDE.md` so it loads every session', correct: true, why: 'The model has no persistent memory, but `CLAUDE.md` is loaded into context at session start, so the rule survives.' },
              { text: 'At the end of each session, tell Claude to remember the rule next time', correct: false, why: 'There is no learning between sessions. Anything not re-sent in the next session is gone.' },
              { text: 'Switch to a model with a bigger context window', correct: false, why: 'A larger window holds more within one session. It does not carry information into the next one.' },
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
            { text: 'Ship it after clicking through the refund screens a few times to check they work', why: 'A click-through covers the happy path only. Refunds involve money, auth and edge cases that nobody has reviewed.' },
            { text: 'Review the code, add tests and run security checks before real refunds go through', why: 'Correct. Moving from vibe coding to engineering means someone understands, tests and owns the code.' },
            { text: 'Ask the AI to confirm the code is secure, then ship it once the AI answers that it is', why: 'The model can be confidently wrong. Self assessment is not a substitute for tests and human review.' },
            { text: 'Rewrite the whole tool by hand so no AI generated code remains in it', why: 'Unnecessary. AI can still help, as long as engineering discipline is applied.' },
          ],
          answer: 1,
        },
        {
          id: 'q2',
          scenario: 'You paste a 5,000 line log into a chat and ask for the root cause. The answer ignores the error at the very top of the log.',
          q: 'What is the most likely practical reason?',
          options: [
            { text: 'The model only reads the last few hundred lines of any pasted text', why: 'There is no such rule. Everything pasted sits in the window, but noise dilutes the relevant parts.' },
            { text: 'The big paste crowded the context window, so the key error got diluted or dropped', why: 'Correct. The window is finite and noisy context hurts quality. Trim the log to the relevant section.' },
            { text: 'The model mixed it up with a similar log from your session yesterday', why: 'It has no persistent memory between sessions, so nothing from yesterday is available.' },
            { text: 'Logs are plain text, so the model cannot parse them without a log plugin', why: 'Models read logs fine. Size and relevance matter, not a special plugin.' },
          ],
          answer: 1,
        },
        {
          id: 'q3',
          scenario: 'A prompt in your CI script generated a perfect changelog last Tuesday. This Tuesday the format is slightly different and a downstream parser fails.',
          q: 'What does this show?',
          options: [
            { text: 'The provider updated the model overnight, so the old prompt no longer behaves the same way', why: 'Possible, but not required. The same prompt can vary from run to run with no update at all.' },
            { text: 'Output varies between runs, so ask for an exact format and validate it in code', why: 'Correct. Same prompt can yield different output. Specify the format precisely and validate it in code.' },
            { text: 'The CI runner ran low on memory, which changed how the changelog was formatted', why: 'Runner memory does not change the wording or structure of the model output.' },
            { text: 'AI is too unreliable for CI, so write changelogs by hand from now on', why: 'Overreaction. Changelogs can be automated with format constraints and validation.' },
          ],
          answer: 1,
        },
        {
          id: 'q4',
          scenario: 'A colleague says: "Claude Code is just Claude chat in a terminal."',
          q: 'What is the most accurate correction?',
          options: [
            { text: 'It is an agent that reads your repo, edits files and runs commands with permission', why: 'Correct. The difference is access to your environment and the ability to act, which is why it needs permissions.' },
            { text: 'It is a smaller, cheaper model tuned only for writing code', why: 'It uses Claude models. It is a tool built on them, not a separate model family.' },
            { text: 'It is the same chat model in a terminal window, so it only sees text you paste into it', why: 'Chat only sees what you paste. Claude Code can read files and act inside your repo.' },
            { text: 'It runs fully offline on your machine, so no code ever leaves it', why: 'It needs an internet connection to reach the model, so relevant text is sent to it.' },
          ],
          answer: 0,
        },
        {
          id: 'q5',
          scenario: 'Claude suggests running `npm install fast-json-safe-parse` to fix an issue. You have never heard of this package.',
          q: 'What should you do?',
          options: [
            { text: 'Install it, since Claude suggested it for this exact error message', why: 'This is how hallucinated or malicious packages enter a project.' },
            { text: 'Check that the package exists, who maintains it and whether you need it', why: 'Correct. Plausible but invented names are a known hallucination pattern, and typo squatted packages are a supply chain risk.' },
            { text: 'Ask Claude whether the package is real, and install it if Claude confirms that it is', why: 'Models often reaffirm their own suggestions. Check the registry instead.' },
            { text: 'Install it globally instead so the project itself stays untouched', why: 'Global installs still execute code on your machine.' },
          ],
          answer: 1,
        },
        {
          id: 'q6',
          scenario: 'Each Monday you spend ten minutes retyping team conventions into Claude before work starts.',
          q: 'What is the better approach?',
          options: [
            { text: 'Keep a text file of conventions and paste it in every Monday morning', why: 'Still manual. A file loaded automatically removes the retyping and is shared with the team.' },
            { text: 'Put the conventions in a project instruction file that loads every session', why: 'Correct. With no persistent memory, files loaded into context are how rules persist and are shared with the team.' },
            { text: 'Keep one session open for weeks so Claude never loses the conventions', why: 'Long sessions fill the window, cost more and can lose early details.' },
            { text: 'Raise the temperature setting so Claude is more likely to recall them', why: 'Temperature affects randomness of output. It is not a mechanism for remembering anything.' },
          ],
          answer: 1,
        },
      ],
    },
    {
      id: 'm1-l2',
      title: 'Agents, limits and when to use AI',
      minutes: 25,
      summary: 'Claude Code is an agent that reads, edits and runs things in a loop. Learn when to use it, how closely to watch it, and when to skip it.',
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
            { text: 'It runs on a bigger model than the editor autocomplete uses', why: 'Model size is not the defining factor. Both could use similar models.' },
            { text: 'It reads, edits, runs commands and checks the results in a loop on its own', why: 'Correct. The read, plan, edit, run, observe cycle with real tool feedback is what defines an agent.' },
            { text: 'It types out code faster than the editor suggestion engine can', why: 'Speed is not the difference. The loop with real feedback is.' },
            { text: 'It reviews its own output well enough that mistakes never reach you', why: 'Agents still make mistakes. They can detect some of them by running checks.' },
          ],
          answer: 1,
        },
        {
          id: 'q2',
          scenario: 'You ask an agent to "make the build faster" in a repo with no benchmarks and no tests.',
          q: 'What is the main problem?',
          options: [
            { text: 'Agents are not allowed to modify build configuration files', why: 'They can, with your approval. That is not the issue.' },
            { text: 'The goal is vague and nothing lets the agent measure whether the build got faster', why: 'Correct. Without a measurable target and verification command, the loop has no signal and results are guesses.' },
            { text: 'The repo is too small for the agent to find anything worth optimising', why: 'Repo size is not the problem. Missing measurement is.' },
            { text: 'Agents cannot reason about performance at all, so this kind of task should never be delegated', why: 'Overgeneralization. With measurements an agent can help with performance work.' },
          ],
          answer: 1,
        },
        {
          id: 'q3',
          scenario: 'A manager asks which of these tasks to hand to an agent first: (a) rewrite the payment authorization flow, (b) add unit tests to a well tested utility module, (c) change production database credentials.',
          q: 'Which is the best first candidate?',
          options: [
            { text: '(a) the payment authorization flow, since AI is good at complex business logic and edge cases', why: 'High blast radius and hard to verify without deep domain context.' },
            { text: '(c) the production database credentials, since it is only a small edit', why: 'Secrets and production access should not be delegated casually, however small the edit.' },
            { text: '(b) unit tests for the well tested utility module, low risk and easy to check', why: 'Correct. Low blast radius, easy to verify by running tests, easy to revert.' },
            { text: 'None of them, because agents should never be given engineering tasks', why: 'Too absolute. Risk based selection is the right approach.' },
          ],
          answer: 2,
        },
        {
          id: 'q4',
          scenario: 'The agent reports "all tests pass". In the diff you notice it deleted two failing assertions.',
          q: 'What does this illustrate?',
          options: [
            { text: 'Passing tests prove the code is correct, so the two deleted assertions are not a concern here', why: 'Disproved here: the check itself was weakened, so a pass proves little.' },
            { text: 'Read the diff, because an agent can satisfy a check without meeting the real goal', why: 'Correct. Agents optimise for the signal they observe. Human review verifies intent.' },
            { text: 'Agents cannot run tests themselves, so the report cannot be trusted', why: 'They can run tests; that is how this happened.' },
            { text: 'Tests are unreliable with agents, so turn them off and review by hand', why: 'The opposite. Keep tests and protect them from being weakened.' },
          ],
          answer: 1,
        },
        {
          id: 'q5',
          scenario: 'A junior developer says: "I will paste the production customer database export into the AI tool so it can debug faster."',
          q: 'What should the senior developer say?',
          options: [
            { text: 'Fine for debugging, as long as the export is deleted from the AI tool as soon as you finish', why: 'Deleting afterward does not undo the disclosure, and policy may forbid sending it at all.' },
            { text: 'Do not share real customer data; use anonymized or synthetic data and follow policy', why: 'Correct. Data handling rules apply to AI tools as to any third party service.' },
            { text: 'Share only the rows that matter for the bug, since partial exposure is acceptable', why: 'Partial exposure of real customer data is still exposure.' },
            { text: 'Share it, then tell the AI to forget it once the bug is fixed', why: 'There is no reliable forget instruction; control what you send in the first place.' },
          ],
          answer: 1,
        },
        {
          id: 'q6',
          scenario: 'You are exploring a new idea and want a clickable demo for tomorrow that you will discard after the meeting.',
          q: 'Which approach fits?',
          options: [
            { text: 'Vibe coding is fine for a disposable demo; just do not ship it later', why: 'Correct. Low blast radius and disposable output is where fast, loosely reviewed AI work is reasonable.' },
            { text: 'Write a full test suite and run a formal review before building anything', why: 'Overkill for a demo you will discard after the meeting.' },
            { text: 'Avoid AI here, because demos for meetings need hand written code', why: 'Nothing here justifies avoiding it. A throwaway demo is a good fit.' },
            { text: 'Build it fast, then deploy it to production if people like the demo', why: 'That breaks the throwaway assumption. Production needs review and tests.' },
          ],
          answer: 0,
        },
        {
          id: 'q7',
          scenario: 'In a very long session Claude starts ignoring a constraint you gave at the beginning.',
          q: 'Which is the most plausible explanation and fix?',
          options: [
            { text: 'The context is crowded; restate key rules in project instructions or start fresh', why: 'Correct. Finite context and stateless sessions mean early details can be lost. Persist rules in files and keep sessions focused.' },
            { text: 'The model learned a newer instruction and permanently overwrote the old one', why: 'Models do not learn from the conversation. The cause is the crowded window.' },
            { text: 'Your API key hit a rate limit, which makes the model skip some instructions', why: 'Rate limits cause errors or delays, not selectively ignored instructions.' },
            { text: 'Turn off tool use entirely, since tool output is the thing that makes the model forget rules', why: 'Tool output does fill the window, but removing tools removes the agent. Trim context instead.' },
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
      minutes: 45,
      example: "**Example for a payments API team.** Short on purpose. Yours should use your own tasks and rules.\n\n**Use freely (low risk, easy to check)**\n- Writing unit tests for existing code: small blast radius, run the tests to verify.\n- Drafting docs and code comments: low risk, a teammate reads them.\n- Explaining unfamiliar code: nothing changes, check the claims against the real files.\n\n**Use with close review (medium risk)**\n- Bug fixes in business logic: reproduce first, a failing test must pass afterwards, read every line of the diff.\n- New API endpoints: check validation, error handling and permissions before merging.\n- Refactoring: only behind existing tests, in small steps.\n\n**Do not delegate (high risk or hard to verify)**\n- Changing login, permissions or payment flows: a person writes it, AI may help review.\n- Database migrations on live data: a person runs and checks them.\n- Anything that needs real customer data to try out.\n\n**Data rules**\n- Never paste API keys, passwords, tokens or customer data into a prompt.\n- Use fake or anonymised data in examples and test fixtures.\n- Client code goes only into tools the client contract allows.\n\n**Review checklist for every AI generated change**\n1. I can explain what every changed line does.\n2. Tests ran and pass, and at least one test would fail if the change were wrong.\n3. No secrets, and no new dependency that I did not choose.\n4. Inputs are validated and errors do not leak details.\n5. A teammate reviewed it like any other pull request.",
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
