import { promises as fs } from 'node:fs';
import path from 'node:path';
import { sanitize, type ProgressData } from '../shared/progress.js';

export interface UserRecord { id: string; email: string; name: string; passwordHash: string; createdAt: number }
export interface ProgressRecord { data: ProgressData; updatedAt: number }

export interface Store {
  kind: 'postgres' | 'file';
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  createUser(u: UserRecord): Promise<void>;
  getProgress(userId: string): Promise<ProgressRecord | null>;
  saveProgress(userId: string, data: ProgressData): Promise<number>;
}

/* ---------------- Postgres (production: Neon, Vercel Postgres, Render Postgres, any DATABASE_URL) ---------------- */
async function createPgStore(url: string): Promise<Store> {
  const { default: pg } = await import('pg');
  const local = /localhost|127\.0\.0\.1/.test(url);
  const pool = new pg.Pool({
    connectionString: url,
    max: 3,
    ssl: process.env.PGSSL === 'disable' || local ? false : { rejectUnauthorized: false },
  });
  await pool.query(`
    CREATE TABLE IF NOT EXISTS academy_users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at BIGINT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS academy_progress (
      user_id TEXT PRIMARY KEY REFERENCES academy_users(id) ON DELETE CASCADE,
      data JSONB NOT NULL,
      updated_at BIGINT NOT NULL
    );`);
  const row = (r: any): UserRecord => ({ id: r.id, email: r.email, name: r.name, passwordHash: r.password_hash, createdAt: Number(r.created_at) });
  return {
    kind: 'postgres',
    async findByEmail(email) { const r = await pool.query('SELECT * FROM academy_users WHERE email = $1', [email]); return r.rows[0] ? row(r.rows[0]) : null; },
    async findById(id) { const r = await pool.query('SELECT * FROM academy_users WHERE id = $1', [id]); return r.rows[0] ? row(r.rows[0]) : null; },
    async createUser(u) {
      await pool.query('INSERT INTO academy_users (id, email, name, password_hash, created_at) VALUES ($1,$2,$3,$4,$5)', [u.id, u.email, u.name, u.passwordHash, u.createdAt]);
    },
    async getProgress(userId) {
      const r = await pool.query('SELECT data, updated_at FROM academy_progress WHERE user_id = $1', [userId]);
      return r.rows[0] ? { data: sanitize(r.rows[0].data), updatedAt: Number(r.rows[0].updated_at) } : null;
    },
    async saveProgress(userId, data) {
      const now = Date.now();
      await pool.query(
        `INSERT INTO academy_progress (user_id, data, updated_at) VALUES ($1, $2, $3)
         ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at`,
        [userId, JSON.stringify(data), now],
      );
      return now;
    },
  };
}

/* ---------------- JSON file (local development only; disks on Render free and Vercel are ephemeral) ---------------- */
async function createFileStore(file: string): Promise<Store> {
  interface Db { users: UserRecord[]; progress: Record<string, ProgressRecord> }
  let db: Db = { users: [], progress: {} };
  try { db = JSON.parse(await fs.readFile(file, 'utf8')); } catch { /* new file */ }
  let writing: Promise<void> = Promise.resolve();
  const persist = () => {
    writing = writing.then(async () => {
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(db));
    });
    return writing;
  };
  return {
    kind: 'file',
    async findByEmail(email) { return db.users.find((u) => u.email === email) ?? null; },
    async findById(id) { return db.users.find((u) => u.id === id) ?? null; },
    async createUser(u) { db.users.push(u); await persist(); },
    async getProgress(userId) { const p = db.progress[userId]; return p ? { data: sanitize(p.data), updatedAt: p.updatedAt } : null; },
    async saveProgress(userId, data) { const now = Date.now(); db.progress[userId] = { data, updatedAt: now }; await persist(); return now; },
  };
}

let cached: Promise<Store> | null = null;
export function getStore(): Promise<Store> {
  if (!cached) {
    const url = process.env.DATABASE_URL;
    cached = url ? createPgStore(url) : createFileStore(process.env.DATA_FILE || path.join(process.cwd(), '.data', 'db.json'));
    cached.catch(() => { cached = null; }); // retry on next request after a failed connect
  }
  return cached;
}
