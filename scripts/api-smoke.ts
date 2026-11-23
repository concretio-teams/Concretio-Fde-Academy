// End to end API smoke test against the real Express app using a temporary JSON store. Run: npm run test:api
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const dir = mkdtempSync(path.join(tmpdir(), 'academy-smoke-'));
process.env.DATA_FILE = path.join(dir, 'db.json');
delete process.env.DATABASE_URL;
process.env.JWT_SECRET = 'smoke-test-secret-0123456789';
process.env.ALLOWED_EMAIL_DOMAINS = 'concret.io';
process.env.ADMIN_EMAILS = 'boss@concret.io';
process.env.NODE_ENV = 'test';

const { createApp } = await import('../server/app.js');
const server = createApp().listen(0);
const base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;

let failed = 0;
const check = (name: string, ok: boolean, extra = '') => { if (!ok) failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : '  ' + extra}`); };

class Client {
  cookie = '';
  async call(method: string, url: string, body?: unknown) {
    const r = await fetch(base + url, { method, headers: { 'Content-Type': 'application/json', ...(this.cookie ? { Cookie: this.cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const sc = r.headers.get('set-cookie');
    if (sc && /cca_session=[^;]+/.test(sc) && !/cca_session=;/.test(sc)) this.cookie = sc.split(';')[0];
    return { s: r.status, j: (await r.json().catch(() => null)) as any };
  }
}

try {
  const a = new Client();
  check('health', (await a.call('GET', '/api/health')).j?.ok === true);
  check('progress needs login', (await a.call('GET', '/api/progress')).s === 401);
  check('signup rejects other domains', (await a.call('POST', '/api/auth/signup', { email: 'x@gmail.com', password: 'longenough1' })).s === 403);
  check('signup rejects short password', (await a.call('POST', '/api/auth/signup', { email: 'a@concret.io', password: 'short' })).s === 400);
  check('signup ok', (await a.call('POST', '/api/auth/signup', { email: 'a@concret.io', password: 'longenough1', name: 'A' })).s === 201);
  check('duplicate signup rejected', (await new Client().call('POST', '/api/auth/signup', { email: 'a@concret.io', password: 'longenough1' })).s === 409);
  check('wrong password rejected', (await new Client().call('POST', '/api/auth/login', { email: 'a@concret.io', password: 'wrongwrong1' })).s === 401);

  const data = { theme: 'dark', lessonsViewed: {}, lessonsManual: {}, quiz: {}, exercises: { e1: { done: true, attempts: 1 } }, assignments: { 'm2-a1': { checked: [0], done: true, notes: 'evidence' } }, final: null, finalPractical: {}, days: ['2026-01-01'], history: [] };
  check('save progress', (await a.call('PUT', '/api/progress', { data })).s === 200);
  const got = await a.call('GET', '/api/progress');
  check('progress round trip', got.j?.data?.exercises?.e1?.done === true && got.j?.data?.assignments?.['m2-a1']?.done === true);

  const b = new Client();
  await b.call('POST', '/api/auth/login', { email: 'a@concret.io', password: 'longenough1' });
  await b.call('PUT', '/api/progress', { data: { ...data, exercises: { e2: { done: true, attempts: 1 } } } });
  const merged = (await a.call('GET', '/api/progress')).j?.data;
  check('two devices merge, nothing lost', merged?.exercises?.e1?.done && merged?.exercises?.e2?.done);

  check('non-admin cannot read cohort', (await a.call('GET', '/api/admin/cohort')).s === 403);
  check('admin flag false for normal user', (await a.call('GET', '/api/auth/me')).j?.user?.admin === false);
  const boss = new Client();
  await boss.call('POST', '/api/auth/signup', { email: 'boss@concret.io', password: 'longenough1', name: 'Boss' });
  const cohort = await boss.call('GET', '/api/admin/cohort');
  check('admin can read cohort', cohort.s === 200 && cohort.j?.learners?.length === 2);
  check('cohort never leaks password hashes', !JSON.stringify(cohort.j).includes('passwordHash') && !JSON.stringify(cohort.j).includes('$2'));

  check('cross origin write blocked', (await fetch(base + '/api/progress', { method: 'PUT', headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example', Cookie: a.cookie }, body: '{}' })).status === 403);
  check('logout works', (await a.call('POST', '/api/auth/logout')).s === 200);
} finally {
  server.close();
  rmSync(dir, { recursive: true, force: true });
}
console.log(failed ? `\n${failed} check(s) failed` : '\nAll API checks passed');
process.exit(failed ? 1 : 0);
