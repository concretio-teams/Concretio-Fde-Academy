import { useEffect, useMemo, useRef, useState } from 'react';
import { allAssignments, allExercises, assignmentById, finalAssessment, finalSalesforce, lessonById, moduleById, modules, resources as allResources } from '../content';
import { ResourceItem } from '../components/GoDeeper';
import { ExerciseView } from '../components/Exercises';
import { Quiz, shuffle } from '../components/Quiz';
import { finalLastModule } from '../lib/plan';
import { href } from '../lib/router';
import { requiredSfItems } from '../lib/sfPath';
import { actions, useProgress } from '../lib/store';
import { Badge, Button, Card, CopyButton, LinkButton, PageHead, Progress, Rich } from '../ui';

const CATS: Record<string, string> = { all: 'All', command: 'Commands', workflow: 'Workflows', prompt: 'Prompts', security: 'Security', approach: 'Approach' };

export function PlaygroundPage({ id }: { id?: string }) {
  const p = useProgress();
  const [cat, setCat] = useState('all');
  const [sel, setSel] = useState<string | null>(id ?? null);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);
  useEffect(() => { if (id) { setSel(id); setCat("all"); } }, [id]);
  const list = allExercises.filter((e) => cat === 'all' || e.exercise.category === cat);
  const solved = allExercises.filter((e) => p.exercises[e.exercise.id]?.done).length;
  const cur = allExercises.find((e) => e.exercise.id === sel) ?? list[0];
  const curId = cur?.exercise.id;
  const groups = modules.map((m) => ({ m, items: list.filter((e) => e.module.id === m.id) })).filter((g) => g.items.length > 0);
  // The list scrolls on its own, so after picking an exercise bring the exercise itself into view.
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    const el = panelRef.current;
    if (el && (el.getBoundingClientRect().top < 0 || window.innerWidth <= 860)) el.scrollIntoView({ block: 'start' });
  }, [curId]);
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
        <div className="grid playgrid">
          <div className="pglist" aria-label="Exercises by module">
            {groups.map((g) => (
              <div key={g.m.id} className="pgroup">
                <div className="pghead">Module {g.m.number}: {g.m.title}</div>
                {g.items.map((e) => (
                  <button key={e.exercise.id} className={`opt pgitem ${curId === e.exercise.id ? 'sel' : ''}`} onClick={() => setSel(e.exercise.id)} aria-current={curId === e.exercise.id ? 'true' : undefined}>
                    {p.exercises[e.exercise.id]?.done ? '✓ ' : ''}{e.exercise.title}
                    <div className="small muted">{CATS[e.exercise.category] ?? e.exercise.category}</div>
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div ref={panelRef} className="pgpanel">{cur && <ExerciseView key={cur.exercise.id} ex={cur.exercise} />}</div>
        </div>
      )}
    </>
  );
}

const REPO_URL = 'https://github.com/concretio-teams/Concretio-Fde-Academy';
const MIN_EVIDENCE = 20; // characters of notes or a link needed before an assignment can be marked complete

function mentorSummary(a: { title: string; checklist: string[] }, moduleNo: number, st: { checked: number[]; done: boolean; notes: string }): string {
  const ticked = a.checklist.filter((_, i) => st.checked.includes(i));
  const open = a.checklist.filter((_, i) => !st.checked.includes(i));
  return [
    `Assignment: ${a.title} (Module ${moduleNo})`,
    `Status: ${st.done ? 'marked complete' : 'in progress'}, ${ticked.length}/${a.checklist.length} criteria ticked`,
    '',
    'Criteria I can show:',
    ...(ticked.length ? ticked.map((c) => `- ${c}`) : ['- none yet']),
    '',
    'Criteria still open:',
    ...(open.length ? open.map((c) => `- ${c}`) : ['- none']),
    '',
    'My notes and links:',
    st.notes.trim() || '(nothing added)',
  ].join(String.fromCharCode(10));
}

export function AssignmentsPage({ id }: { id?: string }) {
  const p = useProgress();
  const f = id ? assignmentById(id) : undefined;
  if (id && !f) return <PageHead title="Assignment not found" />;
  if (f) {
    const { assignment: a, module: m } = f;
    const st = p.assignments[a.id] ?? { checked: [], done: false, notes: '' };
    const all = st.checked.length === a.checklist.length;
    const hasEvidence = st.notes.trim().length >= MIN_EVIDENCE;
    return (
      <>
        <div className="small muted"><a href={href('assignments')}>Assignments</a> / Module {m.number}</div>
        <PageHead kicker="Practical assignment" title={a.title} />
        <div className="row" style={{ marginBottom: 12 }}>
          {a.minutes && <Badge>About {a.minutes} min</Badge>}
          <Badge tone="accent">Module {m.number}: {m.title}</Badge>
        </div>
        {a.starter && (
          <div className="callout tip" style={{ marginBottom: 12 }}>
            <div className="ct">Starter project provided</div>
            <p style={{ margin: '4px 0' }}>Open the <a href={`${REPO_URL}/tree/main/${a.starter}`} target="_blank" rel="noreferrer"><code>{a.starter}</code> folder on GitHub</a>. Copy it out of the repo before you start, and read its README first.</p>
            <p className="small muted" style={{ margin: 0 }}>To get it: <code>git clone {REPO_URL}.git</code>, then copy the folder somewhere of your own. It needs Node 18 or newer and has no packages to install.</p>
          </div>
        )}
        <Card><Rich md={a.brief} /></Card>
        <div className="block"><h3>Steps</h3><Rich md={a.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')} /></div>
        {a.example && <details className="block"><summary><b>See an example of a good result</b></summary><Rich md={a.example} /></details>}
        <div className="callout info"><div className="ct">Deliverable</div>{a.deliverable}</div>
        {a.hint && <details className="block"><summary><b>Need a hint?</b></summary><Rich md={a.hint} /></details>}
        <div className="block card">
          <h3>Self-assessment</h3>
          <p className="muted small">Tick each criterion only when you can honestly show it in your work. To finish, paste your deliverable or a link to it in the notes below. That is the evidence a mentor reads.</p>
          {a.checklist.map((c, i) => (
            <label key={i} className="checkrow">
              <input type="checkbox" checked={st.checked.includes(i)} onChange={() => actions.toggleCheck(a.id, i)} />
              <span>{c}</span>
            </label>
          ))}
          <h3 style={{ marginTop: 14 }}>Your notes</h3>
          <textarea value={st.notes} placeholder="Paste your deliverable, or a link to it (repo, document, gist). Add the prompts you used and what you learned." onChange={(e) => actions.setNotes(a.id, e.target.value)} />
          <div className="row" style={{ marginTop: 12 }}>
            {st.done
              ? <><Badge tone="ok">Completed</Badge><Button onClick={() => actions.completeAssignment(a.id, a.title, false)}>Reopen</Button></>
              : <Button variant="primary" disabled={!all || !hasEvidence} onClick={() => actions.completeAssignment(a.id, a.title, true)}>Mark assignment complete</Button>}
            {!st.done && !all && <span className="small muted">{st.checked.length}/{a.checklist.length} criteria ticked</span>}
            {!st.done && all && !hasEvidence && <span className="small muted">Add your deliverable or a link in the notes to finish</span>}
            <CopyButton className="btn sm" text={mentorSummary(a, m.number, st)} label="Copy summary for your mentor" />
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
              <div className="small muted">{a.minutes ? `About ${a.minutes} min. ` : ''}{a.deliverable}</div>
              <div style={{ marginTop: 8 }}><Progress value={st ? Math.round((st.checked.length / a.checklist.length) * 100) : 0} /></div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

const LEVEL_OF: Record<string, string> = { Foundation: 'Beginner', Core: 'Intermediate', Advanced: 'Advanced', Professional: 'Advanced' };
const FORMATS: [string, string][] = [['all', 'Everything'], ['watch', 'Watch or take a course'], ['read', 'Read']];
const LEVELS_F: [string, string][] = [['all', 'Any level'], ['Beginner', 'Beginner'], ['Intermediate', 'Intermediate'], ['Advanced', 'Advanced']];
const NEW_HERE = ['res-course-claude-101', 'res-quickstart', 'res-video-mastering'];

export function ResourcesPage() {
  const prog = useProgress();
  const [fmt, setFmt] = useState('all');
  const [level, setLevel] = useState('all');
  const resources = allResources.filter((r) => r.audience !== 'salesforce' || prog.profile.sf || prog.profile.all);
  const total = resources.reduce((a, r) => a + r.minutes, 0);
  const primary = (r: (typeof resources)[number]) => lessonById(r.lessons?.[0] ?? '')?.module ?? moduleById(r.modules[0]);
  const shown = resources.filter((r) => {
    const watch = r.type === 'Video' || r.type === 'Course';
    if (fmt === 'watch' && !watch) return false;
    if (fmt === 'read' && watch) return false;
    const m = primary(r);
    return level === 'all' || (m ? LEVEL_OF[m.level] === level : false);
  });
  const starters = resources.filter((r) => NEW_HERE.includes(r.id));
  return (
    <>
      <PageHead kicker="Resources" title="Find the right video or doc">
        {resources.length} free resources, about {Math.round(total / 6) / 10} hours in total. Every lesson also lists its own picks under <b>Go deeper</b>. Here is everything, grouped by module.
      </PageHead>
      {resources.length === 0 && <p className="muted">Resources are being verified.</p>}
      {fmt === 'all' && level === 'all' && starters.length > 0 && (
        <div className="callout tip" style={{ marginBottom: 18 }}>
          <div className="ct">New here? Start with one of these</div>
          <div className="stack" style={{ gap: 8, marginTop: 8 }}>{starters.map((r) => <ResourceItem key={r.id} r={r} />)}</div>
        </div>
      )}
      <div className="row" style={{ marginBottom: 8 }}>
        {FORMATS.map(([k, v]) => <button key={k} className={`step ${fmt === k ? 'on' : ''}`} onClick={() => setFmt(k)}>{v}</button>)}
      </div>
      <div className="row" style={{ marginBottom: 18 }}>
        {LEVELS_F.map(([k, v]) => <button key={k} className={`step ${level === k ? 'on' : ''}`} onClick={() => setLevel(k)}>{v}</button>)}
      </div>
      {shown.length === 0 && <p className="muted">Nothing matches those filters. Try Everything or Any level.</p>}
      {modules.map((m) => {
        const items = shown.filter((r) => primary(r)?.id === m.id);
        if (items.length === 0) return null;
        return (
          <section key={m.id} style={{ marginBottom: 22 }}>
            <div className="row spread">
              <h2 style={{ margin: 0 }}>Module {m.number}: {m.title}</h2>
              <Badge tone="accent">{LEVEL_OF[m.level]}</Badge>
            </div>
            <div className="grid c2" style={{ marginTop: 10, alignItems: 'start' }}>
              {items.map((r) => <ResourceItem key={r.id} r={r} showLessons />)}
            </div>
          </section>
        );
      })}
      <p className="small muted">Links were checked on {resources[0]?.verified}. Anthropic renames pages often; tell us if one is broken.</p>
    </>
  );
}

export function FinalPage() {
  const p = useProgress();
  const fa = finalAssessment;
  const sfx = p.profile.sf ? finalSalesforce : null; // learners on the Salesforce FDE program also sit the Salesforce exam
  const last = finalLastModule(p); // the exam covers the learner's own path, not modules they were never recommended
  const [started, setStarted] = useState(false);
  const [sfStarted, setSfStarted] = useState(false);
  const numOf = (id: string) => modules.find((m) => m.id === id)?.number ?? 0;
  const scoped = useMemo(() => fa ? {
    questions: fa.questions.filter((q) => numOf(q.module) <= last),
    practical: fa.practical.filter((t) => !t.module || numOf(t.module) <= last),
  } : null, [fa, last]);
  const qs = useMemo(() => (scoped ? shuffle(scoped.questions) : []), [scoped, started]);
  const sfQs = useMemo(() => (sfx ? shuffle(sfx.questions) : []), [sfx, sfStarted]);
  if (!fa || !scoped) return <PageHead title="Final assessment" kicker="Final">The final assessment is being prepared.</PageHead>;
  const fin = p.final;
  const sfFin = p.sfFinal;
  const tasks = [...scoped.practical, ...(sfx?.practical ?? [])];
  const practicalDone = tasks.every((t) => (p.finalPractical[t.id]?.length ?? 0) === t.criteria.length);
  const theoryPassed = !!fin?.passed;
  const sfPassed = !!sfFin?.passed;
  const certified = theoryPassed && practicalDone && (!sfx || sfPassed);
  const level = p.profile.sf;
  const proof = level ? requiredSfItems().filter((i) => i.kind === 'Superbadge' || i.kind === 'Exam') : [];
  const all = p.profile.sf && p.profile.all;
  return (
    <>
      <PageHead kicker="Final assessment" title="Show you can do it">
        {sfx
          ? `Part 1 is a ${scoped.questions.length}-question academy exam. Part 2 is a ${sfx.questions.length}-question Salesforce exam. Part 3 is ${tasks.length} practical tasks you complete in a real repository or sandbox and self-certify. Pass mark ${fa.passMark}%.`
          : `Part 1 is a ${scoped.questions.length}-question scenario exam (pass mark ${fa.passMark}%). Part 2 is ${tasks.length} practical task${tasks.length === 1 ? '' : 's'} you complete in a real repository and self-certify.`}
      </PageHead>
      {last !== Infinity && <p className="small muted">The academy exam covers Modules 1 to {last}, the modules in your plan. {all ? '' : 'The rest are not tested.'}</p>}
      {certified && (
        <div className="hero" style={{ marginBottom: 18 }}>
          <div className="kicker">Certified</div>
          <h2>Concretio FDE Academy complete</h2>
          <p>Theory {fin ? Math.round((fin.score / fin.total) * 100) : 0}%{sfx && sfFin ? `, Salesforce exam ${Math.round((sfFin.score / sfFin.total) * 100)}%` : ''} and all practical tasks done. You are ready to use Claude Code on client work.</p>
        </div>
      )}
      <h2>Part 1: Theory exam {theoryPassed && <Badge tone="ok">Passed</Badge>}</h2>
      {fin && <p className="muted small">Last attempt: {fin.score}/{fin.total} ({Math.round((fin.score / fin.total) * 100)}%), {fin.attempts} attempt(s).</p>}
      {!started ? (
        <Button variant="primary" onClick={() => setStarted(true)}>{fin ? 'Retake exam' : 'Start exam'}</Button>
      ) : (
        <Quiz key={String(started)} questions={qs} mode="exam" passPct={fa.passMark} onFinish={(s, t) => actions.saveFinal(s, t, fa.passMark)} />
      )}
      {sfx && (
        <>
          <h2 style={{ marginTop: 32 }}>Part 2: Salesforce exam {sfPassed && <Badge tone="ok">Passed</Badge>}</h2>
          <p className="muted small">Judgment when Claude Code writes or changes Salesforce work: bulk safety, access, sandboxes, data in prompts, deployment and agents. It assumes you know Apex, Flow and LWC basics.</p>
          {sfFin && <p className="muted small">Last attempt: {sfFin.score}/{sfFin.total} ({Math.round((sfFin.score / sfFin.total) * 100)}%), {sfFin.attempts} attempt(s).</p>}
          {!sfStarted ? (
            <Button variant="primary" onClick={() => setSfStarted(true)}>{sfFin ? 'Retake Salesforce exam' : 'Start Salesforce exam'}</Button>
          ) : (
            <Quiz key={'sf' + String(sfStarted)} questions={sfQs} mode="exam" passPct={sfx.passMark} onFinish={(s, t) => actions.saveSfFinal(s, t, sfx.passMark)} />
          )}
        </>
      )}
      <h2 style={{ marginTop: 32 }}>Part {sfx ? 3 : 2}: Practical tasks {practicalDone && <Badge tone="ok">Done</Badge>}</h2>
      <div className="stack">
        {tasks.map((t) => {
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
      {level && proof.length > 0 && (
        <>
          <h2 style={{ marginTop: 32 }}>Proof from Salesforce and Anthropic</h2>
          <p className="muted small">These are graded by the providers, not here. Tick them on the <a href={href('salesforce')}>Salesforce page</a> when you earn them.</p>
          <div className="stack" style={{ gap: 6 }}>
            {proof.map((i) => <div key={i.id} className="small">{p.sf[i.id]?.done ? '✓ ' : '○ '}{i.title}</div>)}
          </div>
        </>
      )}
      <div className="row" style={{ marginTop: 18 }}><LinkButton href={href('progress')}>View my progress</LinkButton></div>
    </>
  );
}
