import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { buildPlan } from '../lib/plan';
import { href } from '../lib/router';
import { hours } from '../lib/stats';
import { ScopeToggle } from '../components/Scope';
import { actions, useProgress, type Goal, type SfLevel, type TimeBudget, type Track } from '../lib/store';
import { GOALS, SF_CHOICES, TIMES, TRACKS } from '../lib/tracks';
import { Button, Card, LinkButton, PageHead } from '../ui';

function Choice({ on, title, sub, onClick }: { on: boolean; title: string; sub?: string; onClick: () => void }) {
  return (
    <button type="button" className={`levelbtn choice ${on ? 'on' : ''}`} aria-pressed={on} onClick={onClick}>
      <span><b>{title}</b>{sub && <small>{sub}</small>}</span>
      <span className="go" aria-hidden="true">{on ? '✓' : ''}</span>
    </button>
  );
}

/** Three questions, asked once after the first sign-in. They shape what we recommend; nothing is locked. */
export function SetupPage() {
  const auth = useAuth();
  const p = useProgress();
  const [track, setTrack] = useState<Track | null>(p.track);
  const [sfAns, setSfAns] = useState<SfLevel | 'none'>(p.profile.sf ?? 'none');
  const sf: SfLevel | null = sfAns === 'none' ? null : sfAns;
  const [goal, setGoal] = useState<Goal | null>(p.profile.goal);
  const [time, setTime] = useState<TimeBudget | null>(p.profile.time);
  const first = !p.profile.done;

  if (auth.status !== 'user') {
    return (
      <>
        <PageHead kicker="Your plan" title="Sign in to set up your plan">
          Three quick questions give you a plan that fits your level, goal and time. Signing in also keeps your progress on every device and lets your lead see how you are doing.
        </PageHead>
        <LinkButton variant="primary" href={href('login')}>Sign in or create an account</LinkButton>
        <p className="small muted" style={{ marginTop: 10 }}>You can use the whole academy without signing in. A plan is the only thing that needs an account.</p>
      </>
    );
  }

  const preview = buildPlan(p, sf ? null : track, goal, time, sf);
  const ready = !!time && (!!sf || (!!track && !!goal));
  const missing = [...(!sf && !track ? ['2'] : []), ...(!sf && !goal ? ['3'] : []), ...(!time ? [sf ? '2' : '4'] : [])];
  const save = () => {
    if (sf) { if (!p.track) actions.setTrack('new'); } else if (track) actions.setTrack(track);
    actions.setProfile(sf ? null : goal, time, sf);
    window.location.hash = '#/';
  };
  const skip = () => {
    if (first) actions.setProfile(p.profile.goal, p.profile.time, sf);
    window.location.hash = '#/';
  };

  return (
    <>
      <PageHead kicker={first ? 'Welcome' : 'Your plan'} title={first ? (sf ? 'Two quick questions' : 'Four quick questions') : 'Change your answers'}>
        We use your answers to suggest where to start and how much to do. Nothing is hidden or locked: you can see every module and page whenever you like, and change these answers any time.
      </PageHead>

      <h2 className="q">1. Are you on the Concretio Salesforce FDE program?</h2>
      <div className="levelpick">
        {SF_CHOICES.map((c) => <Choice key={c.id} on={sfAns === c.id} title={c.title} sub={c.sub} onClick={() => setSfAns(c.id)} />)}
      </div>

      {!sf && (
        <>
          <h2 className="q">2. Where are you starting from?</h2>
          <div className="levelpick">
            {TRACKS.map((t) => <Choice key={t.id} on={track === t.id} title={t.title} sub={t.who} onClick={() => setTrack(t.id)} />)}
          </div>

          <h2 className="q">3. What do you want from the academy?</h2>
          <div className="levelpick">
            {GOALS.map((g) => <Choice key={g.id} on={goal === g.id} title={g.title} sub={g.sub} onClick={() => setGoal(g.id)} />)}
          </div>
        </>
      )}

      <h2 className="q">{sf ? '2' : '4'}. How much time can you give it each week?</h2>
      <div className="levelpick">
        {TIMES.map((t) => <Choice key={t.id} on={time === t.id} title={t.title} onClick={() => setTime(t.id)} />)}
      </div>

      <Card className="planprev">
        {preview && ready ? (
          <>
            <b>Your plan</b>
            <p style={{ margin: '4px 0 0' }}>
              {preview.modules.length} module{preview.modules.length === 1 ? '' : 's'}, {hours(preview.minutesLeft)} of lessons, assignments{sf ? ' and Salesforce courses' : ''}{preview.weeks ? `, about ${preview.weeks} week${preview.weeks === 1 ? '' : 's'} at your pace` : ''}.
              {preview.rest.length > 0 && <>The other {preview.rest.length} {sf ? 'are hidden, not locked.' : 'stay open whenever you want them.'}</>}
            </p>
          </>
        ) : (
          <span className="muted">{missing.length ? `Answer question ${missing.join(' and ')} to see your plan and save.` : 'Answer every question to see your plan.'}</span>
        )}
      </Card>

      {!first && <ScopeToggle />}
      <div className="row" style={{ marginTop: 14 }}>
        <Button variant="primary" disabled={!ready} onClick={save}>{first ? 'Save and show my plan' : 'Save my answers'}</Button>
        <Button onClick={skip}>{first ? 'Skip for now' : 'Cancel'}</Button>
      </div>
    </>
  );
}
