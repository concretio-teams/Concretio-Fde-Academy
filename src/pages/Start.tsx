import { useMemo, useState } from 'react';
import { conceptList, lessonById, moduleById } from '../content';
import { href } from '../lib/router';
import { hours, totalMinutes } from '../lib/stats';
import { actions, useProgress } from '../lib/store';
import { LEVELS, TRACKS } from '../lib/tracks';
import { Badge, Card, LinkButton, PageHead, Rich, showConcept } from '../ui';

export function StartPage() {
  const p = useProgress();
  const t = totalMinutes();
  const chosen = TRACKS.find((x) => x.id === p.track);
  const startMod = chosen ? moduleById(chosen.startModule) : undefined;
  const firstLesson = startMod ? lessonById(startMod.lessons[0].id) : undefined;
  return (
    <>
      <PageHead kicker="Start here" title="Welcome. Let us find your starting point.">
        Pick the description that fits you best. You can change it any time, and nothing is locked.
      </PageHead>

      <div className="grid c3" style={{ marginBottom: 16 }}>
        {TRACKS.map((x) => (
          <button key={x.id} className={`card click ${p.track === x.id ? 'chosen' : ''}`} onClick={() => actions.setTrack(x.id)} aria-pressed={p.track === x.id}>
            <h3>{x.title}</h3>
            <div className="small muted">{x.who}</div>
            {p.track === x.id && <div style={{ marginTop: 8 }}><Badge tone="ok">Your starting point</Badge></div>}
          </button>
        ))}
      </div>

      {chosen && firstLesson && (
        <div className="callout tip" style={{ marginBottom: 24 }}>
          <div className="ct">Your first step</div>
          <p>{chosen.advice}</p>
          <div className="row">
            <LinkButton variant="primary" href={href('lesson', firstLesson.lesson.id)}>Start: {firstLesson.lesson.title}</LinkButton>
            {chosen.id === 'pro' && <LinkButton href={href('knowledge')}>Open knowledge checks</LinkButton>}
          </div>
        </div>
      )}

      <h2>How it works</h2>
      <div className="grid c4" style={{ marginBottom: 24 }}>
        {[
          ['1. Read a lesson', 'Each one takes 20 to 55 minutes. Click any highlighted term to see a plain explanation.'],
          ['2. Try the exercises', 'Short practice inside the lesson. You cannot break anything.'],
          ['3. Pass the quiz', 'Real situations, not trivia. 70% completes the lesson, and you can retry.'],
          ['4. Do the assignment', 'Real work at the end of each module. This is where the learning sticks.'],
        ].map(([title, body]) => (
          <Card key={title}><b>{title}</b><div className="small muted">{body}</div></Card>
        ))}
      </div>

      <h2>How long does it take?</h2>
      <p>
        Lessons take {hours(t.lessons)} and assignments about {hours(t.assignments)}, so plan on roughly {hours(t.lessons + t.assignments)} in total.
        Go at your own pace. Two or three short sessions a week works well.
      </p>

      <h2>What you need</h2>
      <ul>
        <li>A computer with a terminal and a code editor.</li>
        <li>A Claude account that can use Claude Code. Module 2 shows the options.</li>
        <li>A small project to practice on. We provide one: the <code>starters/shop-app</code> folder in the academy repository.</li>
      </ul>

      <h2>What the levels mean</h2>
      <div className="grid c4" style={{ marginBottom: 24 }}>
        {LEVELS.map(([name, desc]) => (
          <Card key={name}><Badge tone="accent">{name}</Badge><div className="small muted" style={{ marginTop: 6 }}>{desc}</div></Card>
        ))}
      </div>

      <p className="muted">Stuck on a word? Open the <a href={href('glossary')}>Glossary</a>, it lists every term in plain language.</p>
    </>
  );
}

const KINDS: Record<string, string> = { all: 'All', concept: 'Ideas', command: 'Commands', config: 'Settings', workflow: 'Workflows' };

export function GlossaryPage() {
  const [q, setQ] = useState('');
  const [kind, setKind] = useState('all');
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return conceptList.filter((c) => {
      if (kind !== 'all' && (c.kind ?? 'concept') !== kind) return false;
      return !s || c.name.toLowerCase().includes(s) || c.what.toLowerCase().includes(s);
    });
  }, [q, kind]);
  return (
    <>
      <PageHead kicker="Glossary" title="Every term, in plain language">
        {conceptList.length} terms used in the lessons. Click one for a full explanation with an example.
      </PageHead>
      <div className="row" style={{ marginBottom: 14 }}>
        <input
          className="search"
          type="search"
          placeholder="Search terms, for example context or hook"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search glossary"
        />
      </div>
      <div className="row" style={{ marginBottom: 14 }}>
        {Object.entries(KINDS).map(([k, v]) => (
          <button key={k} className={`step ${kind === k ? 'on' : ''}`} onClick={() => setKind(k)}>{v}</button>
        ))}
      </div>
      {list.length === 0 && <p className="muted">No terms match. Try a shorter word.</p>}
      <div className="grid c2">
        {list.map((c) => (
          <Card key={c.id} onClick={() => showConcept(c.id)}>
            <div className="row spread"><b>{c.name}</b><span className="badge">{c.kind ?? 'concept'}</span></div>
            <div className="small muted" style={{ marginTop: 4 }}><Rich md={c.what} /></div>
          </Card>
        ))}
      </div>
    </>
  );
}
