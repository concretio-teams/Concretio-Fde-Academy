import { useCallback, useEffect, useRef, useState } from 'react';
import { openTree } from '../components/Tree';
import { LOGO_FULL } from '../components/Sidebar';
import { useAuth } from '../lib/auth';
import { buildPlan } from '../lib/plan';
import { hours, nextAction } from '../lib/stats';
import { actions, getProgress, useProgress, type Goal, type TimeBudget, type Track } from '../lib/store';
import { GOALS, TIMES, TRACKS } from '../lib/tracks';
import { Button } from '../ui';
import { Icon, type IconName } from '../ui/icons';

const TRACK_ICON: Record<Track, IconName> = { new: 'flag', some: 'play', pro: 'award' };
const GOAL_ICON: Record<Goal, IconName> = { basics: 'book', client: 'route', career: 'award' };
const LAST = 4; // 0 welcome, 1 level, 2 goal, 3 time, 4 plan

interface Opt { id: string; title: string; sub?: string; icon: IconName }

/** First sign-in only: a short guided setup, one question at a time, ending in the learner's plan. */
export function Onboarding() {
  const auth = useAuth();
  const p = useProgress();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');
  const [track, setTrack] = useState<Track | null>(p.track);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [time, setTime] = useState<TimeBudget | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const first = (auth.user?.name || auth.user?.email || '').split(/[\s@]/)[0];
  const to = useCallback((n: number, d: 'fwd' | 'back') => { setDir(d); setStep(n); }, []);
  // Picking an answer moves on by itself after a beat, so it feels like a conversation, not a form.
  const choose = (set: () => void) => { set(); clearTimeout(timer.current); timer.current = setTimeout(() => to(step + 1, 'fwd'), 320); };

  const plan = buildPlan(p, track, goal, time);
  const finish = () => {
    if (track) actions.setTrack(track);
    actions.setProfile(goal, time);
    window.location.hash = nextAction(getProgress()).href; // straight to the first step of the plan
    openTree('intro'); // with the growth tree on top, which then shrinks into the sidebar
  };
  const skip = () => {
    if (track) actions.setTrack(track);
    actions.setProfile(null, null);
    window.location.hash = '#/';
  };

  const options: Opt[] | null =
    step === 1 ? TRACKS.map((t) => ({ id: t.id, title: t.title, sub: t.who, icon: TRACK_ICON[t.id] }))
    : step === 2 ? GOALS.map((g) => ({ id: g.id, title: g.title, sub: g.sub, icon: GOAL_ICON[g.id] }))
    : step === 3 ? TIMES.map((t) => ({ id: t.id, title: t.title, icon: 'list' as IconName }))
    : null;
  const selected = step === 1 ? track : step === 2 ? goal : step === 3 ? time : null;
  const pick = (id: string) => choose(() => { if (step === 1) setTrack(id as Track); else if (step === 2) setGoal(id as Goal); else setTime(id as TimeBudget); });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (options && n >= 1 && n <= options.length) pick(options[n - 1].id);
      else if (e.key === 'Enter' && step === 0) to(1, 'fwd');
      else if (e.key === 'Enter' && step === LAST) finish();
      else if (e.key === 'ArrowLeft' && step > 0) to(step - 1, 'back');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const title = ['', 'Where are you starting from?', 'What do you want from the academy?', 'How much time can you give it each week?'][step];
  const hint = ['', 'Pick the closest. You can change this later.', 'This decides how much of the path we recommend.', 'Only used to estimate how long your plan takes.'][step];

  return (
    <div className="onb">
      <header className="onbtop">
        <img src={LOGO_FULL} alt="Concretio" height={26} />
        {step > 0 && step < LAST && (
          <div className="onbprog" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step} aria-label={`Question ${step} of 3`}>
            <i style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        )}
        <button className="linklike" onClick={skip}>Skip setup</button>
      </header>

      <main className="onbmain">
        <div key={step} className={`obstep ${dir}`}>
          {step === 0 && (
            <div className="onbwelcome">
              <div className="kicker">Welcome{first ? `, ${first}` : ''}</div>
              <h1>Let us build your plan.</h1>
              <p className="muted">Three quick questions, about half a minute. We use them to suggest where to start and how much to do. Nothing you pick locks anything: every module and page stays open.</p>
              <Button variant="primary" onClick={() => to(1, 'fwd')}>Get started</Button>
              <p className="small muted" style={{ marginTop: 10 }}>Press Enter to begin.</p>
            </div>
          )}

          {options && (
            <>
              <div className="small muted onbstep">Question {step} of 3</div>
              <h1 className="onbq">{title}</h1>
              <p className="muted">{hint}</p>
              <div className="obopts">
                {options.map((o, i) => (
                  <button key={o.id} type="button" className={`obopt ${selected === o.id ? 'on' : ''}`} aria-pressed={selected === o.id} onClick={() => pick(o.id)} style={{ ['--i' as string]: i }}>
                    <span className="obicon"><Icon name={o.icon} size={20} /></span>
                    <span className="obtext"><b>{o.title}</b>{o.sub && <small>{o.sub}</small>}</span>
                    <span className="obkey" aria-hidden="true">{i + 1}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === LAST && (
            <div>
              <div className="kicker">All set{first ? `, ${first}` : ''}</div>
              <h1>Your plan is ready.</h1>
              {plan ? (
                <>
                  <div className="obstats">
                    <div><b>{plan.modules.length}</b><span>module{plan.modules.length === 1 ? '' : 's'}</span></div>
                    <div><b>{hours(plan.minutesLeft).replace('about ', '')}</b><span>of lessons and practice</span></div>
                    {plan.weeks && <div><b>{plan.weeks}</b><span>week{plan.weeks === 1 ? '' : 's'} at {plan.hoursPerWeek} h a week</span></div>}
                  </div>
                  <ol className="obmods">
                    {plan.modules.slice(0, 4).map((m, i) => <li key={m.id} style={{ ['--i' as string]: i }}><span>Module {m.number}</span><b>{m.title}</b></li>)}
                    {plan.modules.length > 4 && <li style={{ ['--i' as string]: 4 }}><span>and</span><b>{plan.modules.length - 4} more</b></li>}
                  </ol>
                  <p className="small muted">The other {plan.rest.length} module{plan.rest.length === 1 ? ' is' : 's are'} still open whenever you want {plan.rest.length === 1 ? 'it' : 'them'}.</p>
                </>
              ) : <p className="muted">We could not build a plan from those answers. Go back and pick a goal.</p>}
              <div className="row" style={{ marginTop: 6 }}>
                <Button variant="primary" onClick={finish} disabled={!plan}>Start learning</Button>
              </div>
            </div>
          )}
        </div>

        {step > 0 && (
          <button className="onbback linklike" onClick={() => to(step - 1, 'back')}>Back</button>
        )}
      </main>
    </div>
  );
}
