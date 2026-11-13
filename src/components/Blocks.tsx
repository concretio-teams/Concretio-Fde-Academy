import { useState } from 'react';
import type { Block, ScenarioBlock } from '../content/types';
import { Badge, CodeBox, CopyButton, Rich, Tabs } from '../ui';
import { ClaudeUi } from './ClaudeUi';
import { Diagram } from './Diagram';
import { ExerciseView } from './Exercises';

export function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'text': return <div className="block"><Rich md={block.md} /></div>;
    case 'callout':
      return (
        <div className="block"><div className={`callout ${block.tone}`}>
          <div className="ct">{block.title ?? { info: 'Note', tip: 'Tip', warn: 'Watch out', version: 'Version or plan dependent' }[block.tone]}</div>
          <Rich md={block.md} />
        </div></div>
      );
    case 'code': return <div className="block"><CodeBox code={block.code} lang={block.lang} title={block.title} />{block.note && <div className="small muted" style={{ marginTop: 6 }}><Rich md={block.note} /></div>}</div>;
    case 'diagram': return <Diagram block={block} />;
    case 'compare':
      return (
        <div className="block">
          <div className="block-title">{block.title}</div>
          <div className="tablewrap"><table>
            <thead><tr><th />{block.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
            <tbody>{block.rows.map((r) => <tr key={r.label}><td>{r.label}</td>{r.cells.map((c, i) => <td key={i}><Rich md={c} /></td>)}</tr>)}</tbody>
          </table></div>
        </div>
      );
    case 'workflow': return <Workflow block={block} />;
    case 'promptCompare':
      return (
        <div className="block">
          <div className="block-title">{block.title}</div>
          <div className="cmp">
            <div><Badge tone="warn">Weak prompt</Badge><div className="pbox bad" style={{ marginTop: 6 }}>{block.bad}</div></div>
            <div><Badge tone="ok">Strong prompt</Badge><div className="pbox good" style={{ marginTop: 6 }}>{block.good}</div></div>
          </div>
          <div className="detail"><h4>Why the second one works</h4><Rich md={block.why.map((w) => '- ' + w).join('\n')} /></div>
        </div>
      );
    case 'promptBuilder': return <PromptBuilder block={block} />;
    case 'video':
      return (
        <div className="block"><div className="card row spread">
          <div style={{ flex: 1, minWidth: 220 }}>
            <span className="kicker">Recommended watch</span>
            <h3 style={{ margin: '2px 0' }}>{block.title}</h3>
            <Rich md={block.blurb} />
            <span className="small muted">About {block.minutes} min</span>
          </div>
          <a className="btn primary" href={block.url} target="_blank" rel="noreferrer">Open</a>
        </div></div>
      );
    case 'tabs': return <div className="block"><Tabs tabs={block.tabs.map((t) => ({ label: t.label, content: <Rich md={t.md} /> }))} /></div>;
    case 'mindmap': return <Mindmap block={block} />;
    case 'exercise': return <ExerciseView ex={block.exercise} />;
    case 'scenario': return <Scenario block={block} />;
    case 'claudeUi': return <ClaudeUi />;
    default: return null;
  }
}

function Workflow({ block }: { block: Extract<Block, { type: 'workflow' }> }) {
  const [i, setI] = useState(0);
  const [seen, setSeen] = useState<number[]>([0]);
  const s = block.steps[i];
  return (
    <div className="block">
      <div className="block-title">{block.title} <span className="badge accent">click each step</span></div>
      <div className="steps">
        {block.steps.map((st, k) => (
          <span key={st.id} className="row" style={{ gap: 6 }}>
            <button className={`step ${k === i ? 'on' : seen.includes(k) ? 'seen' : ''}`} onClick={() => { setI(k); setSeen((x) => (x.includes(k) ? x : [...x, k])); }}>{k + 1}. {st.title}</button>
            {k < block.steps.length - 1 && <span className="arrow">→</span>}
          </span>
        ))}
      </div>
      <div className="detail">
        <h4>{s.title}</h4>
        <div className="lbl">What happens</div><Rich md={s.what} />
        <div className="lbl">Why it matters</div><Rich md={s.why} />
        <div className="lbl">What to ask Claude</div>
        <div className="code" style={{ marginTop: 4 }}><div className="bar"><span>prompt</span><CopyButton text={s.ask} /></div><pre>{s.ask}</pre></div>
      </div>
      <div className="small muted" style={{ marginTop: 6 }}>Explored {seen.length} of {block.steps.length} steps</div>
    </div>
  );
}

function PromptBuilder({ block }: { block: Extract<Block, { type: 'promptBuilder' }> }) {
  const [v, setV] = useState<Record<string, string>>({});
  const filled = block.fields.filter((f) => v[f.key]?.trim()).length;
  const prompt = block.fields.filter((f) => v[f.key]?.trim()).map((f) => `${f.label}: ${v[f.key].trim()}`).join('\n\n');
  return (
    <div className="block card">
      <div className="block-title">{block.title}</div>
      <div className="scn"><Rich md={block.scenario} /></div>
      <div className="stack">
        {block.fields.map((f) => (
          <label key={f.key}>
            <b>{f.label}</b> <span className="muted small">{f.hint}</span>
            <textarea value={v[f.key] ?? ''} placeholder={f.example} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
          </label>
        ))}
      </div>
      <div className="row" style={{ margin: '10px 0' }}>
        <button className="btn sm" onClick={() => setV(Object.fromEntries(block.fields.map((f) => [f.key, f.example])))}>Fill with example</button>
        <button className="btn sm" onClick={() => setV({})}>Clear</button>
        <span className="small muted">{filled}/{block.fields.length} sections filled</span>
      </div>
      {prompt ? (
        <div className="code"><div className="bar"><span>assembled prompt</span><CopyButton text={prompt} /></div><pre style={{ whiteSpace: 'pre-wrap' }}>{prompt}</pre></div>
      ) : <p className="muted small">Fill in the sections to see your prompt assembled here.</p>}
      {filled === block.fields.length && <div className="feedback ok small">All sections covered. This prompt gives Claude context, a clear task, constraints and a way to verify success.</div>}
    </div>
  );
}

function Mindmap({ block }: { block: Extract<Block, { type: 'mindmap' }> }) {
  const [b, setB] = useState(0);
  const [it, setIt] = useState<number | null>(null);
  const br = block.branches[b];
  return (
    <div className="block">
      <div className="block-title">{block.center} <span className="badge accent">explore the map</span></div>
      <div className="grid c3" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="kicker">Branches</div>
          {block.branches.map((x, k) => (
            <button key={x.label} className={`opt ${k === b ? 'sel' : ''}`} onClick={() => { setB(k); setIt(null); }}>{x.label}</button>
          ))}
        </div>
        <div className="card">
          <div className="kicker">{br.label}</div>
          {br.items.map((x, k) => (
            <button key={x.label} className={`opt ${k === it ? 'sel' : ''}`} onClick={() => setIt(k)}>{x.label}</button>
          ))}
        </div>
        <div className="card">
          {it === null ? <p className="muted">Pick an item to read the detail.</p> : <><h4>{br.items[it].label}</h4><Rich md={br.items[it].detail} /></>}
        </div>
      </div>
    </div>
  );
}

function Scenario({ block }: { block: ScenarioBlock }) {
  const [ticks, setTicks] = useState<number[]>([]);
  return (
    <div className="block card">
      <span className="kicker">Real-world scenario</span>
      <h3>{block.title}</h3>
      <Tabs tabs={[
        { label: 'Problem', content: <Rich md={block.problem} /> },
        { label: 'Context', content: <><div className="small muted">Gather this before you prompt:</div><Rich md={block.context.map((c) => '- ' + c).join('\n')} /></> },
        { label: 'Prompt', content: <div className="code"><div className="bar"><span>suggested prompt</span><CopyButton text={block.prompt} /></div><pre style={{ whiteSpace: 'pre-wrap' }}>{block.prompt}</pre></div> },
        { label: 'Approach', content: <Rich md={block.approach.map((a, i) => `${i + 1}. ${a}`).join('\n')} /> },
        { label: 'Mistakes', content: <Rich md={block.mistakes.map((m) => '- ' + m).join('\n')} /> },
        {
          label: `Checklist ${ticks.length}/${block.checklist.length}`,
          content: (
            <div>
              {block.checklist.map((c, i) => (
                <label key={i} className="checkrow">
                  <input type="checkbox" checked={ticks.includes(i)} onChange={() => setTicks((t) => (t.includes(i) ? t.filter((x) => x !== i) : [...t, i]))} />
                  <span><Rich md={c} /></span>
                </label>
              ))}
              {ticks.length === block.checklist.length && <div className="feedback ok small">Validation complete. Only then is the change ready for review.</div>}
            </div>
          ),
        },
      ]} />
    </div>
  );
}
