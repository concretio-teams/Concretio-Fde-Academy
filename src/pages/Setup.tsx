import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { buildPlan } from '../lib/plan';
import { href } from '../lib/router';
import { hours } from '../lib/stats';
import { actions, useProgress, type Goal, type TimeBudget, type Track } from '../lib/store';
import { GOALS, TIMES, TRACKS } from '../lib/tracks';
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

  const preview = buildPlan(p, track, goal, time);
  const ready = !!track && !!goal && !!time;
  const save = () => {
    if (track) actions.setTrack(track);
    actions.setProfile(goal, time);
    window.location.hash = '#/';
  };
  const skip = () => {
    if (first) actions.setProfile(p.profile.goal, p.profile.time);
    window.location.hash = '#/';
  };

  return (
    <>
      <PageHead kicker={first ? 'Welcome' : 'Your plan'} title={first ? 'Three quick questions' : 'Change your answers'}>
        We use your answers to suggest where to start and how much to do. Nothing is hidden or locked: you can see every module and page whenever you like, and change these answers any time.
      </PageHead>

      <h2 className="q">1. Where are you starting from?</h2>
      <div className="levelpick">
        {TRACKS.map((t) => <Choice key={t.id} on={track === t.id} title={t.title} sub={t.who} onClick={() => setTrack(t.id)} />)}
      </div>

      <h2 className="q">2. What do you want from the academy?</h2>
      <div className="levelpick">
        {GOALS.map((g) => <Choice key={g.id} on={goal === g.id} title={g.title} sub={g.sub} onClick={() => setGoal(g.id)} />)}
      </div>

      <h2 className="q">3. How much time can you give it each week?</h2>
      <div className="levelpick">
        {TIMES.map((t) => <Choice key={t.id} on={time === t.id} title={t.title} onClick={() => setTime(t.id)} />)}
      </div>

      <Card className="planprev">
        {preview && ready ? (
          <>
            <b>Your plan</b>
            <p style={{ margin: '4px 0 0' }}>
              {preview.modules.length} module{preview.modules.length === 1 ? '' : 's'}, {hours(preview.minutesLeft)} of lessons and assignments{preview.weeks ? `, about ${preview.weeks} week${preview.weeks === 1 ? '' : 's'} at your pace` : ''}.
              The other {preview.rest.length} stay open whenever you want them.
            </p>
          </>
        ) : (
          <span className="muted">Answer all three to see your plan.</span>
        )}
      </Card>

      <div className="row" style={{ marginTop: 14 }}>
        <Button variant="primary" disabled={!ready} onClick={save}>{first ? 'Save and show my plan' : 'Save my answers'}</Button>
        <Button onClick={skip}>{first ? 'Skip for now' : 'Cancel'}</Button>
      </div>
    </>
  );
}
