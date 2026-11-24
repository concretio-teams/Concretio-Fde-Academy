import { allAssignments, allExercises, allLessons, modules } from '../content';
import { DAY1_ID, lessonDone, moduleStats, nextAction, overall, unmetRequirements } from '../lib/stats';
import { href } from '../lib/router';
import { useProgress, type Progress as P } from '../lib/store';
import { Badge, PageHead, Progress } from '../ui';

const allLessonsCount = allLessons.length;
const allAssignmentsCount = allAssignments.length;

type State = 'done' | 'here' | 'todo';

function Node({ state, to, title, meta }: { state: State; to: string; title: string; meta?: string }) {
  const mark = state === 'done' ? '✓' : state === 'here' ? '→' : '';
  return (
    <a className={`jnode ${state}`} href={to} aria-current={state === 'here' ? 'step' : undefined}>
      <span className="jdot" aria-hidden>{mark}</span>
      <span className="jtext">{title}{meta && <small>{meta}</small>}</span>
      {state === 'here' && <Badge tone="accent">You are here</Badge>}
    </a>
  );
}

function stateOf(done: boolean, isHere: boolean): State {
  return done ? 'done' : isHere ? 'here' : 'todo';
}

export function JourneyPage() {
  const p: P = useProgress();
  const nx = nextAction(p);
  const o = overall(p);
  const here = (to: string) => nx.href === to || nx.href === `${to}/quiz`;
  const finalPassed = !!p.final?.passed;

  return (
    <>
      <PageHead kicker="Journey" title="Your path from here to done">
        Everything you need to complete, in order. A tick means done, the arrow is where to go next.
      </PageHead>

      <div className="card row spread" style={{ marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <b>{o.pct}% of the academy complete</b>
          <Progress value={o.pct} />
          <div className="small muted" style={{ marginTop: 6 }}>{o.lessons} of {allLessonsCount} lessons, {o.exercises} of {allExercises.length} exercises, {o.assigns} of {allAssignmentsCount} assignments{finalPassed ? ', final passed' : ''}</div>
        </div>
        <a className="btn primary" href={nx.href}>{nx.verb}: {nx.target}</a>
      </div>

      <div className="jtree">
        <div className="jstage">1. Choose where to start</div>
        <Node state={p.track ? 'done' : 'todo'} to={href('start')} title="Pick your starting level" meta={p.track ? 'Chosen' : 'Takes ten seconds'} />

        <div className="jstage">2. Learn and practise, module by module</div>
        {modules.map((m) => {
          const s = moduleStats(p, m);
          const unmet = unmetRequirements(p, m);
          const ex = allExercises.filter((x) => x.module.id === m.id);
          const hasHere = m.lessons.some((l) => here(`#/lesson/${l.id}`)) || ex.some((x) => here(`#/playground/${x.exercise.id}`)) || m.assignments.some((a) => here(`#/assignments/${a.id}`));
          return (
            <details key={m.id} className={`jmodule ${s.complete ? 'done' : hasHere ? 'here' : ''}`} open={hasHere || (s.started && !s.complete)}>
              <summary>
                <span className="jdot big" aria-hidden>{s.complete ? '✓' : m.number}</span>
                <span className="jtext"><b>{m.title}</b>
                  <small>{m.level}. {s.lessonsDone}/{s.lessonsTotal} lessons, {s.exercisesDone}/{s.exercisesTotal} exercises, {s.assignmentsDone}/{s.assignmentsTotal} assignments</small>
                </span>
                <span className="jpct">{s.pct}%</span>
              </summary>
              {unmet.length > 0 && <div className="small muted jnote">Builds on {unmet.map((u) => u.title).join(', ')}, which you have not finished. You can still start here.</div>}
              <div className="jkids">
                {m.lessons.map((l) => (
                  <Node key={l.id} state={stateOf(lessonDone(p, l), here(`#/lesson/${l.id}`))} to={href('lesson', l.id)} title={l.title}
                    meta={p.quiz[l.id] ? `Lesson and quiz, best ${p.quiz[l.id].best}/${p.quiz[l.id].total}` : `Lesson and quiz, ${l.minutes} min`} />
                ))}
                {ex.map((x) => (
                  <Node key={x.exercise.id} state={stateOf(!!p.exercises[x.exercise.id]?.done, here(`#/playground/${x.exercise.id}`))} to={href('playground', x.exercise.id)} title={x.exercise.title} meta="Playground exercise" />
                ))}
                {m.assignments.map((a) => (
                  <Node key={a.id} state={stateOf(!!p.assignments[a.id]?.done, here(`#/assignments/${a.id}`))} to={href('assignments', a.id)} title={a.title} meta={a.id === DAY1_ID ? 'Day 1 proof: required before Module 3. Paste real output from your own machine.' : `Assignment${a.minutes ? `, about ${a.minutes} min` : ''}`} />
                ))}
              </div>
            </details>
          );
        })}

        <div className="jstage">3. Prove it</div>
        <Node state={stateOf(finalPassed, here('#/final'))} to={href('final')} title="Final assessment"
          meta={p.final ? `Theory ${Math.round((p.final.score / p.final.total) * 100)}%, then the practical tasks` : 'Theory exam, then practical tasks'} />
      </div>
    </>
  );
}
