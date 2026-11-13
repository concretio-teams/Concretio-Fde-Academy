import { allAssignments, allExercises, allLessons, modules } from '../content';
import { href } from '../lib/router';
import { lessonDone, moduleStats, nextAction, overall, skillLevels } from '../lib/stats';
import { resetAll } from '../lib/auth';
import { streak, useProgress, type Progress as P } from '../lib/store';
import { Badge, Button, Card, LinkButton, PageHead, Progress, Ring } from '../ui';

function achievements(p: P) {
  const solvedSec = allExercises.filter((e) => e.exercise.category === 'security' && p.exercises[e.exercise.id]?.done).length;
  const perfect = Object.values(p.quiz).some((q) => q.best === q.total && q.total > 0);
  const st = streak(p.days);
  const lessonsDone = allLessons.filter((l) => lessonDone(p, l.lesson)).length;
  return [
    { id: 'first', name: 'First steps', desc: 'Complete your first lesson', got: lessonsDone >= 1 },
    { id: 'perfect', name: 'Perfect score', desc: '100% on any quiz', got: perfect },
    { id: 'streak', name: 'On a roll', desc: 'Learn 3 days in a row', got: st.best >= 3 },
    { id: 'ex', name: 'Hands on', desc: 'Solve 5 playground exercises', got: Object.values(p.exercises).filter((e) => e.done).length >= 5 },
    { id: 'sec', name: 'Security sleuth', desc: 'Solve 2 security reviews', got: solvedSec >= 2 },
    { id: 'builder', name: 'Builder', desc: 'Complete an assignment', got: allAssignments.some((a) => p.assignments[a.assignment.id]?.done) },
    { id: 'mod', name: 'Module master', desc: 'Complete a whole module', got: modules.some((m) => moduleStats(p, m).complete) },
    { id: 'cert', name: 'Certified', desc: 'Pass the final assessment', got: !!p.final?.passed },
  ];
}

export function Dashboard() {
  const p = useProgress();
  const o = overall(p);
  const next = nextAction(p);
  const st = streak(p.days);
  const solved = allExercises.filter((e) => p.exercises[e.exercise.id]?.done).length;
  const scores = Object.values(p.quiz);
  const avg = scores.length ? Math.round(scores.reduce((a, q) => a + (q.best / q.total) * 100, 0) / scores.length) : null;
  const ach = achievements(p);
  return (
    <>
      <div className="hero row" style={{ gap: 24, marginBottom: 20 }}>
        <Ring value={o.pct} label="complete" />
        <div style={{ flex: 1, minWidth: 240 }}>
          <div className="kicker">Claude Code Academy</div>
          <h1>{o.done === 0 ? 'Welcome. Start your first lesson.' : 'Keep going, you are making progress.'}</h1>
          <p className="muted">From AI coding tool user to confident AI-assisted engineer. {allLessons.length} lessons, {allExercises.length} exercises, {allAssignments.length} assignments and a final assessment.</p>
          <LinkButton variant="primary" href={next.href}>{next.label}</LinkButton>
          <div className="small muted" style={{ marginTop: 6 }}>{next.why} Press <kbd>C</kbd> anytime to continue.</div>
        </div>
      </div>
      <div className="grid c4" style={{ marginBottom: 20 }}>
        <Card><div className="stat"><span className="muted small">Lessons done</span><b>{o.lessons}/{allLessons.length}</b></div></Card>
        <Card><div className="stat"><span className="muted small">Quiz average</span><b>{avg === null ? '–' : `${avg}%`}</b></div></Card>
        <Card><div className="stat"><span className="muted small">Learning streak</span><b>{st.current} day{st.current === 1 ? '' : 's'}</b><span className="small muted">best {st.best}</span></div></Card>
        <Card><div className="stat"><span className="muted small">Exercises solved</span><b>{solved}/{allExercises.length}</b></div></Card>
      </div>
      <h2>Your journey</h2>
      <div className="journey">
        {([
          ['Learn', '#/path', o.lessons + '/' + allLessons.length + ' lessons done', o.lessons === allLessons.length],
          ['Practice', '#/assignments', o.assigns + '/' + allAssignments.length + ' assignments done', o.assigns === allAssignments.length],
          ['Prove', '#/final', p.final?.passed ? 'Final assessment passed' : 'Final assessment pending', !!p.final?.passed],
        ] as const).map(([label, to, sub, done], i) => (
          <a key={label} href={to} className={'jstep ' + (done ? 'done' : next.step === label ? 'now' : '')}>
            <div><span className="n">{done ? '✓' : i + 1}</span><b>{label}</b></div>
            <div className="small muted" style={{ marginTop: 4 }}>{sub}</div>
          </a>
        ))}
      </div>
      <h2>Five rules for every session</h2>
      <div className="grid c4" style={{ marginBottom: 24 }}>
        {[
          ['Plan before code', 'Use plan mode and agree the approach first.'],
          ['Tests decide done', 'Green checks, not confident prose, finish a task.'],
          ['Read every diff', 'You own what you merge, generated or not.'],
          ['Safe environments only', 'Experiment in sandboxes, never on production data.'],
          ['No secrets in prompts', 'Keys and customer data never go into a prompt.'],
        ].map(([t, d]) => (
          <Card key={t}><b>{t}</b><div className="small muted">{d}</div></Card>
        ))}
      </div>
      <h2>Your modules</h2>
      <div className="grid c2" style={{ marginBottom: 24 }}>
        {modules.map((m) => {
          const s = moduleStats(p, m);
          const next = m.lessons.find((l) => !lessonDone(p, l)) ?? m.lessons[0];
          return (
            <Card key={m.id} onClick={() => { window.location.hash = href('lesson', next.id); }}>
              <div className="row spread"><span className="kicker">Module {m.number}</span>{s.complete ? <Badge tone="ok">Complete</Badge> : <Badge>{s.pct}%</Badge>}</div>
              <h3>{m.title}</h3>
              <Progress value={s.pct} tone={s.complete ? 'ok' : undefined} />
            </Card>
          );
        })}
      </div>
      <h2>Achievements</h2>
      <div className="grid c4">
        {ach.map((a) => (
          <Card key={a.id} className={a.got ? '' : 'lock'}>
            <div style={{ fontSize: '1.5rem' }}>{a.got ? '★' : '☆'}</div>
            <b>{a.name}</b>
            <div className="small muted">{a.desc}</div>
          </Card>
        ))}
      </div>
    </>
  );
}

export function ProgressPage() {
  const p = useProgress();
  const o = overall(p);
  const sk = skillLevels(p);
  const st = streak(p.days);
  return (
    <>
      <PageHead kicker="My progress" title="Skills, scores and history" />
      <div className="grid c3" style={{ marginBottom: 20 }}>
        <Card><div className="row"><Ring value={o.pct} /><div><b>Overall</b><div className="small muted">{o.done}/{o.total} units</div><div className="small muted">Streak {st.current}, best {st.best}</div></div></div></Card>
        <Card><b>Final assessment</b><p className="small muted">{p.final ? `${Math.round((p.final.score / p.final.total) * 100)}% on theory (${p.final.attempts} attempt(s))` : 'Not attempted'}</p>{p.final?.passed ? <Badge tone="ok">Theory passed</Badge> : <LinkButton size="sm" href={href('final')}>Open</LinkButton>}</Card>
        <Card><b>Active days</b><p className="stat"><b>{p.days.length}</b></p></Card>
      </div>
      <h2>Skill progression</h2>
      <div className="grid c2" style={{ marginBottom: 24 }}>
        {sk.map((s) => (
          <Card key={s.skill}>
            <div className="row spread"><b>{s.skill}</b><Badge tone={s.pct >= 60 ? 'ok' : 'accent'}>{s.level}</Badge></div>
            <div style={{ marginTop: 8 }}><Progress value={s.pct} /></div>
          </Card>
        ))}
      </div>
      <h2>Modules and quiz scores</h2>
      <div className="tablewrap" style={{ marginBottom: 24 }}>
        <table>
          <thead><tr><th>Module</th><th>Lessons</th><th>Assignments</th><th>Quiz avg</th><th>Status</th></tr></thead>
          <tbody>
            {modules.map((m) => { const s = moduleStats(p, m); return (
              <tr key={m.id}><td>{m.number}. {m.title}</td><td>{s.lessonsDone}/{s.lessonsTotal}</td><td>{s.assignmentsDone}/{s.assignmentsTotal}</td><td>{s.quizAvg === null ? '–' : `${s.quizAvg}%`}</td><td>{s.complete ? 'Complete' : s.started ? 'In progress' : 'Not started'}</td></tr>
            ); })}
          </tbody>
        </table>
      </div>
      <h2>Learning history</h2>
      {p.history.length === 0 ? <p className="muted">Nothing yet. Finish a lesson or exercise and it appears here.</p> : (
        <div className="timeline">
          {p.history.slice(0, 40).map((h, i) => (
            <div key={i} className="tl"><div>{h.text}</div><div className="small muted">{new Date(h.t).toLocaleString()}</div></div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 30 }}>
        <Button onClick={() => { if (window.confirm('Reset all progress? If you are signed in, your saved account progress is erased too. This cannot be undone.')) void resetAll(); }}>Reset progress</Button>
      </div>
    </>
  );
}
