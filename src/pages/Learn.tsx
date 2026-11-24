import { useEffect, useRef, useState } from 'react';
import { nextAction } from '../lib/stats';
import { allLessons, lessonById, moduleById, modules, nextLessonAfter } from '../content';
import { BlockView } from '../components/Blocks';
import { GoDeeper } from '../components/GoDeeper';
import { Quiz } from '../components/Quiz';
import { href } from '../lib/router';
import { day1Done, hours, lessonDone, moduleStats, startNumber, totalMinutes, unmetRequirements } from '../lib/stats';
import { actions, useProgress } from '../lib/store';
import { Badge, Button, Card, LinkButton, PageHead, Progress, Rich } from '../ui';

export function PathPage() {
  const p = useProgress();
  const nx = nextAction(p);
  const isNext = (href: string) => nx.href === href || nx.href === `${href}/quiz`;
  return (
    <>
      <PageHead kicker="Learning path" title="Nine modules, one direction">
        Work top to bottom. Each module builds on the ones before it; the path shows what to finish first.
        Total time: {hours(totalMinutes().lessons + totalMinutes().assignments)}. Not sure where to begin? Try the <a href={href('start')}>Start here</a> page.
      </PageHead>
      <div className="stack">
        {modules.map((m) => {
          const s = moduleStats(p, m);
          const unmet = unmetRequirements(p, m);
          const mins = m.lessons.reduce((a, l) => a + l.minutes, 0) + m.assignments.reduce((a, x) => a + (x.minutes ?? 0), 0);
          return (
            <div key={m.id} className={`card mod ${s.complete ? 'done' : s.started ? 'active' : ''}`}>
              <div className="row" style={{ alignItems: 'flex-start', gap: 14 }}>
                <div className="num">{s.complete ? '✓' : m.number}</div>
                <div style={{ flex: 1, minWidth: 240 }}>
                  <div className="row spread">
                    <h2 style={{ margin: 0 }}>{m.title}</h2>
                    <div className="row">{p.track && m.number === startNumber(p) && <Badge tone="ok">Your starting point</Badge>}<Badge tone="accent">{m.level}</Badge><Badge>{hours(mins)}</Badge>{s.complete && <Badge tone="ok">Complete</Badge>}</div>
                  </div>
                  <p className="muted">{m.tagline}</p>
                  {m.requires.length > 0 && (
                    <div className="small muted">Builds on: {m.requires.map((r) => moduleById(r)?.title ?? r).join(', ')}</div>
                  )}
                  {unmet.length > 0 && <div className="small" style={{ color: 'var(--warn)' }}>Recommended first: finish {unmet.map((u) => `Module ${u.number}`).join(', ')}.</div>}
                  <div style={{ margin: '10px 0' }}><Progress value={s.pct} tone={s.complete ? 'ok' : undefined} /></div>
                  <div className="small muted">{s.lessonsDone}/{s.lessonsTotal} lessons, {s.assignmentsDone}/{s.assignmentsTotal} assignments{s.quizAvg !== null ? `, quiz average ${s.quizAvg}%` : ''}</div>
                  <details style={{ marginTop: 8 }}>
                    <summary className="small"><b>You will be able to</b></summary>
                    <ul className="small">{m.outcomes.map((o) => <li key={o}>{o}</li>)}</ul>
                  </details>
                  <div className="stack" style={{ marginTop: 10, gap: 6 }}>
                    {m.lessons.map((l, i) => (
                      <a key={l.id} href={href('lesson', l.id)} className="row spread" style={{ textDecoration: 'none', color: 'inherit', padding: '8px 10px', border: '1px solid var(--border)', borderColor: isNext(`#/lesson/${l.id}`) ? 'var(--accent)' : 'var(--border)', borderRadius: 10 }}>
                        <span>{lessonDone(p, l) ? '✓ ' : ''}Lesson {i + 1}: {l.title}{isNext(`#/lesson/${l.id}`) && <> <Badge tone="ok">Next</Badge></>}</span>
                        <span className="small muted">{l.minutes} min{p.quiz[l.id] ? `, quiz ${p.quiz[l.id].best}/${p.quiz[l.id].total}` : ''}</span>
                      </a>
                    ))}
                    {m.assignments.map((a) => (
                      <a key={a.id} href={href('assignments', a.id)} className="row spread" style={{ textDecoration: 'none', color: 'inherit', padding: '8px 10px', border: '1px dashed var(--border)', borderRadius: 10 }}>
                        <span>{p.assignments[a.id]?.done ? '✓ ' : ''}Assignment: {a.title}{nx.href === `#/assignments/${a.id}` && <> <Badge tone="ok">Next</Badge></>}</span>
                        <span className="small muted">practical</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function LessonPage({ id, scrollToQuiz }: { id: string; scrollToQuiz?: boolean }) {
  const p = useProgress();
  const found = lessonById(id);
  useEffect(() => { if (found) actions.viewLesson(found.lesson.id, found.lesson.title); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  // A list of the lesson's sections, built from its headings, so a long lesson is easy to move around in.
  const bodyRef = useRef<HTMLDivElement>(null);
  const [outline, setOutline] = useState<{ id: string; text: string }[]>([]);
  useEffect(() => {
    const hs = Array.from(bodyRef.current?.querySelectorAll<HTMLElement>('h3.rich-h') ?? []);
    hs.forEach((h, i) => { h.id = `sec-${i}`; });
    setOutline(hs.map((h, i) => ({ id: `sec-${i}`, text: h.textContent ?? '' })));
  }, [id]);
  const jump = (target: string) => document.getElementById(target)?.scrollIntoView({ block: 'start' });
  useEffect(() => { if (scrollToQuiz) setTimeout(() => document.getElementById("quiz")?.scrollIntoView({ behavior: "smooth" }), 300); }, [scrollToQuiz, id]);
  if (!found) return <PageHead title="Lesson not found">Pick a lesson from the <a href={href('path')}>learning path</a>.</PageHead>;
  const { lesson, module: m, index } = found;
  const next = nextLessonAfter(lesson.id);
  const done = lessonDone(p, lesson);
  const q = p.quiz[lesson.id];
  return (
    <>
      <div className="small muted"><a href={href('path')}>Path</a> / Module {m.number}: {m.title}</div>
      <PageHead kicker={`Module ${m.number}, lesson ${index + 1} of ${m.lessons.length}`} title={lesson.title} />
      {m.number >= 3 && !day1Done(p) && (
        <div className="callout warn" style={{ marginBottom: 12 }}>
          <div className="ct">Do the Day 1 proof first</div>
          <p style={{ margin: '4px 0' }}>This module assumes you have run the real Claude Code. <a href={href('assignments', 'm2-a1')}>Complete the Day 1 assignment</a> (about 45 minutes), then come back. You can still read on.</p>
        </div>
      )}
      <div className="row" style={{ marginBottom: 14 }}>
        <Badge>{lesson.minutes} min</Badge>
        {done && <Badge tone="ok">Completed</Badge>}
        {q && <Badge>Best quiz {q.best}/{q.total}</Badge>}
      </div>
      {lesson.summary && <div className="insight"><b>In short:</b> {lesson.summary}</div>}
      <Card>
        <b>By the end of this lesson you can:</b>
        <ul style={{ margin: '6px 0 0' }}>{lesson.objectives.map((o) => <li key={o}>{o}</li>)}</ul>
      </Card>
      <div className="row" style={{ margin: '12px 0 4px', alignItems: 'flex-start' }}>
        <Button size="sm" onClick={() => jump('quiz')}>Skip to the quiz</Button>
        {outline.length > 1 && (
          <details className="outline">
            <summary>In this lesson ({outline.length} sections)</summary>
            <ol>{outline.map((o) => <li key={o.id}><button className="linklike" onClick={() => jump(o.id)}>{o.text}</button></li>)}</ol>
          </details>
        )}
      </div>
      <div ref={bodyRef}>{lesson.blocks.map((b, i) => <BlockView key={i} block={b} />)}</div>
      <GoDeeper lessonId={lesson.id} />
      <div className="block" id="quiz">
        <h2>Knowledge check</h2>
        <p className="muted">{lesson.quiz.length} questions. Reach 70% to complete this lesson. Retry as often as you like.</p>
        {lesson.quiz.length > 0
          ? <Quiz questions={lesson.quiz} onFinish={(s, t) => actions.recordQuiz(lesson.id, lesson.title, s, t)} />
          : <Button variant="primary" onClick={() => actions.markLesson(lesson.id, lesson.title, true)}>Mark lesson complete</Button>}
      </div>
      {done && (() => { const n = nextAction(p); return (
        <div className="hero" style={{ marginTop: 18 }}>
          <div className="kicker">Lesson complete. What is next?</div>
          <h3 style={{ margin: '4px 0' }}>{n.label}</h3>
          <p className="muted small">{n.why}</p>
          <LinkButton variant="primary" href={n.href}>Continue</LinkButton>
        </div>); })()}
      <div className="row spread" style={{ marginTop: 24 }}>
        {index > 0 ? <LinkButton href={href('lesson', m.lessons[index - 1].id)}>Previous lesson</LinkButton> : <span />}
        {next ? <LinkButton href={href('lesson', next.lesson.id)}>Next: {next.lesson.title}</LinkButton>
          : <LinkButton href={href('final')}>Go to final assessment</LinkButton>}
      </div>
    </>
  );
}

export function KnowledgePage({ lessonId }: { lessonId?: string }) {
  const p = useProgress();
  if (lessonId) {
    const f = lessonById(lessonId);
    if (!f) return <PageHead title="Quiz not found" />;
    return (
      <>
        <div className="small muted"><a href={href('knowledge')}>Knowledge checks</a> / {f.lesson.title}</div>
        <PageHead kicker={`Module ${f.module.number}`} title={f.lesson.title} />
        <Quiz questions={f.lesson.quiz} onFinish={(s, t) => actions.recordQuiz(f.lesson.id, f.lesson.title, s, t)} />
      </>
    );
  }
  const taken = Object.values(p.quiz);
  const avg = taken.length ? Math.round(taken.reduce((a, q) => a + (q.best / q.total) * 100, 0) / taken.length) : null;
  return (
    <>
      <PageHead kicker="Knowledge check" title="Test decisions, not definitions">
        Every lesson ends with its own quiz. Use this page to test out: pass a quiz (70%) and that lesson counts as done, even if you skip the reading. Scores are tracked and you can retry any quiz.
      </PageHead>
      <div className="row" style={{ marginBottom: 14 }}>
        <Badge tone="accent">{taken.length}/{allLessons.length} quizzes taken</Badge>
        {avg !== null && <Badge>Average best score {avg}%</Badge>}
      </div>
      {modules.map((m) => (
        <div key={m.id} style={{ marginBottom: 18 }}>
          <h3>Module {m.number}: {m.title}</h3>
          <div className="grid c2">
            {m.lessons.map((l) => {
              const q = p.quiz[l.id];
              return (
                <Card key={l.id} onClick={() => { window.location.hash = href('knowledge', l.id); }}>
                  <div className="row spread"><b>{l.title}</b>{q && (q.best / q.total >= 0.7 ? <Badge tone="ok">Passed</Badge> : <Badge tone="warn">Retry</Badge>)}</div>
                  <div className="small muted">{l.quiz.length} questions{q ? `, best ${q.best}/${q.total}, ${q.attempts} attempt${q.attempts > 1 ? 's' : ''}` : ''}</div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

export { Rich };
