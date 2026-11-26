import { modules } from '../content';
import { href } from '../lib/router';
import { SF_LEVELS, fmtHours, sfItems, sfMinutes, type SfItem, type SfLevelInfo } from '../lib/sfProgram';
import { SF_PATH, nextSfItem, requiredSfItems } from '../lib/sfPath';
import { actions, useProgress, type Progress } from '../lib/store';
import { Badge, Card, PageHead, Progress as Bar } from '../ui';

/** Share of the level's required items the learner has ticked (exams included, since they are items too). */
export function sfLevelStats(p: Progress, l: SfLevelInfo) {
  const req = sfItems(l).filter((i) => i.status === 'Required');
  const uniq = [...new Map(req.map((i) => [i.id, i])).values()];
  const done = uniq.filter((i) => p.sf[i.id]?.done).length;
  const doneMin = uniq.filter((i) => p.sf[i.id]?.done).reduce((s, i) => s + (i.minutes ?? 0), 0);
  return { total: uniq.length, done, pct: uniq.length ? Math.round((done / uniq.length) * 100) : 0, doneMin, totalMin: sfMinutes(uniq) };
}

function Row({ i, done, next }: { i: SfItem; done: boolean; next?: boolean }) {
  const m = i.module ? modules.find((x) => x.id === i.module) : undefined;
  return (
    <div className="titem">
      <input type="checkbox" checked={done} onChange={() => actions.toggleSf(i.id, i.title)} aria-label={`Mark done: ${i.title}`} />
      <div className="ttext">
        <b><a href={i.url} target="_blank" rel="noreferrer">{i.title}</a></b>
        <small>
          {i.kind}, {i.provider}
          {i.minutes ? `, ${i.est ? '~' : ''}${fmtHours(i.minutes)}${i.est ? ' (est)' : ''}` : i.kind === 'Exam' ? ', exam time not counted' : ', hours not checked'}
          {i.login && ', needs a login'}
          {m && <>{'. Practice it in '}<a href={href('lesson', m.lessons[0].id)}>Module {m.number}</a></>}
          {i.note && <>. {i.note}</>}
        </small>
      </div>
      {next && <Badge tone="ok">Next</Badge>}
      {i.status !== 'Required' && <Badge tone={i.status === 'Optional' ? undefined : 'warn'}>{i.status}</Badge>}
    </div>
  );
}

export function SalesforcePage() {
  const p = useProgress();
  const mine = !!p.profile.sf;
  const nextId = mine ? nextSfItem(p)?.id : undefined;
  // Items come in the order you should do them: the fixed path, Salesforce courses first at every level.
  const order = new Map<string, number>();
  SF_PATH.forEach((st) => { if (st.t === 'sf') st.ids.forEach((id) => { if (!order.has(id)) order.set(id, order.size); }); });
  const sorted = (items: SfItem[]) => [...items].sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));
  const all = sfTotals(p);

  return (
    <>
      <PageHead kicker="Salesforce FDE" title="Salesforce FDE program">
        The Concretio Salesforce FDE path, version 2.2: the courses, superbadges and exams for every level. One fixed path: Associate, then FDE, then Senior FDE. The academy modules next to an item are where you practise the same skill with Claude Code.
      </PageHead>

      <div className="card" style={{ marginBottom: 14 }}>
        <b>How this works.</b> <span className="muted">Tick an item when you finish it. Nothing here is locked or graded by the academy: superbadges and exams are the proof. Items marked "needs a login" open once you are signed in to Trailhead or the partner site.</span>
      </div>

      <Card>
        <div className="tfacts">
          <div><small>Required items done</small><span>{all.done} of {all.total}</span></div>
          <div><small>Learning time</small><span>{fmtHours(all.doneMin)} of about {fmtHours(all.totalMin)}</span><span className="muted small">Exam sitting time and items without a published duration are not counted. The in-person FDE workshop (about 16 h) is a pending decision and is left out.</span></div>
        </div>
        <div style={{ margin: '10px 0' }}><Bar value={all.pct} tone={all.pct === 100 ? 'ok' : undefined} /></div>
        {mine
          ? <button className="btn sm" onClick={() => actions.setSfLevel(null)}>I am not on this program</button>
          : <button className="btn sm primary" onClick={() => actions.setSfLevel('associate')}>I am on this program</button>}
      </Card>

      {mine && <p className="small muted" style={{ marginTop: 10 }}>Not sure what to do first? Your <a href={href('journey')}>Journey</a> shows these items in order, with the Claude courses and academy modules after the Salesforce courses of each level.</p>}

      {SF_LEVELS.map((l) => {
        const s = sfLevelStats(p, l);
        return (
          <div key={l.id} className="tgroup">
            <div className="jstage">{l.title}, {l.years}. {s.done} of {s.total} required items done</div>
            <p className="small muted" style={{ margin: '0 0 8px' }}>{l.owns}</p>
            {l.stages.map((st) => (
              <div key={st.id}>
                {l.stages.length > 1 && <div className="small muted" style={{ fontWeight: 700, margin: '8px 0 4px' }}>{st.title}{st.sub ? `, ${st.sub.toLowerCase()}` : ''}</div>}
                <div className="tlist">{sorted(st.items).map((i) => <Row key={i.id} i={i} done={!!p.sf[i.id]?.done} next={i.id === nextId} />)}</div>
              </div>
            ))}
          </div>
        );
      })}

      <p className="small muted" style={{ marginTop: 14 }}>
        Source: Concretio Salesforce FDE Program v2.2, with the changes agreed in review marked "Review" in the notes. The FDE Agentforce workshop is still a pending decision in the program.
      </p>
    </>
  );
}

/** Totals across the whole fixed path. */
function sfTotals(p: Progress) {
  const req = requiredSfItems();
  const done = req.filter((i) => p.sf[i.id]?.done);
  return { total: req.length, done: done.length, pct: req.length ? Math.round((done.length / req.length) * 100) : 0, doneMin: done.reduce((a, i) => a + (i.minutes ?? 0), 0), totalMin: sfMinutes(req) };
}

/** Small card for the dashboard, shown only to learners on the program. */
export function SalesforceCard() {
  const p = useProgress();
  if (!p.profile.sf) return null;
  const s = sfTotals(p);
  const next = nextSfItem(p);
  return (
    <Card>
      <div className="small muted" style={{ textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700 }}>Salesforce FDE program</div>
      <h3 style={{ margin: '4px 0 8px' }}>{s.done} of {s.total} required items done</h3>
      <Bar value={s.pct} tone={s.pct === 100 ? 'ok' : undefined} />
      <p className="small" style={{ margin: '10px 0 0' }}>
        {next ? <>Next: <a href={href('salesforce')}>{next.title}</a></> : <a href={href('salesforce')}>All required items done. Review the path.</a>}
      </p>
    </Card>
  );
}
