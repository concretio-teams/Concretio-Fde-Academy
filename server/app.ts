import bcrypt from 'bcryptjs';
import express, { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import { mergeProgress, sanitize } from '../shared/progress.js';
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

const publicUser = (u: UserRecord) => ({ id: u.id, email: u.email, name: u.name });

// Constant-time-ish login: compare against a dummy hash when the user does not exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

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

export function createApp() {
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

  app.post('/api/auth/signup', wrap(async (req, res) => {
    if (limited(`signup:${req.ip}`, 10, 15 * 60_000)) return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const name = String(req.body?.name ?? '').trim().slice(0, 80) || email.split('@')[0];
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) return res.status(400).json({ error: 'Enter a valid email address' });
    const domains = allowedDomains();
    if (domains.length && !domains.includes(email.split('@')[1])) return res.status(403).json({ error: `Sign up is limited to: ${domains.map((d) => '@' + d).join(', ')}` });
    if (password.length < 8 || password.length > 128) return res.status(400).json({ error: 'Password must be 8 to 128 characters' });
    const store = await getStore();
    if (await store.findByEmail(email)) return res.status(409).json({ error: 'An account with this email already exists. Sign in instead.' });
    const user: UserRecord = { id: randomUUID(), email, name, passwordHash: await bcrypt.hash(password, 10), createdAt: Date.now() };
    try { await store.createUser(user); } catch { return res.status(409).json({ error: 'An account with this email already exists. Sign in instead.' }); }
    setSession(res, user.id);
    res.status(201).json({ user: publicUser(user) });
  }));

  app.post('/api/auth/login', wrap(async (req, res) => {
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    if (limited(`login:${req.ip}:${email}`, 8, 15 * 60_000)) return res.status(429).json({ error: 'Too many attempts. Try again later.' });
    const store = await getStore();
    const user = await store.findByEmail(email);
    const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) return res.status(401).json({ error: 'Wrong email or password' });
    setSession(res, user.id);
    res.json({ user: publicUser(user) });
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
