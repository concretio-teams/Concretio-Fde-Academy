// End to end API test against the real Express app with a temporary JSON store and a fake Google. Run: npm run test:api
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const dir = mkdtempSync(path.join(tmpdir(), 'academy-smoke-'));
const DATA_FILE = path.join(dir, 'db.json');
process.env.DATA_FILE = DATA_FILE;
delete process.env.DATABASE_URL;
process.env.JWT_SECRET = 'smoke-test-secret-0123456789';
process.env.DATA_KEY = Buffer.from('0123456789abcdef0123456789abcdef').toString('base64');
process.env.ALLOWED_EMAIL_DOMAINS = 'concret.io';
process.env.ADMIN_EMAILS = 'boss@concret.io';
process.env.NODE_ENV = 'test';

// A stand in for Google: the "code" decides who signs in.
const people: Record<string, { sub: string; email: string; emailVerified: boolean; name: string }> = {
  mgr: { sub: 'g-mgr', email: 'mgr@concret.io', emailVerified: true, name: 'Mia Manager' },
  lea: { sub: 'g-lea', email: 'lea@concret.io', emailVerified: true, name: 'Lea Learner' },
  outsider: { sub: 'g-out', email: 'x@gmail.com', emailVerified: true, name: 'Outsider' },
  unverified: { sub: 'g-unv', email: 'unv@concret.io', emailVerified: false, name: 'Unverified' },
  impostor: { sub: 'g-other', email: 'lea@concret.io', emailVerified: true, name: 'Impostor' },
};
const fakeGoogle = {
  authUrl: (p: { state: string }) => `https://accounts.example/auth?state=${p.state}`,
  exchange: async (p: { code: string }) => { const x = people[p.code]; if (!x) throw new Error('bad code'); return x; },
};

const { createApp } = await import('../server/app.js');
const server = createApp({ google: fakeGoogle }).listen(0);
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;

let failed = 0;
const check = (name: string, ok: boolean, extra = '') => { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  ' + extra}`); };

class Client {
  jar: Record<string, string> = {};
  get cookie() { return Object.entries(this.jar).map(([k, v]) => `${k}=${v}`).join('; '); }
  eat(r: Response) {
    for (const sc of r.headers.getSetCookie?.() ?? []) {
      const [pair] = sc.split(';'); const i = pair.indexOf('=');
      const k = pair.slice(0, i), v = pair.slice(i + 1);
      if (v) this.jar[k] = v; else delete this.jar[k];
    }
  }
  async call(method: string, url: string, body?: unknown) {
    const r = await fetch(base + url, { method, redirect: 'manual', headers: { 'Content-Type': 'application/json', ...(this.cookie ? { Cookie: this.cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
    this.eat(r);
    return { s: r.status, loc: r.headers.get('location') ?? '', j: (await r.json().catch(() => null)) as any };
  }
  /** Full Google round trip against the fake. */
  async google(code: string, tamperState = false) {
    const start = await this.call('GET', '/api/auth/google');
    const state = new URL(start.loc).searchParams.get('state')!;
    return this.call('GET', `/api/auth/google/callback?code=${code}&state=${tamperState ? 'wrong' : state}`);
  }
}

try {
  const a = new Client();
  check('health', (await a.call('GET', '/api/health')).j?.ok === true);
  check('config reports google and password', (await a.call('GET', '/api/auth/config')).j?.google === true);
  check('progress needs login', (await a.call('GET', '/api/progress')).s === 401);

  // ---- password accounts (kept until Google is the only way in) ----
  check('signup rejects other domains', (await a.call('POST', '/api/auth/signup', { email: 'x@gmail.com', password: 'longenough1' })).s === 403);
  check('signup rejects short password', (await a.call('POST', '/api/auth/signup', { email: 'a@concret.io', password: 'short' })).s === 400);
  check('signup ok', (await a.call('POST', '/api/auth/signup', { email: 'a@concret.io', password: 'longenough1', name: 'Alice Secret' })).s === 201);
  check('duplicate signup rejected', (await new Client().call('POST', '/api/auth/signup', { email: 'a@concret.io', password: 'longenough1' })).s === 409);
  check('wrong password rejected', (await new Client().call('POST', '/api/auth/login', { email: 'a@concret.io', password: 'wrongwrong1' })).s === 401);

  const data = { theme: 'dark', lessonsViewed: {}, lessonsManual: {}, quiz: {}, exercises: { e1: { done: true, attempts: 1 } }, assignments: { 'm2-a1': { checked: [0], done: true, notes: 'PRIVATE-NOTES-evidence' } }, final: null, finalPractical: {}, days: ['2026-01-01'], history: [] };
  check('save progress', (await a.call('PUT', '/api/progress', { data })).s === 200);
  const got = await a.call('GET', '/api/progress');
  check('progress round trip through encryption', got.j?.data?.exercises?.e1?.done === true && got.j?.data?.assignments?.['m2-a1']?.notes === 'PRIVATE-NOTES-evidence');

  const b = new Client();
  await b.call('POST', '/api/auth/login', { email: 'a@concret.io', password: 'longenough1' });
  await b.call('PUT', '/api/progress', { data: { ...data, exercises: { e2: { done: true, attempts: 1 } } } });
  const merged = (await a.call('GET', '/api/progress')).j?.data;
  check('two devices merge, nothing lost', merged?.exercises?.e1?.done && merged?.exercises?.e2?.done);

  // ---- roles ----
  const me = (await a.call('GET', '/api/auth/me')).j?.user;
  check('new account is a learner', me?.role === 'learner' && me?.admin === false);
  check('learner cannot read cohort', (await a.call('GET', '/api/admin/cohort')).s === 403);
  check('learner cannot list users', (await a.call('GET', '/api/admin/users')).s === 403);

  const boss = new Client();
  await boss.call('POST', '/api/auth/signup', { email: 'boss@concret.io', password: 'longenough1', name: 'Boss' });
  check('ADMIN_EMAILS person is admin', (await boss.call('GET', '/api/auth/me')).j?.user?.role === 'admin');

  // ---- Google sign in ----
  const g = new Client();
  const ok = await g.google('lea');
  check('google sign in redirects home', ok.s === 302 && ok.loc.endsWith('/#/'), ok.loc);
  check('google user is signed in as learner', (await g.call('GET', '/api/auth/me')).j?.user?.email === 'lea@concret.io');
  const bad1 = new Client(); const r1 = await bad1.google('lea', true);
  check('tampered state is refused', r1.loc.includes('error=') && (await bad1.call('GET', '/api/auth/me')).s === 401);
  const bad2 = new Client(); const r2 = await bad2.google('outsider');
  check('other domain refused', r2.loc.includes('error=') && (await bad2.call('GET', '/api/auth/me')).s === 401);
  const bad3 = new Client(); const r3 = await bad3.google('unverified');
  check('unverified google email refused', r3.loc.includes('error=') && (await bad3.call('GET', '/api/auth/me')).s === 401);
  const bad4 = new Client(); const r4 = await bad4.google('impostor');
  check('same email from a different google account refused', r4.loc.includes('error=') && (await bad4.call('GET', '/api/auth/me')).s === 401);
  const bad5 = new Client();
  check('callback without a started sign in refused', (await bad5.call('GET', '/api/auth/google/callback?code=lea&state=x')).loc.includes('error='));

  const gm = new Client();
  await gm.google('mgr');
  const users = (await boss.call('GET', '/api/admin/users')).j?.users ?? [];
  const mgrId = users.find((u: any) => u.email === 'mgr@concret.io')?.id;
  const leaId = users.find((u: any) => u.email === 'lea@concret.io')?.id;
  const bossId = users.find((u: any) => u.email === 'boss@concret.io')?.id;
  check('admin sees all users', users.length === 4, String(users.length));

  check('admin promotes a manager', (await boss.call('PATCH', `/api/admin/users/${mgrId}/role`, { role: 'manager' })).s === 200);
  check('manager can read cohort', (await gm.call('GET', '/api/admin/cohort')).s === 200);
  check('manager cannot list users or change roles', (await gm.call('GET', '/api/admin/users')).s === 403 && (await gm.call('PATCH', `/api/admin/users/${leaId}/role`, { role: 'admin' })).s === 403);
  check('learner cannot change roles', (await g.call('PATCH', `/api/admin/users/${mgrId}/role`, { role: 'learner' })).s === 403);
  check('admin cannot change own role', (await boss.call('PATCH', `/api/admin/users/${bossId}/role`, { role: 'learner' })).s === 400);
  check('invalid role rejected', (await boss.call('PATCH', `/api/admin/users/${leaId}/role`, { role: 'owner' })).s === 400);
  check('demoted manager loses access at once', (await boss.call('PATCH', `/api/admin/users/${mgrId}/role`, { role: 'learner' })).s === 200 && (await gm.call('GET', '/api/admin/cohort')).s === 403);

  const cohort = await boss.call('GET', '/api/admin/cohort');
  check('cohort lists everyone', cohort.s === 200 && cohort.j?.learners?.length === 4);
  const text = JSON.stringify(cohort.j) + JSON.stringify((await boss.call('GET', '/api/admin/users')).j);
  check('api never returns password hashes', !text.includes('passwordHash') && !text.includes('$2a$') && !text.includes('$2b$'));

  // ---- security checks ----
  check('cross origin write blocked', (await fetch(base + '/api/progress', { method: 'PUT', headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example', Cookie: a.cookie }, body: '{}' })).status === 403);

  // ---- encryption at rest ----
  await new Promise((r) => setTimeout(r, 300)); // let the file store finish writing
  const raw = readFileSync(DATA_FILE, 'utf8');
  check('database holds no plaintext email', !/concret\.io/i.test(raw) && !raw.includes('@'));
  check('database holds no plaintext name', !raw.includes('Alice Secret') && !raw.includes('Mia Manager'));
  check('database holds no plaintext progress or notes', !raw.includes('PRIVATE-NOTES') && !raw.includes('evidence'));
  check('database holds no Google subject id', !raw.includes('g-lea') && !raw.includes('g-mgr'));

  // ---- turn passwords off (the target state once Google works) ----
  process.env.AUTH_PASSWORD = 'off';
  check('password login can be switched off', (await new Client().call('POST', '/api/auth/login', { email: 'a@concret.io', password: 'longenough1' })).s === 403);
  check('google still works with passwords off', (await new Client().google('lea')).s === 302);
  delete process.env.AUTH_PASSWORD;

  check('logout works', (await a.call('POST', '/api/auth/logout')).s === 200);
} finally {
  server.close();
  rmSync(dir, { recursive: true, force: true });
}
console.log(failed ? `\n${failed} check(s) failed` : '\nAll API checks passed');
process.exit(failed ? 1 : 0);
