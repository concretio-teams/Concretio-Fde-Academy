import { useEffect, useState } from 'react';
import { LOGO_FULL } from '../components/Sidebar';
import { signIn } from '../lib/auth';
import { Button } from '../ui';

const SEEN_KEY = 'cca-has-account';
const POINTS: [string, string][] = [
  ['Short lessons, each with a quiz', 'Learn Claude Code the way client teams use it.'],
  ['Hands-on practice', 'Exercises and assignments on real code, not slides.'],
  ['A plan that fits you', 'Tell us your level, goal and time. We build the path.'],
];

/** The first page for anyone who is not signed in. The whole academy sits behind it. */
export function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>(() => { try { return localStorage.getItem(SEEN_KEY) === '1' ? 'login' : 'signup'; } catch { return 'signup'; } });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  // A refused Google sign in (wrong domain, cancelled) comes back with the reason in the address.
  const [error, setError] = useState(() => new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('error') ?? '');
  const [googleOn, setGoogleOn] = useState(false);
  useEffect(() => {
    fetch('/api/auth/config', { credentials: 'same-origin' }).then((r) => r.json()).then((c) => setGoogleOn(!!c.google)).catch(() => setGoogleOn(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    const err = await signIn(mode, email, password, name);
    setBusy(false);
    if (err) setError(err);
    else { try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ } }
  };

  return (
    <div className="authwrap">
      <aside className="authside">
        <img src={LOGO_FULL} alt="Concretio" height={30} />
        <div className="authpitch">
          <div className="kicker">FDE Academy</div>
          <h1>Learn to build with Claude Code, the way client teams do.</h1>
          <ul>
            {POINTS.map(([t, d]) => <li key={t}><b>{t}</b><span>{d}</span></li>)}
          </ul>
        </div>
        <small>Concretio FDE Academy</small>
      </aside>

      <main className="authmain">
        <div className="authcard">
          <div className="seg" role="tablist" aria-label="Account">
            <button role="tab" aria-selected={mode === 'signup'} className={mode === 'signup' ? 'on' : ''} onClick={() => { setMode('signup'); setError(''); }}>Create account</button>
            <button role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'on' : ''} onClick={() => { setMode('login'); setError(''); }}>Sign in</button>
          </div>
          <h2>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h2>
          <p className="muted small">{mode === 'signup' ? 'Use your Concretio work email. Your progress is saved to your account and follows you to any device.' : 'Sign in to pick up where you left off.'}</p>
          {googleOn && (
            <>
              <a className="btn" href="/api/auth/google" style={{ display: 'block', textAlign: 'center', marginBottom: 4 }}>Continue with Google</a>
              <p className="small muted" style={{ textAlign: 'center', margin: '10px 0' }}>or use your email and password</p>
            </>
          )}
          <form onSubmit={submit} className="stack" aria-label={mode === 'login' ? 'Sign in' : 'Create account'}>
            {mode === 'signup' && (
              <label>Name<input type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></label>
            )}
            <label>Work email<input type="text" inputMode="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required /></label>
            <label>Password
              <input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={mode === 'signup' ? 'At least 8 characters' : 'Your password'} required style={{ width: '100%', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 9, padding: '8px 10px', font: 'inherit' }} />
            </label>
            {error && <div className="feedback bad" role="alert">{error}</div>}
            <Button variant="primary" type="submit" disabled={busy || !email || !password}>{busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account and continue'}</Button>
          </form>
        </div>
      </main>
    </div>
  );
}
