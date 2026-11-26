import { allAssignments, allExercises, allLessons, modules } from '../content';
import { DAY1_ID, lessonDone, moduleStats, nextAction, overall, unmetRequirements } from '../lib/stats';
import { href } from '../lib/router';
import { ScopeToggle } from '../components/Scope';
import { SF_PATH, nextSfItem, sfItemMap } from '../lib/sfPath';
import type { Module } from '../content/types';
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

  const level = p.profile.sf;
  const items = level ? sfItemMap() : null;
  const nextSf = level ? nextSfItem(p) : null;
  const inPath = new Set(level ? SF_PATH.flatMap((st) => (st.t === 'm' ? [st.n] : [])) : []);

  const moduleBlock = (m: Module) => {
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
  };

  return (
    <>
      <PageHead kicker="Journey" title="Your path from here to done">
        Everything you need to complete, in order. A tick means done, the arrow is where to go next.
      </PageHead>

      <ScopeToggle />

      <div className="card row spread" style={{ marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 220 }}>
          <b>{o.pct}% of {level ? 'your path' : 'the academy'} complete</b>
          <Progress value={o.pct} />
          <div className="small muted" style={{ marginTop: 6 }}>{o.lessons} of {allLessonsCount} lessons, {o.exercises} of {allExercises.length} exercises, {o.assigns} of {allAssignmentsCount} assignments{finalPassed ? ', final passed' : ''}</div>
        </div>
        <a className="btn primary" href={nx.href}>{nx.verb}: {nx.target}</a>
      </div>

      <div className="jtree">
        {!level && (
          <>
            <div className="jstage">1. Choose where to start</div>
            <Node state={p.track ? 'done' : 'todo'} to={href('start')} title="Pick your starting level" meta={p.track ? 'Chosen' : 'Takes ten seconds'} />
          </>
        )}

        <div className="jstage">{level ? '1. Your path: Associate, then FDE, then Senior FDE. Salesforce courses first, then Claude' : '2. Learn and practise, module by module'}</div>
        {level ? (
          <>
            {SF_PATH.map((st, i) => {
              if (st.t === 'h') return <div key={i} className="jstage jsub">{st.title}{st.sub ? `, ${st.sub}` : ''}</div>;
              if (st.t === 'm') { const m = modules.find((x) => x.number === st.n); return m ? moduleBlock(m) : null; }
              return (
                <div key={i} className="jkids" style={{ marginLeft: 0 }}>
                  {st.ids.map((id) => { const it = items!.get(id); if (!it) return null; return (
                    <Node key={id} state={stateOf(!!p.sf[id]?.done, nx.href.startsWith('#/salesforce') && nextSf?.id === id)} to={href('salesforce')} title={it.title}
                      meta={`Salesforce path, ${it.kind.toLowerCase()}, ${it.provider}${it.minutes ? `, about ${Math.round((it.minutes / 60) * 10) / 10} h` : ''}`} />
                  ); })}
                </div>
              );
            })}
            {p.profile.all && (
              <>
                <div className="jstage">Other academy modules (not in your path)</div>
                {modules.filter((m) => !inPath.has(m.number)).map(moduleBlock)}
              </>
            )}
          </>
        ) : modules.map(moduleBlock)}

        <div className="jstage">{level ? '2' : '3'}. Prove it</div>
        <Node state={stateOf(finalPassed, here('#/final'))} to={href('final')} title="Final assessment"
          meta={p.final ? `Theory ${Math.round((p.final.score / p.final.total) * 100)}%, then the practical tasks` : 'Theory exam, then practical tasks'} />
      </div>
    </>
  );
}
