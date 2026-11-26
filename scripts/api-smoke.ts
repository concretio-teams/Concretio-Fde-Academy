// End to end API test against the real Express app with a temporary JSON store and a fake Google. Run: npm run test:api
import bcrypt from 'bcryptjs';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { emptyProgress, isForeignLocal, type ProgressData } from '../shared/progress';

const dir = mkdtempSync(path.join(tmpdir(), 'academy-smoke-'));
const DATA_FILE = path.join(dir, 'db.json');
process.env.DATA_FILE = DATA_FILE;
delete process.env.DATABASE_URL;
process.env.JWT_SECRET = 'smoke-test-secret-0123456789';
process.env.ALLOWED_EMAIL_DOMAINS = 'concret.io';
process.env.ADMIN_EMAILS = 'boss@concret.io';
process.env.NODE_ENV = 'test';

// An account made before Google sign in existed (password based), with progress. It must keep working with its
// password, and Google sign in with the same email must reach the same account.
writeFileSync(DATA_FILE, JSON.stringify({
  users: [{ id: 'old-user', email: 'old@concret.io', name: 'Old Timer', passwordHash: bcrypt.hashSync('oldpassword1', 10), googleSub: null, createdAt: 1 }],
  progress: { 'old-user': { data: { exercises: { legacy: { done: true, attempts: 1 } } }, updatedAt: 1 } },
}));

// A stand in for Google: the "code" decides who signs in.
const people: Record<string, { sub: string; email: string; emailVerified: boolean; name: string }> = {
  lea: { sub: 'g-lea', email: 'lea@concret.io', emailVerified: true, name: 'Lea Learner' },
  boss: { sub: 'g-boss', email: 'boss@concret.io', emailVerified: true, name: 'Boss' },
  old: { sub: 'g-old', email: 'old@concret.io', emailVerified: true, name: 'Old Timer' },
  oldImpostor: { sub: 'g-impostor', email: 'old@concret.io', emailVerified: true, name: 'Someone Else' },
  outsider: { sub: 'g-out', email: 'x@gmail.com', emailVerified: true, name: 'Outsider' },
  unverified: { sub: 'g-unv', email: 'unv@concret.io', emailVerified: false, name: 'Unverified' },
};
let lastAuthUrl = '';
const fakeGoogle = {
  authUrl: (p: { state: string; challenge: string; nonce: string }) => (lastAuthUrl = `https://accounts.example/auth?state=${p.state}&nonce=${p.nonce}&code_challenge=${p.challenge}`),
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
  /** The whole Google round trip against the fake. */
  async google(code: string, tamperState = false) {
    const start = await this.call('GET', '/api/auth/google');
    const state = new URL(start.loc).searchParams.get('state')!;
    return this.call('GET', `/api/auth/google/callback?code=${code}&state=${tamperState ? 'wrong' : state}`);
  }
}

try {
  const a = new Client();
  check('health', (await a.call('GET', '/api/health')).j?.ok === true);
  check('config says google is on', (await a.call('GET', '/api/auth/config')).j?.google === true);
  check('progress needs login', (await a.call('GET', '/api/progress')).s === 401);

  check('config offers both ways in', (await a.call('GET', '/api/auth/config')).j?.password === true);

  // ---- email and password still work, for new and existing people ----
  check('signup rejects other domains', (await a.call('POST', '/api/auth/signup', { email: 'x@gmail.com', password: 'longenough1' })).s === 403);
  check('signup rejects short password', (await a.call('POST', '/api/auth/signup', { email: 'a@concret.io', password: 'short' })).s === 400);
  const pw = new Client();
  check('password signup works', (await pw.call('POST', '/api/auth/signup', { email: 'pat@concret.io', password: 'longenough1', name: 'Pat Password' })).s === 201);
  check('duplicate signup is refused', (await new Client().call('POST', '/api/auth/signup', { email: 'pat@concret.io', password: 'longenough1' })).s === 409);
  check('wrong password is refused', (await new Client().call('POST', '/api/auth/login', { email: 'pat@concret.io', password: 'wrongwrong1' })).s === 401);
  const oldPw = new Client();
  check('an existing user still signs in with their password', (await oldPw.call('POST', '/api/auth/login', { email: 'old@concret.io', password: 'oldpassword1' })).s === 200 && (await oldPw.call('GET', '/api/progress')).j?.data?.exercises?.legacy?.done === true);

  // ---- Google sign in ----
  const start = await a.call('GET', '/api/auth/google');
  const q = new URL(lastAuthUrl).searchParams;
  check('sign in starts with state, nonce and PKCE', start.s === 302 && !!q.get('state') && !!q.get('nonce') && !!q.get('code_challenge'));
  const lea = new Client();
  const ok = await lea.google('lea');
  check('google sign in lands on the app', ok.s === 302 && ok.loc.endsWith('/#/'), ok.loc);
  const me = (await lea.call('GET', '/api/auth/me')).j?.user;
  check('new google user is created and signed in', me?.email === 'lea@concret.io' && me?.name === 'Lea Learner' && me?.admin === false);

  const t = new Client(); const rT = await t.google('lea', true);
  check('tampered state is refused', rT.loc.includes('error=') && (await t.call('GET', '/api/auth/me')).s === 401);
  const o = new Client(); const rO = await o.google('outsider');
  check('other email domain is refused', rO.loc.includes('error=') && (await o.call('GET', '/api/auth/me')).s === 401);
  const u = new Client(); const rU = await u.google('unverified');
  check('unverified google email is refused', rU.loc.includes('error=') && (await u.call('GET', '/api/auth/me')).s === 401);
  const n = new Client();
  check('callback without a started sign in is refused', (await n.call('GET', '/api/auth/google/callback?code=lea&state=x')).loc.includes('error='));
  const e = new Client();
  check('google error is handled', (await e.call('GET', '/api/auth/google/callback?error=access_denied')).loc.includes('error='));

  // ---- both ways lead to the same account ----
  const old = new Client();
  check('google reaches the same account as the password', (await old.google('old')).s === 302 && (await old.call('GET', '/api/auth/me')).j?.user?.id === 'old-user');
  check('old progress is there through google too', (await old.call('GET', '/api/progress')).j?.data?.exercises?.legacy?.done === true);
  check('the password still works after linking google', (await new Client().call('POST', '/api/auth/login', { email: 'old@concret.io', password: 'oldpassword1' })).s === 200);
  const imp = new Client(); const rI = await imp.google('oldImpostor');
  check('a different google account cannot take over a linked email', rI.loc.includes('error=') && (await imp.call('GET', '/api/auth/me')).s === 401);
  check('the owner can still sign in with google afterwards', (await new Client().google('old')).s === 302);
  check('a google only account has no password to guess', (await new Client().call('POST', '/api/auth/login', { email: 'lea@concret.io', password: 'anything12' })).s === 401);
  check('signing up with an email that exists via google is refused', (await new Client().call('POST', '/api/auth/signup', { email: 'lea@concret.io', password: 'longenough1' })).s === 409);

  // ---- progress sync ----
  const data = { theme: 'dark', lessonsViewed: {}, lessonsManual: {}, quiz: {}, exercises: { e1: { done: true, attempts: 1 } }, assignments: {}, final: null, finalPractical: {}, days: ['2026-01-01'], history: [] };
  check('save progress', (await lea.call('PUT', '/api/progress', { data })).s === 200);
  check('progress round trip', (await lea.call('GET', '/api/progress')).j?.data?.exercises?.e1?.done === true);
  const lea2 = new Client(); await lea2.google('lea');
  await lea2.call('PUT', '/api/progress', { data: { ...data, exercises: { e2: { done: true, attempts: 1 } } } });
  const merged = (await lea.call('GET', '/api/progress')).j?.data;
  check('two devices merge, nothing lost', merged?.exercises?.e1?.done && merged?.exercises?.e2?.done);

  // ---- an undo must stick: unticking a criterion, clearing notes, reopening ----
  await lea.call('PUT', '/api/progress', { data: { ...data, assignments: { 'x-a1': { checked: [0, 1], done: true, notes: 'my notes', u: 1000 } } } });
  await lea.call('PUT', '/api/progress', { data: { ...data, assignments: { 'x-a1': { checked: [0], done: false, notes: '', u: 2000 } } } });
  const undone = (await lea.call('GET', '/api/progress')).j?.data?.assignments?.['x-a1'];
  check('unticking a box, clearing notes and reopening all stick', JSON.stringify(undone?.checked) === '[0]' && undone?.notes === '' && undone?.done === false, JSON.stringify(undone));
  // an older device that still has the earlier version must not bring the ticks back
  await lea.call('PUT', '/api/progress', { data: { ...data, assignments: { 'x-a1': { checked: [0, 1], done: true, notes: 'my notes', u: 1000 } } } });
  const stale = (await lea.call('GET', '/api/progress')).j?.data?.assignments?.['x-a1'];
  check('a stale copy does not undo a newer edit', JSON.stringify(stale?.checked) === '[0]' && stale?.notes === '', JSON.stringify(stale));
  await lea.call('PUT', '/api/progress', { data: { ...data, quiz: { 'q-l1': { best: 2, last: 2, total: 3, attempts: 1, at: 5, answers: [1, 0, 2] } } } });
  check('quiz answers are saved for review', JSON.stringify((await lea.call('GET', '/api/progress')).j?.data?.quiz?.['q-l1']?.answers) === '[1,0,2]');
  // Salesforce program: ticks merge by newest change, bad values are dropped, and the level survives.
  await lea.call('PUT', '/api/progress', { data: { ...data, profile: { goal: 'basics', time: null, done: true, at: 10, sf: 'associate' }, sf: { 'sf-a1': { done: true, u: 1000 }, 'sf-a2': { done: true, u: 1000 }, bad: { done: 'yes' } } } });
  await lea.call('PUT', '/api/progress', { data: { ...data, sf: { 'sf-a1': { done: false, u: 2000 } } } });
  const sfm = (await lea.call('GET', '/api/progress')).j?.data;
  check('salesforce level is saved', sfm?.profile?.sf === 'associate');
  check('salesforce untick wins when newer, other ticks stay', sfm?.sf?.['sf-a1']?.done === false && sfm?.sf?.['sf-a2']?.done === true);
  check('salesforce junk entries are dropped', sfm?.sf?.bad === undefined);
  await lea.call('PUT', '/api/progress', { data: { ...data, sfFinal: { score: 11, total: 12, passed: true, at: 5, attempts: 1 } } });
  await lea.call('PUT', '/api/progress', { data: { ...data, sfFinal: { score: 6, total: 12, passed: false, at: 9, attempts: 3 } } });
  const sff = (await lea.call('GET', '/api/progress')).j?.data?.sfFinal;
  check('salesforce exam keeps the pass and the best score', sff?.passed === true && sff?.score === 11 && sff?.attempts === 3, JSON.stringify(sff));

  // ---- admin cohort (still by ADMIN_EMAILS) ----
  check('normal user cannot read the cohort', (await lea.call('GET', '/api/admin/cohort')).s === 403);
  const boss = new Client(); await boss.google('boss');
  check('admin email is flagged admin', (await boss.call('GET', '/api/auth/me')).j?.user?.admin === true);
  const cohort = await boss.call('GET', '/api/admin/cohort');
  check('admin can read the cohort', cohort.s === 200 && cohort.j?.learners?.length === 4, String(cohort.j?.learners?.length));
  check('cohort never leaks password hashes or google ids', !JSON.stringify(cohort.j).includes('passwordHash') && !JSON.stringify(cohort.j).includes('$2a$') && !JSON.stringify(cohort.j).includes('g-lea'));

  // ---- stale progress in a browser must not leak into another account ----
  const done = (): ProgressData => ({ ...emptyProgress('light'), profile: { ...emptyProgress('light').profile, done: true } });
  const fresh = emptyProgress('light');
  check('stale browser: finished setup, no owner tag, new account is foreign', isForeignLocal(null, 'u2', done(), fresh));
  check('stale browser: owner is another account is foreign', isForeignLocal('u1', 'u2', fresh, fresh));
  check('same account on the same browser is kept', !isForeignLocal('u1', 'u1', done(), done()));
  check('guest progress, no setup, is carried into the first account', !isForeignLocal(null, 'u2', fresh, fresh));
  check('older browser, existing account with its own setup, is merged not wiped', !isForeignLocal(null, 'u2', done(), done()));

  // ---- other protections ----
  check('cross origin write is blocked', (await fetch(base + '/api/progress', { method: 'PUT', headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example', Cookie: lea.cookie }, body: '{}' })).status === 403);
  check('logout works', (await lea.call('POST', '/api/auth/logout')).s === 200 && (await lea.call('GET', '/api/auth/me')).s === 401);
} finally {
  server.close();
  rmSync(dir, { recursive: true, force: true });
}
console.log(failed ? `\n${failed} check(s) failed` : '\nAll API checks passed');
process.exit(failed ? 1 : 0);
