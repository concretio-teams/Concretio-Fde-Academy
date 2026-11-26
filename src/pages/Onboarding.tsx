import { useCallback, useEffect, useRef, useState } from 'react';
import { openTree } from '../components/Tree';
import { LOGO_FULL } from '../components/Sidebar';
import { useAuth } from '../lib/auth';
import { buildPlan } from '../lib/plan';
import { hours, nextAction } from '../lib/stats';
import { actions, getProgress, useProgress, type Goal, type SfLevel, type TimeBudget, type Track } from '../lib/store';
import { GOALS, SF_CHOICES, TIMES, TRACKS } from '../lib/tracks';
import { Button } from '../ui';
import { Icon, type IconName } from '../ui/icons';

const TRACK_ICON: Record<Track, IconName> = { new: 'flag', some: 'play', pro: 'award' };
const GOAL_ICON: Record<Goal, IconName> = { basics: 'book', client: 'route', career: 'award' };
type StepId = 'welcome' | 'sf' | 'track' | 'goal' | 'time' | 'plan';
const SF_ICON: Record<string, IconName> = { none: 'list', associate: 'route' };

interface Opt { id: string; title: string; sub?: string; icon: IconName }

/** First sign-in only: a short guided setup, one question at a time, ending in the learner's plan. */
export function Onboarding() {
  const auth = useAuth();
  const p = useProgress();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');
  const [track, setTrack] = useState<Track | null>(p.track);
  const [sfAns, setSfAns] = useState<SfLevel | 'none' | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [time, setTime] = useState<TimeBudget | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  // Salesforce learners skip the level and goal questions: the fixed path starts at Module 1 and recommends the whole academy.
  const sf: SfLevel | null = sfAns && sfAns !== 'none' ? sfAns : null;
  const steps: StepId[] = ['welcome', 'sf', ...(sf ? [] : ['track' as StepId, 'goal' as StepId]), 'time', 'plan'];
  const id = steps[step];
  const LAST = steps.length - 1;
  const questions = steps.length - 2;
  const first = (auth.user?.name || auth.user?.email || '').split(/[\s@]/)[0];
  const to = useCallback((n: number, d: 'fwd' | 'back') => { setDir(d); setStep(n); }, []);
  // Picking an answer moves on by itself after a beat, so it feels like a conversation, not a form.
  const choose = (set: () => void) => { set(); clearTimeout(timer.current); timer.current = setTimeout(() => to(step + 1, 'fwd'), 320); };

  const plan = buildPlan(p, sf ? null : track, goal, time, sf);
  const finish = () => {
    if (sf) { if (!p.track) actions.setTrack('new'); } else if (track) actions.setTrack(track);
    actions.setProfile(sf ? null : goal, time, sf);
    // Salesforce learners see their whole ordered path first; everyone else goes straight to the first step.
    window.location.hash = sf ? '#/journey' : nextAction(getProgress()).href;
    openTree('intro'); // with the growth tree on top, which then shrinks into the sidebar
  };
  const skip = () => {
    if (!sf && track) actions.setTrack(track);
    actions.setProfile(null, null, sf);
    window.location.hash = '#/';
  };

  const options: Opt[] | null =
    id === 'sf' ? SF_CHOICES.map((c) => ({ id: c.id, title: c.title, sub: c.sub, icon: SF_ICON[c.id] }))
    : id === 'track' ? TRACKS.map((t) => ({ id: t.id, title: t.title, sub: t.who, icon: TRACK_ICON[t.id] }))
    : id === 'goal' ? GOALS.map((g) => ({ id: g.id, title: g.title, sub: g.sub, icon: GOAL_ICON[g.id] }))
    : id === 'time' ? TIMES.map((t) => ({ id: t.id, title: t.title, icon: 'list' as IconName }))
    : null;
  const selected = id === 'sf' ? sfAns : id === 'track' ? track : id === 'goal' ? goal : id === 'time' ? time : null;
  const pick = (v: string) => choose(() => { if (id === 'sf') setSfAns(v as SfLevel | 'none'); else if (id === 'track') setTrack(v as Track); else if (id === 'goal') setGoal(v as Goal); else setTime(v as TimeBudget); });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (options && n >= 1 && n <= options.length) pick(options[n - 1].id);
      else if (e.key === 'Enter' && id === 'welcome') to(1, 'fwd');
      else if (e.key === 'Enter' && id === 'plan') finish();
      else if (e.key === 'ArrowLeft' && step > 0) to(step - 1, 'back');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const TITLE: Record<string, string> = { sf: 'Are you on the Concretio Salesforce FDE program?', track: 'Where are you starting from?', goal: 'What do you want from the academy?', time: 'How much time can you give it each week?' };
  const HINT: Record<string, string> = {
    sf: 'If yes, you get one fixed path with every Claude module: the Salesforce courses first, then Claude Code and vibe coding. Nothing is locked.',
    track: 'Pick the closest. You can change this later.', goal: 'This decides how much of the path we recommend.', time: 'Only used to estimate how long your plan takes.',
  };
  const title = TITLE[id] ?? '';
  const hint = HINT[id] ?? '';

  return (
    <div className="onb">
      <header className="onbtop">
        <img src={LOGO_FULL} alt="Concretio" height={26} />
        {step > 0 && step < LAST && (
          <div className="onbprog" role="progressbar" aria-valuemin={1} aria-valuemax={questions} aria-valuenow={step} aria-label={`Question ${step} of ${questions}`}>
            <i style={{ width: `${(step / questions) * 100}%` }} />
          </div>
        )}
        <button className="linklike" onClick={skip}>Skip setup</button>
      </header>

      <main className="onbmain">
        <div key={step} className={`obstep ${dir}`}>
          {id === 'welcome' && (
            <div className="onbwelcome">
              <div className="kicker">Welcome{first ? `, ${first}` : ''}</div>
              <h1>Let us build your plan.</h1>
              <p className="muted">A few quick questions, about half a minute. We use them to suggest where to start and how much to do. Nothing you pick locks anything: every module and page stays open.</p>
              <Button variant="primary" onClick={() => to(1, 'fwd')}>Get started</Button>
              <p className="small muted" style={{ marginTop: 10 }}>Press Enter to begin.</p>
            </div>
          )}

          {step > 1 && (
            <button type="button" className="btn sm onbbackbtn" onClick={() => to(step - 1, 'back')}>{'< Back'}</button>
          )}

          {options && (
            <>
              <div className="small muted onbstep">Question {step} of {questions}</div>
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

          {id === 'plan' && (
            <div>
              <div className="kicker">All set{first ? `, ${first}` : ''}</div>
              <h1>Your plan is ready.</h1>
              {plan ? (
                <>
                  <div className="obstats">
                    <div><b>{plan.modules.length}</b><span>module{plan.modules.length === 1 ? '' : 's'}</span></div>
                    <div><b>{hours(plan.minutesLeft).replace('about ', '')}</b><span>{plan.sf ? 'of lessons, practice and Salesforce courses' : 'of lessons and practice'}</span></div>
                    {plan.weeks && <div><b>{plan.weeks}</b><span>week{plan.weeks === 1 ? '' : 's'} at {plan.hoursPerWeek} h a week</span></div>}
                  </div>
                  <ol className="obmods">
                    {plan.modules.slice(0, 4).map((m, i) => <li key={m.id} style={{ ['--i' as string]: i }}><span>Module {m.number}</span><b>{m.title}</b></li>)}
                    {plan.modules.length > 4 && <li style={{ ['--i' as string]: 4 }}><span>and</span><b>{plan.modules.length - 4} more</b></li>}
                  </ol>
                  <p className="small muted">{plan.sf ? 'Your path is fixed: Associate, then FDE, then Senior FDE, with the Salesforce courses first and the Claude courses and modules after them at each level. ' : ''}{plan.rest.length > 0 && <>The other {plan.rest.length} module{plan.rest.length === 1 ? ' is' : 's are'} {plan.sf ? 'hidden, not locked: you can show ' : 'still open whenever you want '}{plan.rest.length === 1 ? 'it' : 'them'}{plan.sf ? ' any time.' : '.'}</>}</p>
                </>
              ) : <p className="muted">We could not build a plan from those answers. Go back and pick a goal.</p>}
              <div className="row" style={{ marginTop: 6 }}>
                <Button variant="primary" onClick={finish} disabled={!plan}>Start learning</Button>
              </div>
            </div>
          )}
        </div>

        {step === 1 && (
          <button className="onbback linklike" onClick={() => to(0, 'back')}>Back</button>
        )}
      </main>
    </div>
  );
}
