import { useMemo, useState } from 'react';
import type { Exercise } from '../content/types';
import { actions, useProgress } from '../lib/store';
import { Badge, Button, Rich } from '../ui';
import { shuffle } from './Quiz';

const CAT: Record<string, string> = {
  command: 'Pick the command', workflow: 'Order the workflow', prompt: 'Prompt clinic',
  security: 'Security review', approach: 'Choose the approach',
};

export function ExerciseView({ ex }: { ex: Exercise }) {
  const prog = useProgress();
  const done = prog.exercises[ex.id]?.done;
  return (
    <div className="card block" style={{ margin: '18px 0' }}>
      <div className="row spread">
        <span className="kicker">{CAT[ex.category] ?? 'Exercise'}</span>
        {done ? <Badge tone="ok">Solved</Badge> : <Badge>Interactive</Badge>}
      </div>
      <h3>{ex.title}</h3>
      <Rich md={ex.prompt} />
      {ex.kind === 'choose' && <Choose ex={ex} />}
      {ex.kind === 'order' && <Order ex={ex} />}
      {ex.kind === 'flaws' && <Flaws ex={ex} />}
      {ex.kind === 'spot' && <Spot ex={ex} />}
    </div>
  );
}

function Result({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <div className={`feedback ${ok ? 'ok' : 'bad'}`}>{children}</div>;
}

function Choose({ ex }: { ex: Extract<Exercise, { kind: 'choose' }> }) {
  const order = useMemo(() => shuffle(ex.options.map((_, i) => i)), [ex.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [sel, setSel] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const check = () => {
    if (sel === null) return;
    setShown(true);
    actions.recordExercise(ex.id, ex.title, ex.options[sel].correct);
  };
  const ok = sel !== null && ex.options[sel].correct;
  return (
    <div>
      {order.map((i) => {
        const o = ex.options[i];
        const cls = shown ? (o.correct ? 'right' : i === sel ? 'wrong' : '') : i === sel ? 'sel' : '';
        return (
          <button key={i} className={`opt ${cls}`} disabled={shown} onClick={() => setSel(i)}>
            <Rich md={o.text} />
            {shown && (o.correct || i === sel) && <div className="why"><Rich md={o.why} /></div>}
          </button>
        );
      })}
      <div className="row">
        {!shown ? <Button variant="primary" onClick={check} disabled={sel === null}>Check answer</Button>
          : <Button onClick={() => { setShown(false); setSel(null); }}>{ok ? 'Try again' : 'Retry'}</Button>}
      </div>
      {shown && ex.explanation && <Result ok={!!ok}><Rich md={ex.explanation} /></Result>}
    </div>
  );
}

function Order({ ex }: { ex: Extract<Exercise, { kind: 'order' }> }) {
  const init = () => {
    let s = shuffle(ex.items.map((_, i) => i));
    if (ex.items.length > 1 && s.every((v, i) => v === i)) s = [...s.slice(1), s[0]];
    return s;
  };
  const [list, setList] = useState<number[]>(init);
  const [shown, setShown] = useState(false);
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const n = [...list]; [n[i], n[j]] = [n[j], n[i]]; setList(n); setShown(false);
  };
  const correct = list.every((v, i) => v === i);
  return (
    <div>
      {list.map((v, i) => (
        <div key={v} className={`orderitem ${shown ? (v === i ? 'right' : 'wrong') : ''}`}>
          <b>{i + 1}.</b><span className="txt">{ex.items[v]}</span>
          <Button size="sm" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>Up</Button>
          <Button size="sm" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === list.length - 1}>Down</Button>
        </div>
      ))}
      <div className="row">
        <Button variant="primary" onClick={() => { setShown(true); actions.recordExercise(ex.id, ex.title, correct); }}>Check order</Button>
        <Button onClick={() => { setList(init()); setShown(false); }}>Shuffle</Button>
      </div>
      {shown && (
        <Result ok={correct}>
          {correct ? <b>Correct order.</b> : <b>Not yet. Green items are in the right place.</b>}
          {(correct || true) && ex.explanation && <Rich md={ex.explanation} />}
          {!correct && <details><summary>Show correct order</summary><ol>{ex.items.map((t) => <li key={t}>{t}</li>)}</ol></details>}
        </Result>
      )}
    </div>
  );
}

function Flaws({ ex }: { ex: Extract<Exercise, { kind: 'flaws' }> }) {
  const [sel, setSel] = useState<number[]>([]);
  const [shown, setShown] = useState(false);
  const toggle = (i: number) => { if (!shown) setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i])); };
  const ok = ex.flaws.every((f, i) => f.real === sel.includes(i));
  return (
    <div>
      <div className="pbox bad" style={{ margin: '10px 0' }}>{ex.subject}</div>
      <div className="small muted">Tick every real problem:</div>
      {ex.flaws.map((f, i) => {
        const picked = sel.includes(i);
        const cls = shown ? (f.real === picked ? 'right' : 'wrong') : picked ? 'sel' : '';
        return (
          <button key={i} className={`opt ${cls}`} onClick={() => toggle(i)} disabled={shown}>
            <input type="checkbox" readOnly checked={picked} style={{ marginRight: 8 }} />
            <Rich md={f.text} />
            {shown && <div className="why"><b>{f.real ? 'Real problem. ' : 'Not a problem here. '}</b><Rich md={f.why} /></div>}
          </button>
        );
      })}
      <div className="row">
        {!shown ? <Button variant="primary" onClick={() => { setShown(true); actions.recordExercise(ex.id, ex.title, ok); }}>Check</Button>
          : <Button onClick={() => { setShown(false); setSel([]); }}>Retry</Button>}
      </div>
      {shown && (
        <Result ok={ok}>
          <b>{ok ? 'You spotted them all.' : 'Some selections were off. See the notes above.'}</b>
          {ex.improved && <><div className="small" style={{ marginTop: 6 }}><b>Improved version:</b></div><div className="pbox good">{ex.improved}</div></>}
          {ex.explanation && <Rich md={ex.explanation} />}
        </Result>
      )}
    </div>
  );
}

function Spot({ ex }: { ex: Extract<Exercise, { kind: 'spot' }> }) {
  const [sel, setSel] = useState<number[]>([]);
  const [shown, setShown] = useState(false);
  const issueLines = ex.issues.map((i) => i.line);
  const found = issueLines.filter((l) => sel.includes(l));
  const wrong = sel.filter((l) => !issueLines.includes(l));
  const ok = found.length === issueLines.length && wrong.length === 0;
  const toggle = (n: number) => { if (!shown) setSel((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n])); };
  return (
    <div>
      <div className="small muted" style={{ margin: '6px 0' }}>Click every line you think is a vulnerability or flaw. There are {ex.issues.length} issues.</div>
      <div className="code"><div className="bar"><span>{ex.lang}</span><span>{sel.length} selected</span></div>
        <div style={{ padding: 8 }}>
          {ex.lines.map((t, i) => {
            const n = i + 1;
            const cls = shown ? (issueLines.includes(n) ? (sel.includes(n) ? 'hit' : 'miss') : sel.includes(n) ? 'miss' : '') : sel.includes(n) ? 'sel' : '';
            return <button key={n} className={`codeline ${cls}`} onClick={() => toggle(n)}><span className="n">{n}</span><span>{t || ' '}</span></button>;
          })}
        </div>
      </div>
      <div className="row" style={{ marginTop: 10 }}>
        {!shown ? <Button variant="primary" onClick={() => { setShown(true); actions.recordExercise(ex.id, ex.title, ok); }} disabled={sel.length === 0}>Check my findings</Button>
          : <Button onClick={() => { setShown(false); setSel([]); }}>Retry</Button>}
      </div>
      {shown && (
        <Result ok={ok}>
          <b>Found {found.length} of {issueLines.length}{wrong.length ? `, ${wrong.length} false positive(s) (red lines that are not issues)` : ''}.</b>
          {ex.issues.map((i) => (
            <div key={i.line} style={{ marginTop: 8 }}>
              <b>Line {i.line}: {i.title}</b> {sel.includes(i.line) ? '(found)' : '(missed)'}
              <Rich md={i.why} /><div className="small"><b>Fix:</b> <Rich md={i.fix} /></div>
            </div>
          ))}
          {ex.explanation && <Rich md={ex.explanation} />}
        </Result>
      )}
    </div>
  );
}
