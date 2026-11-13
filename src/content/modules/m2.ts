import type { Module, Concept } from '../types';

export const concepts: Concept[] = [
  {
    id: 'native-install',
    name: 'Native install',
    what: 'The recommended way to install Claude Code: a single installer script that places the `claude` binary in your user directory and keeps it updated in the background.',
    why: 'No Node.js needed and it auto-updates. Package managers (Homebrew, WinGet, apt, dnf, apk) and npm also work but do not auto-update by default (npm install can update itself if its directory is writable).',
    how: 'macOS, Linux, WSL: `curl -fsSL https://claude.ai/install.sh | bash`. Windows PowerShell: `irm https://claude.ai/install.ps1 | iex`. Then open a new terminal and run `claude --version`.',
    when: 'Default choice for individuals. Use Homebrew, WinGet or Linux package managers if your team standardises on them.',
    example: '`claude --version` prints something like `2.1.211 (Claude Code)`.',
    mistakes: 'Not opening a new terminal after install (PATH not refreshed), or using PowerShell syntax in CMD and vice versa. Never use `sudo npm install -g`.',
    kind: 'command',
  },
  {
    id: 'claude-doctor',
    name: 'claude doctor',
    what: 'A shell command that prints read-only diagnostics about your installation and settings without starting a session.',
    why: 'First stop when something is off: install health, settings validation errors, auto-update status.',
    how: 'Run `claude doctor` in your terminal. Inside a session, `/doctor` runs a fuller setup checkup that can propose fixes.',
    when: 'After install problems, odd behaviour, or before asking for help.',
    example: '`claude doctor`',
    mistakes: 'Confusing the shell command `claude doctor` (read-only diagnostics) with the in-session `/doctor` checkup.',
    kind: 'command',
  },
  {
    id: 'authentication',
    name: 'Authentication',
    what: 'Signing in so Claude Code can use Claude models: a Claude subscription (Pro, Max, Ultra, Team, Enterprise), a Claude Console account, or a cloud provider (Amazon Bedrock, Google Cloud, Microsoft Foundry). The free claude.ai plan does not include Claude Code.',
    why: 'Determines billing (plan usage vs per-token API) and which controls your organization has.',
    how: 'Run `claude` and follow the browser prompt. Or `claude auth login` (add `--console` for Console billing). Inside a session use `/login` and `/logout`. `claude auth status` shows the current state.',
    when: 'First run, switching accounts, or when billing should go to a different account.',
    example: '`claude auth status --text`',
    mistakes: 'Leaving `ANTHROPIC_API_KEY` set in your environment and wondering why usage bills the API instead of the subscription. Claude Code asks you to approve the key before using it.',
    kind: 'config',
  },
  {
    id: 'settings-files',
    name: 'Settings files',
    what: 'JSON files that configure Claude Code. User settings live in `~/.claude/settings.json`; project settings in `.claude/settings.json` (shared, commit it) and `.claude/settings.local.json` (personal, not shared).',
    why: 'Lets a team share permissions and defaults while individuals keep personal tweaks.',
    how: 'Edit the file directly, or use `/config` in a session (`/config model=sonnet` sets a key directly).',
    when: 'Setting a default permission mode, release channel or allowed commands.',
    example: '{ "permissions": { "defaultMode": "plan" } }',
    mistakes: 'Committing personal local settings, or expecting project files to set auto or bypass modes as a starting mode (they are ignored for that).',
    kind: 'config',
  },
  {
    id: 'permission-modes',
    name: 'Permission modes',
    what: 'Settings that decide what Claude may do without asking. Modes include `default` (shown as Manual: reads only), `acceptEdits`, `plan`, `auto` (a classifier reviews actions), `dontAsk` and `bypassPermissions`.',
    why: 'You trade convenience against control. Match the mode to the risk of the task and the safety of the environment.',
    how: 'Press `Shift+Tab` to cycle during a session, start with `claude --permission-mode plan`, or set `permissions.defaultMode` in settings.',
    when: 'Plan mode to explore, acceptEdits when you review diffs afterwards, bypassPermissions only in isolated containers or VMs.',
    example: '`claude --permission-mode plan`',
    mistakes: 'Using `--dangerously-skip-permissions` on a normal laptop with real credentials. Deny rules still apply in every mode.',
    kind: 'config',
  },
  {
    id: 'plan-mode',
    name: 'Plan mode',
    what: 'A permission mode where Claude explores and proposes a plan, and edits stay blocked until you approve.',
    why: 'Catches wrong approaches before any file changes, which saves tokens and rework.',
    how: 'Cycle with `Shift+Tab`, type `/plan <task>`, or start with `claude --permission-mode plan`.',
    when: 'Unfamiliar codebases, multi-file changes, anything where direction matters.',
    example: '`/plan add rate limiting to the login endpoint`',
    mistakes: 'Approving a plan without reading it.',
    kind: 'workflow',
  },
  {
    id: 'slash-commands',
    name: 'Slash commands',
    what: 'Commands that control Claude Code from inside a session. Type `/` to see the list. A command is only recognised at the start of your message.',
    why: 'They manage the session itself: context, model, permissions, history, configuration.',
    how: 'Type `/` plus letters to filter. Examples: `/help`, `/clear`, `/compact`, `/context`, `/resume`, `/model`, `/permissions`, `/config`, `/init`.',
    when: 'Whenever you need to control the tool rather than ask it to write code.',
    example: '`/compact Focus on the failing test and the auth changes`',
    mistakes: 'Putting text before the slash (then it is not a command). Inventing commands: use `/help` to see what exists in your version.',
    kind: 'command',
  },
  {
    id: 'claude-md',
    name: 'CLAUDE.md',
    what: 'A markdown file of project instructions that Claude Code loads into context at the start of each session.',
    why: 'Claude has no memory between sessions, so build commands, conventions and rules go here once.',
    how: 'Run `/init` to generate a starter file, then edit it. Use `/memory` to edit memory files. Keep it short; the docs suggest under about 200 lines.',
    when: 'Every real project.',
    example: '"Use pnpm. Run `pnpm test` before finishing. Never edit files in /generated."',
    mistakes: 'Making it huge. Every line costs tokens in every session.',
    kind: 'config',
  },
  {
    id: 'session-resume',
    name: 'Sessions and resume',
    what: 'Each conversation is a session saved locally. You can continue the latest one or pick an earlier one.',
    why: 'Lets you pick up a task after closing the terminal without re-explaining.',
    how: '`claude -c` (or `--continue`) loads the most recent conversation in the current directory. `claude -r "<name or id>"` (or `--resume`) resumes a specific one or opens a picker. In a session, `/resume` opens the picker. Name sessions with `claude -n "name"` or `/rename`.',
    when: 'Returning to unfinished work. Start fresh with `/clear` when switching topics.',
    example: '`claude -r "auth-refactor"`',
    mistakes: 'Resuming a huge old session for an unrelated task, which drags stale context along.',
    kind: 'command',
  },
  {
    id: 'context-management',
    name: 'Context management',
    what: 'Keeping the context window lean and relevant. Tools: `/context` (see what is using space), `/compact [instructions]` (summarize history to free space), `/clear` (start a new conversation with empty context), `/usage` (session cost and plan usage; `/cost` is an alias).',
    why: 'Context is resent every request. Bloat costs tokens and can degrade answers.',
    how: 'Clear between unrelated tasks, compact with focus instructions during long tasks, trim CLAUDE.md, disable unused MCP servers, write specific prompts.',
    when: 'When the session gets long, switches topic, or costs climb.',
    example: '`/compact Focus on code samples and API usage`',
    mistakes: 'Never clearing, or compacting without telling Claude what to keep.',
    kind: 'command',
  },
  {
    id: 'working-directory',
    name: 'Working directory',
    what: 'The folder where you launched `claude`. Claude reads and edits files inside it by default and treats it as the project root.',
    why: 'It limits scope and decides which CLAUDE.md and settings load.',
    how: '`cd` into the project, then run `claude`. Add more folders with `/add-dir <path>` or the `--add-dir` flag. Reference files in a prompt with `@path`.',
    when: 'Always. Launching from your home folder gives Claude a far too broad scope.',
    example: '`cd ~/projects/shop-api` then `claude`',
    mistakes: 'Starting Claude in the wrong folder, or assuming `--add-dir` loads that folder\'s `.claude` configuration (it grants file access, not configuration).',
    kind: 'concept',
  },
];

export const module: Module = {
  id: 'm2',
  number: 2,
  title: 'Claude Code Fundamentals',
  tagline: 'Install it, sign in, and drive a session with confidence.',
  level: 'Foundation',
  requires: ['m1'],
  outcomes: [
    'Install and verify Claude Code, and authenticate with the right account type',
    'Navigate the interface and choose an appropriate permission mode',
    'Resume and manage sessions, and use essential shortcuts and slash commands',
    'Keep context lean with /context, /compact and /clear to control quality and cost',
  ],
  skills: ['Claude Code setup', 'Session control', 'Permissions', 'Context management'],
  lessons: [
    {
      id: 'm2-l1',
      title: 'Install, terminal basics and authentication',
      minutes: 25,
      objectives: [
        'Install Claude Code with a current official method and verify it',
        'Use basic terminal navigation to start Claude in the right folder',
        'Authenticate with an appropriate account type',
        'Know where settings live and how to change them',
      ],
      blocks: [
        {
          type: 'text',
          md: `## Terminal in two minutes

Claude Code runs in your terminal, in the folder you start it from. You need only a few commands:

- \`pwd\` (or \`cd\` alone in PowerShell/CMD): where am I?
- \`ls\` (macOS/Linux) or \`dir\` (Windows): list files
- \`cd folder\`: enter a folder, \`cd ..\`: go up

Always \`cd\` into your **project folder** first. See [[working-directory]].`,
        },
        {
          type: 'compare',
          title: 'Current official install methods',
          columns: ['Command', 'Auto-updates', 'Notes'],
          rows: [
            { label: 'Native (macOS, Linux, WSL)', cells: ['`curl -fsSL https://claude.ai/install.sh | bash`', 'Yes', 'Recommended'] },
            { label: 'Native (Windows PowerShell)', cells: ['`irm https://claude.ai/install.ps1 | iex`', 'Yes', 'Git for Windows optional but recommended'] },
            { label: 'Native (Windows CMD)', cells: ['`curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd`', 'Yes', 'Only in CMD, not PowerShell'] },
            { label: 'Homebrew', cells: ['`brew install --cask claude-code`', 'No', 'Upgrade with `brew upgrade claude-code`'] },
            { label: 'WinGet', cells: ['`winget install Anthropic.ClaudeCode`', 'No', 'Upgrade with `winget upgrade Anthropic.ClaudeCode`'] },
            { label: 'npm', cells: ['`npm install -g @anthropic-ai/claude-code`', 'Manual', 'Needs Node.js 22+. Never use sudo'] },
          ],
        },
        {
          type: 'callout',
          tone: 'version',
          title: 'Check the docs for your platform',
          md: 'Requirements at time of writing: macOS 13+, Windows 10 1809+, Ubuntu 20.04+, Debian 10+, Alpine 3.19+, 4 GB RAM, internet access. Install methods and defaults change; confirm at code.claude.com/docs (Advanced setup).',
        },
        {
          type: 'code',
          lang: 'bash',
          title: 'Verify, then start your first session',
          code: `claude --version     # prints a version number if installed
claude doctor        # read-only install and settings diagnostics
cd ~/projects/my-app # go to your project first
claude               # start an interactive session`,
          note: 'Open a **new** terminal window after installing so PATH is refreshed. See [[native-install]] and [[claude-doctor]].',
        },
        {
          type: 'text',
          md: `## Authentication

Run \`claude\` and follow the browser prompt. See [[authentication]].

- **Subscription** (Pro, Max, Ultra, Team, Enterprise): usage comes from your plan.
- **Console account**: per-token API billing. \`claude auth login --console\`.
- **Cloud provider**: Bedrock, Google Cloud, Microsoft Foundry.

The free claude.ai plan does **not** include Claude Code.

Check state with \`claude auth status\`. Inside a session: \`/login\`, \`/logout\`, \`/status\`.`,
        },
        {
          type: 'text',
          md: `## Configuration

[[settings-files]] control behaviour:

- \`~/.claude/settings.json\`: your user defaults
- \`.claude/settings.json\`: project, shared with the team
- \`.claude/settings.local.json\`: project, personal

Use \`/config\` in a session to open settings, or \`/config model=sonnet\` to set a key directly. Run \`/init\` to create a starter [[claude-md]] for the project.`,
        },
        {
          type: 'exercise',
          exercise: {
            id: 'm2-ex-install-order',
            kind: 'order',
            title: 'First run, in order',
            category: 'workflow',
            prompt: 'Put the steps for a clean first setup in the correct order.',
            items: [
              'Run the installer command for your platform',
              'Open a new terminal window',
              'Run claude --version to confirm the install',
              'cd into your project folder',
              'Run claude and sign in through the browser',
            ],
            explanation: 'Install, refresh the terminal so PATH updates, verify, enter the project, then start and authenticate.',
          },
        },
      ],
      quiz: [
        {
          id: 'q1',
          scenario: 'You ran the PowerShell installer. In the same window `claude --version` says "claude is not recognized".',
          q: 'What is the first thing to try?',
          options: [
            { text: 'Reinstall with sudo', why: 'There is no sudo on Windows PowerShell, and elevated installs are not needed.' },
            { text: 'Open a new terminal window and try again; if still failing, check PATH or run claude doctor guidance', why: 'Correct. The docs say to open a new terminal after install, and fix PATH if the install directory is missing.' },
            { text: 'Install Node.js', why: 'The native installer does not need Node.js.' },
            { text: 'Buy a Pro plan', why: 'Plans affect login, not whether the binary is found.' },
          ],
          answer: 1,
        },
        {
          id: 'q2',
          scenario: 'You paste `irm https://claude.ai/install.ps1 | iex` into CMD and get "irm is not recognized".',
          q: 'What happened?',
          options: [
            { text: 'The server is down', why: 'The error is local to your shell.' },
            { text: 'You are in CMD, not PowerShell. Use the CMD command or open PowerShell', why: 'Correct. `irm` is a PowerShell command. CMD uses the `curl ... install.cmd` variant.' },
            { text: 'You need admin rights', why: 'Admin is not required.' },
            { text: 'Windows is unsupported', why: 'Windows 10 1809+ is supported.' },
          ],
          answer: 1,
        },
        {
          id: 'q3',
          scenario: 'A teammate on the free claude.ai plan cannot sign in to Claude Code.',
          q: 'What is the explanation and the fix?',
          options: [
            { text: 'Claude Code needs a Pro, Max, Ultra, Team, Enterprise or Console account (or a cloud provider); the free plan does not include it', why: 'Correct per the official authentication requirements.' },
            { text: 'Their terminal is too old', why: 'Not the cause here.' },
            { text: 'They must reinstall npm', why: 'Unrelated to account access.' },
            { text: 'They need a VPN', why: 'Unrelated.' },
          ],
          answer: 0,
        },
        {
          id: 'q4',
          scenario: 'You installed via Homebrew three months ago and a teammate on the native installer has newer features.',
          q: 'Why?',
          options: [
            { text: 'Homebrew installs do not auto-update; run `brew upgrade claude-code` (or the cask you chose)', why: 'Correct. Native installs update in the background; Homebrew, WinGet and Linux packages need manual upgrades.' },
            { text: 'Homebrew is not supported', why: 'It is an official method.' },
            { text: 'Features are tied to the OS', why: 'Version differences come from update behaviour.' },
            { text: 'You must delete ~/.claude', why: 'That removes your settings and history and does not update the binary.' },
          ],
          answer: 0,
        },
        {
          id: 'q5',
          scenario: 'Your team wants a shared rule "never allow edits to /migrations without asking" but each developer also has personal preferences like their favourite theme.',
          q: 'Where should each go?',
          options: [
            { text: 'Everything in ~/.claude/settings.json', why: 'That is per user, so the team rule would not be shared.' },
            { text: 'Team rule in committed `.claude/settings.json`; personal tweaks in user settings or `.claude/settings.local.json`', why: 'Correct. Project file is shareable, local and user files are personal.' },
            { text: 'Everything in `.claude/settings.local.json` and commit it', why: 'The local file is meant for personal settings and is not meant to be shared.' },
            { text: 'In a README only', why: 'A README does not enforce anything.' },
          ],
          answer: 1,
        },
        {
          id: 'q6',
          scenario: 'You start `claude` from your home directory because you were in a hurry, then ask it to "clean up the project".',
          q: 'What is the risk?',
          options: [
            { text: 'None, Claude detects the project automatically', why: 'It uses the launch directory as its working scope.' },
            { text: 'The scope is far too broad: wrong CLAUDE.md, many unrelated files, and more chance of touching things you did not intend', why: 'Correct. Always `cd` into the project before running `claude`.' },
            { text: 'It will refuse to start', why: 'It starts fine, which is the problem.' },
            { text: 'It will use a smaller model', why: 'The directory does not change the model.' },
          ],
          answer: 1,
        },
      ],
    },
    {
      id: 'm2-l2',
      title: 'The interface, permissions and files',
      minutes: 25,
      objectives: [
        'Identify the parts of the Claude Code interface',
        'Choose and switch permission modes appropriately',
        'Point Claude at files and directories using @ mentions and /add-dir',
        'Run shell commands from the prompt with !',
      ],
      blocks: [
        {
          type: 'text',
          md: `The interface is a prompt box plus a conversation. You type a request; Claude shows its reasoning, tool calls and diffs; permission prompts appear when it wants to do something that is not pre-approved.

Try the simulator below. Click around: the parts mirror what you will see in a real session.`,
        },
        { type: 'claudeUi' },
        {
          type: 'text',
          md: `## Prompt shortcuts

- \`@path\` mentions a file or folder and triggers autocomplete
- \`!\` at the start runs a shell command directly and adds its output to the session
- \`/\` at the start opens commands
- \`Shift+Tab\` cycles permission modes
- \`Esc\` interrupts Claude; \`Esc Esc\` on an empty prompt opens the rewind menu`,
        },
        {
          type: 'compare',
          title: 'Permission modes',
          columns: ['Runs without asking', 'Best for'],
          rows: [
            { label: 'default (Manual)', cells: ['Reads only', 'Reviewing every action, sensitive work'] },
            { label: 'acceptEdits', cells: ['Reads, file edits and common filesystem commands in the working directory', 'Iterating on code you review via git diff'] },
            { label: 'plan', cells: ['Reads; edits blocked until you approve a plan', 'Exploring before changing'] },
            { label: 'auto', cells: ['Everything, with a classifier reviewing each action', 'Long tasks, fewer prompts'] },
            { label: 'dontAsk', cells: ['Only pre-approved tools; anything else is denied', 'Locked down CI and scripts'] },
            { label: 'bypassPermissions', cells: ['Everything', 'Isolated containers and VMs only'] },
          ],
        },
        {
          type: 'callout',
          tone: 'version',
          title: 'Defaults depend on version and plan',
          md: 'Starting mode in the terminal varies by Claude Code version and plan (recent versions start in `auto` where available). Run `claude --version` and check the permission modes page. Auto mode needs a supported model. Deny rules apply in every mode, including `bypassPermissions`.',
        },
        {
          type: 'code',
          lang: 'bash',
          title: 'Choosing a mode',
          code: `claude --permission-mode plan        # start in plan mode
# during a session: press Shift+Tab to cycle modes
# or inside the prompt:
/plan add input validation to the signup form`,
          note: 'See [[permission-modes]] and [[plan-mode]]. `--dangerously-skip-permissions` equals bypassPermissions: use it only in isolated environments.',
        },
        {
          type: 'text',
          md: `## Files and directories

- Claude works inside the folder you launched from.
- \`@src/auth/token.ts\` puts that file in context without a search.
- \`/add-dir ../shared-lib\` (or \`claude --add-dir ../shared-lib\`) grants access to another folder for the session. It grants file access, not that folder's \`.claude\` configuration.
- \`/permissions\` shows and edits allow, ask and deny rules.
- \`/diff\` reviews working tree changes, \`/rewind\` restores an earlier point.`,
        },
        {
          type: 'exercise',
          exercise: {
            id: 'm2-ex-mode-choice',
            kind: 'choose',
            title: 'Pick the permission mode',
            category: 'security',
            prompt: 'You are about to let Claude refactor a payments module in a repo that has your real cloud credentials in environment variables on your laptop. Which starting mode is most appropriate?',
            options: [
              { text: '`claude --dangerously-skip-permissions`', correct: false, why: 'Skips prompts entirely. Intended only for isolated containers or VMs, not a laptop with real credentials.' },
              { text: '`claude --permission-mode plan`, review the plan, then approve edits step by step or with acceptEdits', correct: true, why: 'Plan first protects against a wrong direction, and keeping edits reviewed limits risk on a sensitive module.' },
              { text: 'dontAsk mode', correct: false, why: 'dontAsk denies anything not pre-approved. It suits locked down automation, not interactive refactoring.' },
              { text: 'Nothing special, defaults are always safe', correct: false, why: 'Defaults vary by version and plan, and the right mode depends on the task.' },
            ],
            explanation: 'Match the mode to the risk. Sensitive code and real credentials call for plan mode and reviewed edits.',
          },
        },
      ],
      quiz: [
        {
          id: 'q1',
          scenario: 'You want Claude to look at an unfamiliar service and propose how to add caching, but not change anything yet.',
          q: 'Which is best?',
          options: [
            { text: 'Start with `claude --dangerously-skip-permissions`', why: 'Removes the very safety you want.' },
            { text: 'Use plan mode via `Shift+Tab`, `/plan`, or `--permission-mode plan`', why: 'Correct. Plan mode explores and proposes; edits stay blocked until you approve.' },
            { text: 'Use dontAsk', why: 'That is for locked down automation.' },
            { text: 'Ask in chat without a repo', why: 'It would not see your code.' },
          ],
          answer: 1,
        },
        {
          id: 'q2',
          scenario: 'You want to run `git status` and let Claude react to the output without asking it to run the command.',
          q: 'What do you type?',
          options: [
            { text: '`/git status`', why: 'Not a built-in command for that.' },
            { text: '`! git status` at the start of the prompt', why: 'Correct. A leading `!` runs the command directly, adds its output to the session and Claude can respond to it.' },
            { text: '`@git status`', why: '`@` mentions files and folders.' },
            { text: '`Esc Esc`', why: 'That clears the draft or opens rewind.' },
          ],
          answer: 1,
        },
        {
          id: 'q3',
          scenario: 'Your app imports a sibling folder `../shared-lib`. Claude says it cannot read files there.',
          q: 'What is the right fix?',
          options: [
            { text: 'Run `/add-dir ../shared-lib` (or start with `--add-dir`)', why: 'Correct. It grants file access to the extra directory for the session.' },
            { text: 'Move the whole repo to the home folder', why: 'Over broad and disruptive.' },
            { text: 'Switch to bypassPermissions', why: 'Permission mode does not extend the working directories in the way you need and is riskier.' },
            { text: 'Reinstall Claude Code', why: 'Unrelated.' },
          ],
          answer: 0,
        },
        {
          id: 'q4',
          scenario: 'Each Claude edit prompts for approval. You are iterating on a UI and will review everything in `git diff` afterwards.',
          q: 'Which mode reduces friction while keeping review?',
          options: [
            { text: 'bypassPermissions', why: 'Removes all checks; excessive for a laptop.' },
            { text: 'acceptEdits', why: 'Correct. It auto-approves file edits and common filesystem commands in the working directory, and you review the diff afterwards.' },
            { text: 'dontAsk', why: 'It denies anything not pre-approved; you would be blocked.' },
            { text: 'Close the terminal', why: 'Does not help.' },
          ],
          answer: 1,
        },
        {
          id: 'q5',
          scenario: 'A teammate says: "Even in bypassPermissions, my deny rule for reading .env should still block Claude."',
          q: 'Are they right?',
          options: [
            { text: 'No, bypass ignores all rules', why: 'The docs state deny rules block in every mode, including bypassPermissions.' },
            { text: 'Yes, deny rules apply in every mode, though allow rules have no effect in bypassPermissions', why: 'Correct per the permission modes documentation.' },
            { text: 'Only in plan mode', why: 'Deny rules are not limited to plan mode.' },
            { text: 'Only on Windows', why: 'Platform is not the factor.' },
          ],
          answer: 1,
        },
        {
          id: 'q6',
          scenario: 'You press Escape twice on an empty prompt after Claude made changes you dislike.',
          q: 'What happens?',
          options: [
            { text: 'Claude Code exits', why: 'Exit is via `Ctrl+C` twice, `Ctrl+D` or `/exit`.' },
            { text: 'The rewind menu opens so you can restore code and conversation to an earlier point', why: 'Correct. With an empty input, double Esc opens the rewind menu (same idea as `/rewind`).' },
            { text: 'Permissions reset to default', why: 'Not what Esc Esc does.' },
            { text: 'The session is deleted', why: 'Nothing is deleted.' },
          ],
          answer: 1,
        },
      ],
    },
    {
      id: 'm2-l3',
      title: 'Sessions, commands and context control',
      minutes: 30,
      objectives: [
        'Resume and continue sessions and name them for later',
        'Use essential slash commands and keyboard shortcuts',
        'Use /context, /compact, /clear and /usage to manage context and cost',
        'Decide when to compact, clear or resume',
      ],
      blocks: [
        {
          type: 'text',
          md: `## Sessions

Every conversation is saved locally as a session. See [[session-resume]].

- \`claude -c\` continues the most recent conversation in this directory
- \`claude -r "name-or-id"\` resumes a specific one (or opens a picker without an argument)
- \`/resume\` opens the picker inside a session
- \`claude -n "my-feature"\` or \`/rename\` names it so you can find it later`,
        },
        {
          type: 'code',
          lang: 'bash',
          title: 'Session commands from the shell',
          code: `claude -n "auth-refactor"            # start a named session
claude -c                            # continue the latest in this folder
claude -r "auth-refactor"            # resume by name
claude -r "auth-refactor" --fork-session   # resume but branch into a new session ID`,
        },
        {
          type: 'compare',
          title: 'Essential slash commands',
          columns: ['What it does'],
          rows: [
            { label: '/help', cells: ['Show help and available commands'] },
            { label: '/clear', cells: ['New conversation with empty context (aliases `/reset`, `/new`)'] },
            { label: '/compact [instructions]', cells: ['Summarize history to free space, optionally with focus instructions'] },
            { label: '/context', cells: ['Visualize current context usage and get optimisation hints'] },
            { label: '/usage', cells: ['Session cost, plan usage limits (`/cost` is an alias)'] },
            { label: '/resume [session]', cells: ['Resume a conversation by ID or name, or open the picker'] },
            { label: '/rename [name]', cells: ['Name the current session'] },
            { label: '/rewind', cells: ['Rewind conversation and/or code to a previous point (aliases `/checkpoint`, `/undo`)'] },
            { label: '/model [model]', cells: ['Switch model (opens a picker without an argument)'] },
            { label: '/permissions', cells: ['Manage allow, ask and deny rules'] },
            { label: '/config', cells: ['Open settings, or set `key=value` directly'] },
            { label: '/init', cells: ['Create a starter CLAUDE.md'] },
            { label: '/memory', cells: ['Edit CLAUDE.md memory files'] },
            { label: '/exit', cells: ['Quit (alias `/quit`)'] },
          ],
        },
        {
          type: 'callout',
          tone: 'version',
          title: 'Commands change between versions',
          md: 'Some commands are skills, plan dependent or version dependent. Type `/` in your own session to see what you have, and verify at code.claude.com/docs/en/commands.',
        },
        {
          type: 'compare',
          title: 'Keyboard shortcuts worth learning',
          columns: ['Action'],
          rows: [
            { label: 'Ctrl+C', cells: ['Interrupt a running task; with nothing running, first press clears input and a second exits'] },
            { label: 'Ctrl+D', cells: ['Exit (press twice quickly)'] },
            { label: 'Esc', cells: ['Interrupt Claude'] },
            { label: 'Esc Esc', cells: ['Clear draft, or open rewind when input is empty'] },
            { label: 'Shift+Tab', cells: ['Cycle permission modes'] },
            { label: 'Ctrl+O', cells: ['Toggle transcript viewer with detailed tool output'] },
            { label: 'Ctrl+R', cells: ['Reverse search command history'] },
            { label: 'Ctrl+L', cells: ['Redraw the screen'] },
            { label: 'Ctrl+B', cells: ['Run a task in the background'] },
            { label: 'Ctrl+G', cells: ['Edit your prompt in your text editor'] },
            { label: 'Shift+Enter', cells: ['New line (native in several terminals; others need setup)'] },
            { label: 'Alt+P / Option+P', cells: ['Switch model without clearing the prompt'] },
          ],
        },
        {
          type: 'text',
          md: `## Managing context and tokens

[[context-management]] keeps quality up and cost down. Context is resent with every request, so a bloated session is slower and more expensive.

- **\`/context\`** shows what is filling the window
- **\`/compact [focus]\`** summarizes and keeps going; tell it what to keep
- **\`/clear\`** starts fresh for an unrelated task (use \`/rename\` first, then \`/resume\` to return)
- **\`/usage\`** shows session cost and, on subscriptions, plan usage
- Keep [[claude-md]] short, disable unused MCP servers with \`/mcp\`, write specific prompts

Auto-compaction also runs when you approach the limit, but compacting yourself with instructions gives you control.`,
        },
        {
          type: 'workflow',
          title: 'A long task without context bloat',
          steps: [
            {
              id: 'check',
              title: 'Look before you act',
              what: 'Run `/context` to see how full the window is and what is using it.',
              why: 'You cannot fix what you cannot see.',
              ask: '/context',
            },
            {
              id: 'compact',
              title: 'Compact with focus',
              what: 'Summarize history, telling Claude what matters for the next phase.',
              why: 'Generic summaries can drop details you still need.',
              ask: '/compact Keep the failing test names, the decisions about token expiry, and the files changed so far',
            },
            {
              id: 'name',
              title: 'Name before switching',
              what: 'Rename the session so you can come back to it.',
              why: 'Named sessions are easy to find in the `/resume` picker.',
              ask: '/rename token-expiry-fix',
            },
            {
              id: 'clear',
              title: 'Clear for unrelated work',
              what: 'Start a new conversation for a new topic.',
              why: 'Stale context costs tokens on every message and can mislead.',
              ask: '/clear',
            },
          ],
        },
        {
          type: 'exercise',
          exercise: {
            id: 'm2-ex-command-choice',
            kind: 'choose',
            title: 'Pick the right command',
            category: 'command',
            prompt: 'You have been debugging a flaky test for two hours. The conversation is long, you still need the findings, but responses are getting slower and costlier. What do you run?',
            options: [
              { text: '`/clear`', correct: false, why: 'Starts a new conversation with empty context. You would lose the findings you still need.' },
              { text: '`/compact Keep the root cause analysis, the failing test names and files changed`', correct: true, why: 'Summarizes the history to free space while continuing the same conversation, and your instructions steer what is preserved.' },
              { text: '`/resume`', correct: false, why: 'Opens a picker to resume another conversation; it does not shrink this one.' },
              { text: '`/init`', correct: false, why: 'Generates a CLAUDE.md. It does not manage current context.' },
            ],
            explanation: 'Compact to continue with less context; clear to start over. Use `/context` first if you are unsure what is taking space.',
          },
        },
      ],
      quiz: [
        {
          id: 'q1',
          scenario: 'You closed your terminal yesterday mid-task. Today you open the same project folder.',
          q: 'What is the fastest way to continue the same conversation?',
          options: [
            { text: '`claude -c`', why: 'Correct. `--continue` loads the most recent conversation in the current directory.' },
            { text: '`claude auth login`', why: 'That signs you in. It does not restore a conversation.' },
            { text: '`claude update`', why: 'Updates the binary.' },
            { text: 'Retype the whole task in a new session', why: 'Unnecessary and loses prior context.' },
          ],
          answer: 0,
        },
        {
          id: 'q2',
          scenario: 'You have three saved sessions in the repo and want the one named "auth-refactor".',
          q: 'Which command?',
          options: [
            { text: '`claude -c auth-refactor`', why: '`-c` continues the latest conversation; it does not select by name.' },
            { text: '`claude -r "auth-refactor"`', why: 'Correct. `--resume` takes a session ID or name.' },
            { text: '`claude --name auth-refactor --clear`', why: 'Not a valid way to load a saved session.' },
            { text: '`/exit auth-refactor`', why: '`/exit` quits.' },
          ],
          answer: 1,
        },
        {
          id: 'q3',
          scenario: 'You finished the login bug and now need to start an unrelated billing task in the same terminal.',
          q: 'Best context decision?',
          options: [
            { text: 'Keep going in the same conversation', why: 'Login details will ride along in every request, adding cost and noise.' },
            { text: '`/rename` the login session if you may return, then `/clear` and start fresh', why: 'Correct. Clearing between unrelated tasks avoids stale context, and the rename makes the old session easy to resume.' },
            { text: '`/compact` with no instructions', why: 'Keeps a summary of login work that is irrelevant to billing.' },
            { text: 'Restart the computer', why: 'Not needed.' },
          ],
          answer: 1,
        },
        {
          id: 'q4',
          scenario: 'You are not sure why the session feels heavy. You suspect many MCP tools and a big CLAUDE.md.',
          q: 'What do you do first?',
          options: [
            { text: 'Run `/context` to see what is consuming the window', why: 'Correct. It visualizes usage and shows optimisation hints for heavy tools and memory bloat.' },
            { text: 'Run `/init`', why: 'That creates a CLAUDE.md; it would not diagnose.' },
            { text: 'Run `/logout`', why: 'Signing out does not reduce context.' },
            { text: 'Delete `~/.claude`', why: 'Destroys settings and session history; far too drastic.' },
          ],
          answer: 0,
        },
        {
          id: 'q5',
          scenario: 'You typed `Please /clear` and nothing was cleared.',
          q: 'Why?',
          options: [
            { text: 'Claude disagreed', why: 'It is not a judgment call.' },
            { text: 'A slash command is only recognised at the start of the message', why: 'Correct. Text before the slash makes it ordinary prompt text.' },
            { text: '`/clear` was removed', why: '`/clear` exists, with aliases `/reset` and `/new`.' },
            { text: 'You need admin rights', why: 'Not required.' },
          ],
          answer: 1,
        },
        {
          id: 'q6',
          scenario: 'You see "/cost" in an old blog post and wonder if it still works.',
          q: 'What is the right move?',
          options: [
            { text: 'It is gone; use only third party tools', why: 'Not accurate.' },
            { text: 'Check the commands reference: `/cost` is an alias for `/usage` in the current docs; also check `/help` in your version', why: 'Correct. Verify against the current docs and your installed version, since commands evolve.' },
            { text: 'Guess and try random flags', why: 'Unreliable.' },
            { text: 'Assume blog posts are always current', why: 'Docs and versions change.' },
          ],
          answer: 1,
        },
        {
          id: 'q7',
          scenario: 'Claude is halfway through running a long test suite you realize is the wrong one.',
          q: 'Which shortcut stops it?',
          options: [
            { text: '`Ctrl+L`', why: 'Redraws the screen only.' },
            { text: '`Esc` or `Ctrl+C` to interrupt', why: 'Correct. Both interrupt a running operation so you can redirect.' },
            { text: '`Ctrl+O`', why: 'Toggles the transcript viewer.' },
            { text: '`Ctrl+R`', why: 'Searches command history.' },
          ],
          answer: 1,
        },
        {
          id: 'q8',
          scenario: 'Your session summary after `/compact` forgot the constraint "do not change the public API".',
          q: 'How do you prevent that next time?',
          options: [
            { text: 'Never compact', why: 'Then you will hit the limit and costs grow.' },
            { text: 'Pass focus instructions to `/compact`, and put lasting rules in CLAUDE.md', why: 'Correct. Instructions steer the summary, and CLAUDE.md is reloaded rather than relying on summarized chat.' },
            { text: 'Repeat the constraint 20 times', why: 'Wasteful and still fragile.' },
            { text: 'Use `/clear` instead and hope', why: 'Clear drops everything, including the constraint.' },
          ],
          answer: 1,
        },
      ],
    },
  ],
  assignments: [
    {
      id: 'm2-a1',
      title: 'Install, authenticate and run a session on a sample repo',
      brief: 'Set up Claude Code from scratch, run a short real session on a small sample repository, and record every command you used as a personal cheat sheet.',
      steps: [
        'Install Claude Code using the method for your platform and verify with `claude --version` and `claude doctor`.',
        'Clone or create a small sample repo (for example a tiny Node or Python project with a test).',
        '`cd` into it, run `claude`, and authenticate through the browser if prompted. Check `claude auth status`.',
        'Run `/init`, read the CLAUDE.md it proposes, and trim it.',
        'Switch to plan mode with `Shift+Tab`, ask for a small change, review the plan, then approve it.',
        'Run `/context`, then `/compact` with focus instructions, then `/rename` the session and exit.',
        'Resume the session with `claude -r "<name>"` and confirm it continued.',
        'Write down each command and shortcut you used with one line on what it did.',
      ],
      deliverable: 'A text or markdown file listing every command used, in order, with a one line explanation and the permission mode used at each step.',
      checklist: [
        'Installation verified with `claude --version`',
        'Authenticated and confirmed with `claude auth status` or `/status`',
        'Generated and reviewed a CLAUDE.md',
        'Used plan mode before approving an edit',
        'Used `/context` and `/compact` with instructions',
        'Resumed a named session',
        'Command log is complete and accurate',
      ],
      hint: 'If `claude` is not found after installing, open a new terminal window and run `claude doctor`.',
    },
  ],
};
