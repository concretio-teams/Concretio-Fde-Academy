import { modules } from '../content';
import { href } from '../lib/router';
import { moduleStats } from '../lib/stats';
import { useProgress } from '../lib/store';
import { COVER_LABEL, TIERS, coverCounts, type Area, type Coverage, type RoadmapItem } from '../lib/tiers';
import { Badge, Card, PageHead, Progress } from '../ui';

const AREAS: Area[] = ['Technical', 'Client skills', 'Both'];
const TONE: Record<Coverage, 'ok' | 'accent' | 'warn' | undefined> = { academy: 'ok', partial: 'accent', external: undefined, gap: 'warn' };

function ItemRow({ i }: { i: RoadmapItem }) {
  const m = i.module ? modules.find((x) => x.id === i.module) : undefined;
  return (
    <div className="titem">
      <div className="ttext">
        <b>{i.title}</b>
        <small>
          {i.status}{i.hours ? `, ${i.hours} h planned` : ', hours not stated'}
          {m && <>{', '}<a href={href('lesson', m.lessons[0].id)}>Module {m.number}</a></>}
          {i.note && <>. {i.note}</>}
        </small>
      </div>
      <Badge tone={TONE[i.cover]}>{COVER_LABEL[i.cover]}</Badge>
    </div>
  );
}

export function TiersPage({ tier }: { tier?: string }) {
  const p = useProgress();
  const t = TIERS.find((x) => String(x.n) === tier) ?? TIERS[0];
  const mods = t.modules.map((id) => modules.find((m) => m.id === id)).filter((m): m is NonNullable<typeof m> => !!m);
  const pct = mods.length ? Math.round(mods.reduce((s, m) => s + moduleStats(p, m).pct, 0) / mods.length) : 0;
  const counts = coverCounts(t);
  const total = t.items.length;

  return (
    <>
      <PageHead kicker="Tiers" title="Career tiers">
        Four levels from the FDE roadmap, from first components to leading engagements. Pick a tier to see what it asks for and how much of it the academy already teaches.
      </PageHead>

      <div className="card" style={{ marginBottom: 14 }}>
        <b>Draft.</b> <span className="muted">This is an idea from one team member's research. Hours, exams and prices come from that draft and are not verified. Nothing on this page is tracked or required yet.</span>
      </div>

      <nav className="tierbar" aria-label="Tiers">
        {TIERS.map((x) => (
          <a key={x.n} href={href('tiers', String(x.n))} className={`tierbtn ${x.n === t.n ? 'on' : ''}`} aria-current={x.n === t.n ? 'page' : undefined}>
            <b>Tier {x.n}</b>
            <small>{x.years}</small>
          </a>
        ))}
      </nav>

      <Card>
        <div className="small muted" style={{ textTransform: 'uppercase', letterSpacing: '.06em', fontWeight: 700 }}>Tier {t.n}, {t.years}</div>
        <h2 style={{ margin: '4px 0 8px' }}>{t.title}</h2>
        <p style={{ margin: '0 0 8px' }}>{t.outcome}</p>
        <div className="tfacts">
          <div><small>Exit</small><span>{t.exit}</span></div>
          <div><small>Time</small><span>{t.hours}</span><span className="muted small">{t.weeks}</span></div>
          {t.built && <div><small>Academy covers</small><span>{counts.academy + counts.partial} of {total} items, at least in part</span></div>}
        </div>
      </Card>

      {mods.length > 0 && (
        <>
          <h3 className="tsec">Academy modules in this tier <span className="muted small">{pct}% complete</span></h3>
          <div className="tmods">
            {mods.map((m) => {
              const s = moduleStats(p, m);
              return (
                <a key={m.id} className="tmod" href={href('lesson', m.lessons[0].id)}>
                  <span className="tnum">{s.complete ? '✓' : m.number}</span>
                  <span className="ttext"><b>{m.title}</b><small>{m.level}, {s.lessonsDone}/{s.lessonsTotal} lessons, {s.assignmentsDone}/{s.assignmentsTotal} assignments</small></span>
                  <span className="jpct">{s.pct}%</span>
                </a>
              );
            })}
          </div>
          <div style={{ marginTop: 6 }}><Progress value={pct} /></div>
        </>
      )}

      {!t.built && (
        <>
          <h3 className="tsec">Not built yet</h3>
          <Card>
            <p style={{ margin: 0 }}>There is no academy content for this tier yet. The draft covers: {t.topics}</p>
            <p className="small muted" style={{ margin: '8px 0 0' }}>It makes sense to build this after Tiers 1 and 2 work and have a first cohort through them.</p>
          </Card>
        </>
      )}

      {t.items.length > 0 && (
        <>
          <h3 className="tsec">Everything the draft lists for this tier</h3>
          <p className="small muted" style={{ margin: '0 0 8px' }}>
            {counts.academy} in the academy, {counts.partial} partly, {counts.external} external, {counts.gap} not covered yet. Course links are left out until they are verified.
          </p>
          {AREAS.map((a) => {
            const rows = t.items.filter((i) => i.area === a);
            if (!rows.length) return null;
            return (
              <div key={a} className="tgroup">
                <div className="jstage">{a} ({rows.length})</div>
                <div className="tlist">{rows.map((i) => <ItemRow key={i.title} i={i} />)}</div>
              </div>
            );
          })}
        </>
      )}

      <h3 className="tsec">Gates to pass this tier</h3>
      <p className="small muted" style={{ margin: '0 0 8px' }}>The draft says finishing the courses is not enough. People review these, so the academy does not track them yet.</p>
      <div className="tlist">
        {t.gates.map((g) => (
          <div key={g.name} className="titem">
            <div className="ttext"><b>{g.name}</b><small>{g.detail}</small></div>
            <Badge>Reviewed by people</Badge>
          </div>
        ))}
      </div>
    </>
  );
}
