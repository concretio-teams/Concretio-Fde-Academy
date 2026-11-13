import { useState } from 'react';
import { Rich } from '../ui';

// Interactive, simplified illustration of the Claude Code terminal interface.
// Exact visuals vary by version and terminal; the concepts below are stable.
const REGIONS: Record<string, { title: string; what: string; tip: string }> = {
  banner: {
    title: 'Session header',
    what: 'Shows the Claude Code version, the active model, and the working directory. Claude can read and edit files **inside this directory** (and its subfolders) by default, so where you launch `claude` matters.',
    tip: 'Start Claude Code from your project root, not your home folder.',
  },
  convo: {
    title: 'Conversation area',
    what: 'Your prompts and Claude\'s replies. Claude\'s turns can include text, **tool calls** (read a file, edit, run a command, search) and their results. Everything here counts toward the **context window**.',
    tip: 'Press Esc to interrupt Claude mid-task. Long conversations consume context; use `/clear` between unrelated tasks and `/compact` to summarise.',
  },
  perm: {
    title: 'Permission prompt',
    what: 'Before Claude edits a file or runs a command that is not already allowed, it asks. You can approve once, approve for the session, or decline and tell Claude what to do differently.',
    tip: 'Read the proposed diff or command before approving. Use `/permissions` to see and manage allow and deny rules.',
  },
  input: {
    title: 'Input box',
    what: 'Where you type prompts. Special entry points: `/` opens slash commands, `@` references files and folders, and `!` at the start runs a shell command directly. Multi-line input is supported.',
    tip: 'Reference files explicitly with `@path/to/file` to give Claude exactly the right context.',
  },
  mode: {
    title: 'Permission mode indicator',
    what: 'The line under the input shows the current mode and hints. Press **Shift+Tab** to cycle modes, for example normal (ask first), auto-accept edits, and plan mode (read-only planning). The exact set of modes depends on your version.',
    tip: 'Use plan mode when you want Claude to investigate and propose before touching any file.',
  },
  status: {
    title: 'Status line',
    what: 'An optional, configurable bar that can show things like the model, directory, git branch, or context usage. It is driven by a command you configure, so it looks different on every machine.',
    tip: 'Configure it with `/statusline` or in settings if you want live context and branch information.',
  },
};

const SLASH: [string, string][] = [
  ['/help', 'List available commands'],
  ['/init', 'Generate a starter CLAUDE.md for the project'],
  ['/clear', 'Start fresh, clearing the conversation context'],
  ['/compact', 'Summarise the conversation to free up context'],
  ['/context', 'Visualise what is using your context window'],
  ['/resume', 'Pick up a previous session'],
  ['/model', 'Switch the model'],
  ['/permissions', 'View and edit permission rules'],
  ['/mcp', 'Manage MCP server connections'],
];

export function ClaudeUi() {
  const [sel, setSel] = useState<string>('banner');
  const [slash, setSlash] = useState(false);
  const R = (k: string, children: React.ReactNode) => (
    <button className={`termreg ${sel === k ? 'on' : ''}`} onClick={() => setSel(k)} aria-label={REGIONS[k].title}>{children}</button>
  );
  const info = REGIONS[sel];
  return (
    <div className="block">
      <div className="block-title">The Claude Code interface <span className="badge accent">click any area</span></div>
      <div className="term">
        <div className="tbar"><i className="dot" /><i className="dot" /><i className="dot" /><span style={{ marginLeft: 8 }}>~/projects/shop-api $ claude</span></div>
        <div style={{ padding: 10 }}>
          {R('banner', <><span className="org">* Claude Code</span> <span className="dim">v2.x</span><br /><span className="dim">model: Sonnet   cwd: ~/projects/shop-api</span></>)}
          {R('convo', <>
            <span className="dim">&gt;</span> add input validation to POST /orders<br />
            <span className="org">*</span> I will read the route and its tests first.<br />
            <span className="dim">  Read(src/routes/orders.ts)</span><br />
            <span className="dim">  Read(src/routes/orders.test.ts)</span>
          </>)}
          {R('perm', <>
            <span className="tag">Edit src/routes/orders.ts</span><br />
            <span className="grn">+ const schema = z.object({'{'} items: z.array(...) {'}'})</span><br />
            Do you want to make this edit?<br />
            <span className="dim">  1. Yes   2. Yes, allow all edits this session   3. No</span>
          </>)}
          {R('input', <div className="inputbox"><span className="dim">&gt; </span>{slash ? '/' : <span className="dim">Try "fix the failing test in @src/orders.test.ts"</span>}</div>)}
          {R('mode', <span className="dim">? for shortcuts   |   shift+tab to cycle modes   |   esc to interrupt</span>)}
          {R('status', <span className="dim">shop-api | main | Sonnet | context 34%</span>)}
        </div>
      </div>
      <div className="row" style={{ margin: '10px 0' }}>
        <button className="btn sm" onClick={() => setSlash((s) => !s)}>{slash ? 'Hide' : 'Show'} slash command menu</button>
      </div>
      {slash && (
        <div className="tablewrap" style={{ marginBottom: 10 }}>
          <table><tbody>{SLASH.map(([c, d]) => <tr key={c}><td><code>{c}</code></td><td>{d}</td></tr>)}</tbody></table>
        </div>
      )}
      <div className="detail">
        <h4>{info.title}</h4>
        <Rich md={info.what} />
        <div className="lbl">Pro tip</div>
        <Rich md={info.tip} />
      </div>
      <p className="muted small" style={{ marginTop: 6 }}>Illustration only. Exact layout, prompts and available commands vary by Claude Code version; run `/help` in your install to see yours.</p>
    </div>
  );
}
