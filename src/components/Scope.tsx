import { actions, useProgress } from '../lib/store';

/** One line that says what is hidden for this learner and lets them show it. Hidden never means locked. */
export function ScopeToggle() {
  const p = useProgress();
  const sf = !!p.profile.sf;
  const all = p.profile.all;
  const text = sf
    ? (all ? 'Showing every academy module, not only the ones in your Salesforce path.' : 'Showing your Salesforce path. The other academy modules are hidden, not locked.')
    : (all ? 'Showing the Salesforce FDE program as well.' : 'Salesforce FDE program content is hidden, not locked.');
  const action = sf ? (all ? 'Show only my path' : 'Show every module') : (all ? 'Hide Salesforce content' : 'Show Salesforce content');
  return (
    <p className="small muted scopebar">
      {text}{' '}
      <button className="linklike" onClick={() => actions.setShowAll(!all)}>{action}</button>
    </p>
  );
}
