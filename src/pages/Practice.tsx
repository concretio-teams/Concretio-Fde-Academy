import { useMemo, useState } from 'react';
import { allAssignments, allExercises, assignmentById, finalAssessment, resources } from '../content';
import { ExerciseView } from '../components/Exercises';
import { Quiz, shuffle } from '../components/Quiz';
import { href } from '../lib/router';
import { actions, useProgress } from '../lib/store';
import { Badge, Button, Card, LinkButton, PageHead, Progress, Rich } from '../ui';

const CATS: Record<string, string> = { all: 'All', command: 'Commands', workflow: 'Workflows', prompt: 'Prompts', security: 'Security', approach: 'Approach' };

export function PlaygroundPage() {
  const p = useProgress();
  const [cat, setCat] = useState('all');
  const [sel, setSel] = useState<string | null>(null);
  const list = allExercises.filter((e) => cat === 'all' || e.exercise.category === cat);
  const solved = allExercises.filter((e) => p.exercises[e.exercise.id]?.done).length;
  const cur = allExercises.find((e) => e.exercise.id === sel) ?? list[0];
  return (
    <>
      <PageHead kicker="Playground" title="Hands-on, simulated practice">
        Pick the command, order the workflow, fix the prompt, find the vulnerability. {solved}/{allExercises.length} solved.
      </PageHead>
      <div className="row" style={{ marginBottom: 14 }}>
        {Object.entries(CATS).map(([k, v]) => (
          <button key={k} className={`step ${cat === k ? 'on' : ''}`} onClick={() => { setCat(k); setSel(null); }}>{v}</button>
        ))}
      </div>
      {list.length === 0 ? <p className="muted">No exercises in this category yet.</p> : (
        <div className="grid" style={{ gridTemplateColumns: 'minmax(220px, 300px) 1fr', alignItems: 'start' }}>
          <div className="stack" style={{ gap: 6 }}>
            {list.map((e) => (
              <button key={e.exercise.id} className={`opt ${cur?.exercise.id === e.exercise.id ? 'sel' : ''}`} style={{ margin: 0 }} onClick={() => setSel(e.exercise.id)}>
                {p.exercises[e.exercise.id]?.done ? '✓ ' : ''}{e.exercise.title}
                <div className="small muted">Module {e.module.number}</div>
              </button>
            ))}
          </div>
          <div>{cur && <ExerciseView key={cur.exercise.id} ex={cur.exercise} />}</div>
        </div>
      )}
    </>
  );
}

export function AssignmentsPage({ id }: { id?: string }) {
  const p = useProgress();
  const f = id ? assignmentById(id) : undefined;
  if (id && !f) return <PageHead title="Assignment not found" />;
  if (f) {
    const { assignment: a, module: m } = f;
    const st = p.assignments[a.id] ?? { checked: [], done: false, notes: '' };
    const all = st.checked.length === a.checklist.length;
    return (
      <>
        <div className="small muted"><a href={href('assignments')}>Assignments</a> / Module {m.number}</div>
        <PageHead kicker="Practical assignment" title={a.title} />
        <Card><Rich md={a.brief} /></Card>
        <div className="block"><h3>Steps</h3><Rich md={a.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')} /></div>
        <div className="callout info"><div className="ct">Deliverable</div>{a.deliverable}</div>
        {a.hint && <details className="block"><summary><b>Need a hint?</b></summary><Rich md={a.hint} /></details>}
        <div className="block card">
          <h3>Self-assessment</h3>
          <p className="muted small">Tick each criterion only when you can honestly show it in your work.</p>
          {a.checklist.map((c, i) => (
            <label key={i} className="checkrow">
              <input type="checkbox" checked={st.checked.includes(i)} onChange={() => actions.toggleCheck(a.id, i)} />
              <span>{c}</span>
            </label>
          ))}
          <h3 style={{ marginTop: 14 }}>Your notes</h3>
          <textarea value={st.notes} placeholder="Paste your prompts, commands, learnings or a link to your repo..." onChange={(e) => actions.setNotes(a.id, e.target.value)} />
          <div className="row" style={{ marginTop: 12 }}>
            {st.done
              ? <><Badge tone="ok">Completed</Badge><Button onClick={() => actions.completeAssignment(a.id, a.title, false)}>Reopen</Button></>
              : <Button variant="primary" disabled={!all} onClick={() => actions.completeAssignment(a.id, a.title, true)}>Mark assignment complete</Button>}
            {!all && <span className="small muted">{st.checked.length}/{a.checklist.length} criteria ticked</span>}
          </div>
        </div>
      </>
    );
  }
  const done = allAssignments.filter((x) => p.assignments[x.assignment.id]?.done).length;
  return (
    <>
      <PageHead kicker="Assignments" title="Build real things">Small, practical challenges after each module. {done}/{allAssignments.length} complete.</PageHead>
      <div className="grid c2">
        {allAssignments.map(({ assignment: a, module: m }) => {
          const st = p.assignments[a.id];
          return (
            <Card key={a.id} onClick={() => { window.location.hash = href('assignments', a.id); }}>
              <div className="row spread"><span className="kicker">Module {m.number}</span>{st?.done ? <Badge tone="ok">Done</Badge> : st?.checked.length ? <Badge tone="warn">In progress</Badge> : <Badge>Not started</Badge>}</div>
              <h3>{a.title}</h3>
              <div className="small muted">{a.deliverable}</div>
              <div style={{ marginTop: 8 }}><Progress value={st ? Math.round((st.checked.length / a.checklist.length) * 100) : 0} /></div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

export function ResourcesPage() {
  const total = resources.reduce((a, r) => a + r.minutes, 0);
  return (
    <>
      <PageHead kicker="Resources" title="A short, curated list">
        {resources.length} free resources, about {Math.round(total / 6) / 10} hours in total. The academy teaches; these supplement it.
      </PageHead>
      {resources.length === 0 && <p className="muted">Resources are being verified.</p>}
      <div className="grid c2">
        {resources.map((r) => (
          <Card key={r.id}>
            <div className="row spread"><Badge tone="accent">{r.type}</Badge><span className="small muted">~{r.minutes} min, free</span></div>
            <h3 style={{ marginTop: 8 }}>{r.title}</h3>
            <p>{r.learn}</p>
            <div className="small muted" style={{ marginBottom: 10 }}>Supports: {r.modules.map((x) => x.toUpperCase()).join(', ')}. Link checked {r.verified}.</div>
            <a className="btn primary" href={r.url} target="_blank" rel="noreferrer">Open resource</a>
          </Card>
        ))}
      </div>
    </>
  );
}

export function FinalPage() {
  const p = useProgress();
  const fa = finalAssessment;
  const [started, setStarted] = useState(false);
  const qs = useMemo(() => (fa ? shuffle(fa.questions).slice(0, fa.questions.length) : []), [fa, started]);
  if (!fa) return <PageHead title="Final assessment" kicker="Final">The final assessment is being prepared.</PageHead>;
  const fin = p.final;
  const practicalDone = fa.practical.every((t) => (p.finalPractical[t.id]?.length ?? 0) === t.criteria.length);
  const theoryPassed = !!fin?.passed;
  const certified = theoryPassed && practicalDone;
  return (
    <>
      <PageHead kicker="Final assessment" title="Show you can do it">
        Part 1 is a {fa.questions.length}-question scenario exam (pass mark {fa.passMark}%). Part 2 is three practical tasks you complete in a real repository and self-certify.
      </PageHead>
      {certified && (
        <div className="hero" style={{ marginBottom: 18 }}>
          <div className="kicker">Certified</div>
          <h2>Claude Code Academy complete</h2>
          <p>Theory {fin ? Math.round((fin.score / fin.total) * 100) : 0}% and all practical tasks done. You are ready to use Claude Code on client work.</p>
        </div>
      )}
      <h2>Part 1: Theory exam {theoryPassed && <Badge tone="ok">Passed</Badge>}</h2>
      {fin && <p className="muted small">Last attempt: {fin.score}/{fin.total} ({Math.round((fin.score / fin.total) * 100)}%), {fin.attempts} attempt(s).</p>}
      {!started ? (
        <Button variant="primary" onClick={() => setStarted(true)}>{fin ? 'Retake exam' : 'Start exam'}</Button>
      ) : (
        <Quiz key={String(started)} questions={qs} mode="exam" passPct={fa.passMark} onFinish={(s, t) => actions.saveFinal(s, t, fa.passMark)} />
      )}
      <h2 style={{ marginTop: 32 }}>Part 2: Practical tasks {practicalDone && <Badge tone="ok">Done</Badge>}</h2>
      <div className="stack">
        {fa.practical.map((t) => {
          const ticks = p.finalPractical[t.id] ?? [];
          return (
            <div key={t.id} className="card">
              <h3>{t.title}</h3>
              <Rich md={t.brief} />
              <div className="small muted">Tick each criterion when your work meets it:</div>
              {t.criteria.map((c, i) => (
                <label key={i} className="checkrow">
                  <input type="checkbox" checked={ticks.includes(i)} onChange={() => actions.togglePractical(t.id, i)} /><span>{c}</span>
                </label>
              ))}
            </div>
          );
        })}
      </div>
      <div className="row" style={{ marginTop: 18 }}><LinkButton href={href('progress')}>View my progress</LinkButton></div>
    </>
  );
}
