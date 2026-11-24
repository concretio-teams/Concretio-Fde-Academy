import { useEffect, useState } from 'react';
import { signOut, useAuth } from '../lib/auth';
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
  // The server sends the reason back in the address when Google sign in is refused, for example a wrong domain.
  const error = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('error') ?? '';
  const [cfg, setCfg] = useState<{ google: boolean; domains: string[] } | null>(null);
  useEffect(() => {
    fetch('/api/auth/config', { credentials: 'same-origin' }).then((r) => r.json()).then(setCfg).catch(() => setCfg({ google: false, domains: [] }));
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

  const domains = cfg?.domains?.length ? cfg.domains.map((d) => '@' + d).join(', ') : 'your company';
  return (
    <>
      <PageHead kicker="Account" title="Sign in to save your progress">
        Progress you already made in this browser is kept and merged into your account, so nothing is lost.
      </PageHead>
      <div style={{ maxWidth: 440 }}>
        <Card>
          {error && <div className="feedback bad" role="alert" style={{ marginBottom: 12 }}>{error}</div>}
          {cfg?.google === false ? (
            <p>Google sign in is not set up on this server yet. Ask an admin to add the Google credentials.</p>
          ) : (
            <a className="btn primary" href="/api/auth/google" style={{ display: 'block', textAlign: 'center' }}>Continue with Google</a>
          )}
          <p className="small muted" style={{ marginTop: 12 }}>Use your {domains} Google account. We never see or store a password.</p>
        </Card>
        <p className="small muted" style={{ marginTop: 10 }}>You can keep learning without an account. Signing in only adds cloud saving.</p>
      </div>
    </>
  );
}
