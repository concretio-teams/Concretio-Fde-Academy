import { useEffect, useState } from 'react';
import { signOut, signIn, useAuth } from '../lib/auth';
import { go } from '../lib/router';
import { Badge, Button, Card, PageHead } from '../ui';

export function syncLabel(a: ReturnType<typeof useAuth>): string {
  if (a.sync === 'saving') return 'Saving...';
  if (a.sync === 'error') return 'Offline, will retry';
  if (a.sync === 'saved') return 'Saved to your account';
  return 'Signed in';
}

export function LoginPage() {
  const auth = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  // When Google sign in is refused (for example a wrong domain) the server sends the reason back in the address.
  const [error, setError] = useState(() => new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('error') ?? '');
  const [googleOn, setGoogleOn] = useState(false);
  useEffect(() => {
    fetch('/api/auth/config', { credentials: 'same-origin' }).then((r) => r.json()).then((c) => setGoogleOn(!!c.google)).catch(() => setGoogleOn(false));
  }, []);

  if (auth.status === 'user' && auth.user) {
    return (
      <>
        <PageHead kicker="Account" title="You are signed in" />
        <Card>
          <div className="row spread">
            <div><b>{auth.user.name}</b><div className="muted small">{auth.user.email}</div></div>
            <Badge tone={auth.sync === 'error' ? 'warn' : 'ok'}>{syncLabel(auth)}</Badge>
          </div>
          <p className="muted small" style={{ marginTop: 10 }}>Your progress, quiz scores and assignments sync automatically and follow you to any device.</p>
          <div className="row">
            <Button variant="primary" onClick={() => go()}>Back to dashboard</Button>
            <Button onClick={() => { void signOut().then(() => go()); }}>Sign out</Button>
          </div>
        </Card>
      </>
    );
  }

  if (auth.status === 'unavailable') {
    return (
      <>
        <PageHead kicker="Account" title="Accounts are not available here" />
        <Card>
          <p>The API server is not reachable, so progress is saved in this browser only. Everything else works normally.</p>
          <p className="small muted">Running locally? Start both the web app and the API with <code>npm run dev:full</code>, then reload. On a deployed site, check <code>/api/health</code> and that <code>JWT_SECRET</code> and <code>DATABASE_URL</code> are set.</p>
          <div className="row"><Button variant="primary" onClick={() => window.location.reload()}>Retry</Button><Button onClick={() => go()}>Back to dashboard</Button></div>
        </Card>
      </>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError('');
    const err = await signIn(mode, email, password, name);
    setBusy(false);
    if (err) setError(err); else go();
  };

  return (
    <>
      <PageHead kicker="Account" title={mode === 'login' ? 'Sign in to save your progress' : 'Create your account'}>
        Progress you already made in this browser is kept and merged into your account, so nothing is lost.
      </PageHead>
      <div style={{ maxWidth: 440 }}>
        <Card>
          {googleOn && (
            <>
              <a className="btn" href="/api/auth/google" style={{ display: 'block', textAlign: 'center' }}>Continue with Google</a>
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
            <Button variant="primary" type="submit" disabled={busy || !email || !password}>{busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}</Button>
          </form>
          <p className="small muted" style={{ marginTop: 12 }}>
            {mode === 'login' ? 'New here? ' : 'Already have an account? '}
            <a href="#/login" onClick={(e) => { e.preventDefault(); setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</a>
          </p>
        </Card>
        <p className="small muted" style={{ marginTop: 10 }}>You can keep learning without an account. Signing in only adds cloud saving.</p>
      </div>
    </>
  );
}
