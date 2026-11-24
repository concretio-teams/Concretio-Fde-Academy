import express, { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { mergeProgress, sanitize } from '../shared/progress.js';
import { googleConfigured, newPkce, randomToken, realGoogle, type GoogleClient } from './google.js';
import { getStore, type UserRecord } from './store.js';

const COOKIE = 'cca_session';
const MAX_AGE_S = 60 * 60 * 24 * 30;
const isProd = () => process.env.NODE_ENV === 'production' || !!process.env.VERCEL || !!process.env.RENDER;

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (s && s.length >= 16) return s;
  if (isProd()) throw new Error('JWT_SECRET (16+ characters) is not configured');
  return 'dev-only-secret-change-me';
}

const allowedDomains = () =>
  (process.env.ALLOWED_EMAIL_DOMAINS || '').split(',').map((d) => d.trim().toLowerCase().replace(/^@/, '')).filter(Boolean);

const adminEmails = () => (process.env.ADMIN_EMAILS || '').split(',').map((d) => d.trim().toLowerCase()).filter(Boolean);
const isAdmin = (u: UserRecord) => adminEmails().includes(u.email);
const publicUser = (u: UserRecord) => ({ id: u.id, email: u.email, name: u.name, admin: isAdmin(u) });

const OAUTH_COOKIE = 'cca_oauth';
const baseUrl = (req: Request) =>
  (process.env.APP_URL || `${req.get('x-forwarded-proto') || req.protocol}://${req.get('x-forwarded-host') || req.get('host')}`).replace(/\/$/, '');

/* ---- tiny in-memory rate limiter (per instance; fine for a small internal app) ---- */
const hits = new Map<string, { n: number; reset: number }>();
function limited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < now) { hits.set(key, { n: 1, reset: now + windowMs }); return false; }
  h.n++;
  return h.n > max;
}

function readCookie(req: Request, name: string): string | undefined {
  const raw = req.headers.cookie;
  if (!raw) return undefined;
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return undefined;
}

function setSession(res: Response, userId: string) {
  const token = jwt.sign({ sub: userId }, secret(), { expiresIn: MAX_AGE_S });
  res.cookie(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: isProd(), maxAge: MAX_AGE_S * 1000, path: '/' });
}

interface AuthedRequest extends Request { userId?: string }

async function requireUser(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const token = readCookie(req, COOKIE);
    if (!token) return res.status(401).json({ error: 'Not signed in' });
    const payload = jwt.verify(token, secret()) as { sub?: string };
    if (!payload.sub) return res.status(401).json({ error: 'Not signed in' });
    req.userId = payload.sub;
    next();
  } catch (e) {
    if (e instanceof Error && /JWT_SECRET/.test(e.message)) return next(e);
    res.status(401).json({ error: 'Session expired' });
  }
}

// Same-origin check for state-changing requests (defence in depth on top of SameSite=Lax).
function sameOrigin(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET' || req.method === 'HEAD') return next();
  const origin = req.get('origin');
  if (origin) {
    const host = req.get('x-forwarded-host') || req.get('host');
    try { if (new URL(origin).host !== host) return res.status(403).json({ error: 'Cross-origin request blocked' }); }
    catch { return res.status(403).json({ error: 'Bad origin' }); }
  }
  if (req.method === 'PUT' && !req.is('application/json')) return res.status(415).json({ error: 'JSON required' });
  next();
}

const wrap = (fn: (req: AuthedRequest, res: Response) => Promise<unknown>) => (req: AuthedRequest, res: Response, next: NextFunction) => {
  fn(req, res).catch(next);
};

export function createApp(opts: { google?: GoogleClient } = {}) {
  const google = opts.google ?? realGoogle;
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '512kb' }));
  app.use('/api', (_req, res, next) => { res.setHeader('Cache-Control', 'no-store'); next(); });
  app.use('/api', sameOrigin);

  app.get('/api/health', wrap(async (_req, res) => {
    const store = await getStore();
    res.json({ ok: true, storage: store.kind, domains: allowedDomains() });
  }));

  // Google is the only way to sign in. There are no passwords to store, reset or leak.
  app.get('/api/auth/config', (_req, res) => {
    res.json({ google: googleConfigured() || !!opts.google, domains: allowedDomains() });
  });

  // Authorization code flow with PKCE, state and nonce.
  app.get('/api/auth/google', (req, res) => {
    if (!googleConfigured() && !opts.google) return res.status(503).json({ error: 'Google sign in is not configured' });
    if (limited(`g:${req.ip}`, 30, 15 * 60_000)) return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    const state = randomToken(), nonce = randomToken(), { verifier, challenge } = newPkce();
    const token = jwt.sign({ state, nonce, verifier }, secret(), { expiresIn: 600 });
    res.cookie(OAUTH_COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: isProd(), maxAge: 600_000, path: '/api/auth/google' });
    res.redirect(google.authUrl({ redirectUri: `${baseUrl(req)}/api/auth/google/callback`, state, nonce, challenge, domainHint: allowedDomains()[0] }));
  });

  app.get('/api/auth/google/callback', wrap(async (req, res) => {
    const root = baseUrl(req);
    const fail = (why: string) => res.redirect(`${root}/#/login?error=${encodeURIComponent(why)}`);
    res.clearCookie(OAUTH_COOKIE, { path: '/api/auth/google' });
    if (req.query.error) return fail('Google sign in was cancelled');
    let saved: { state: string; nonce: string; verifier: string };
    try { saved = jwt.verify(readCookie(req, OAUTH_COOKIE) ?? '', secret()) as typeof saved; } catch { return fail('Sign in expired, please try again'); }
    if (!saved.state || saved.state !== String(req.query.state ?? '')) return fail('Sign in could not be verified, please try again');
    let id;
    try {
      id = await google.exchange({ code: String(req.query.code ?? ''), verifier: saved.verifier, redirectUri: `${root}/api/auth/google/callback`, nonce: saved.nonce });
    } catch { return fail('Google sign in failed'); }
    if (!id.emailVerified) return fail('Your Google email is not verified');
    const domains = allowedDomains();
    if (domains.length && !domains.includes(id.email.split('@')[1])) return fail(`Sign in is limited to: ${domains.map((d) => '@' + d).join(', ')}`);
    const store = await getStore();
    let user = await store.findByEmail(id.email);
    if (!user) {
      user = { id: randomUUID(), email: id.email, name: id.name.slice(0, 80), passwordHash: null, googleSub: id.sub, createdAt: Date.now() };
      await store.createUser(user);
    } else {
      // An account made earlier with a password is claimed by its owner's Google sign in, and keeps its progress.
      // After that the account is bound to that one Google identity.
      if (user.googleSub && user.googleSub !== id.sub) return fail('This email is linked to a different Google account');
      if (!user.googleSub) await store.setGoogleSub(user.id, id.sub);
    }
    setSession(res, user.id);
    res.redirect(`${root}/#/`);
  }));

  app.post('/api/auth/logout', (_req, res) => {
    res.clearCookie(COOKIE, { path: '/', sameSite: 'lax', secure: isProd(), httpOnly: true });
    res.json({ ok: true });
  });

  app.get('/api/auth/me', requireUser, wrap(async (req, res) => {
    const user = await (await getStore()).findById(req.userId!);
    if (!user) return res.status(401).json({ error: 'Account not found' });
    res.json({ user: publicUser(user) });
  }));

  app.get('/api/progress', requireUser, wrap(async (req, res) => {
    const rec = await (await getStore()).getProgress(req.userId!);
    res.json({ data: rec?.data ?? null, updatedAt: rec?.updatedAt ?? 0 });
  }));

  // The server merges the incoming progress with what it has, so two devices never overwrite each other.
  app.put('/api/progress', requireUser, wrap(async (req, res) => {
    const store = await getStore();
    const incoming = sanitize(req.body?.data);
    const existing = await store.getProgress(req.userId!);
    const merged = existing ? mergeProgress(existing.data, incoming) : incoming;
    const updatedAt = await store.saveProgress(req.userId!, merged);
    res.json({ data: merged, updatedAt });
  }));

  app.delete('/api/progress', requireUser, wrap(async (req, res) => {
    await (await getStore()).saveProgress(req.userId!, sanitize(null));
    res.json({ ok: true });
  }));

  // Cohort view for leaders. Only emails listed in ADMIN_EMAILS may read it. Password hashes never leave the server.
  app.get('/api/admin/cohort', requireUser, wrap(async (req, res) => {
    const store = await getStore();
    const me = await store.findById(req.userId!);
    if (!me || !isAdmin(me)) return res.status(403).json({ error: 'Admins only' });
    const rows = await store.listAll();
    res.json({ learners: rows.map((r) => ({ id: r.user.id, name: r.user.name, email: r.user.email, joined: r.user.createdAt, updatedAt: r.progress?.updatedAt ?? 0, data: r.progress?.data ?? null })) });
  }));

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if ((err as Error & { type?: string }).type === 'entity.too.large') return res.status(413).json({ error: 'Progress data is too large' });
    if ((err as Error & { type?: string }).type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON' });
    console.error('[api error]', err.message);
    const cfg = /JWT_SECRET/.test(err.message);
    res.status(500).json({ error: cfg ? 'Server is not configured: JWT_SECRET is missing' : 'Something went wrong' });
  });

  return app;
}

export default createApp();
