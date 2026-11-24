import { promises as fs } from 'node:fs';
import path from 'node:path';
import { sanitize, type ProgressData } from '../shared/progress.js';
import { assertKey, decrypt, encrypt, lookupHash } from './crypto.js';

export type Role = 'admin' | 'manager' | 'learner';
export const ROLES: Role[] = ['admin', 'manager', 'learner'];

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string | null; // null for accounts that only sign in with Google
  role: Role;
  googleSub: string | null;
  createdAt: number;
}
export interface ProgressRecord { data: ProgressData; updatedAt: number }

export interface Store {
  kind: 'postgres' | 'file';
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  createUser(u: UserRecord): Promise<void>;
  updateUser(id: string, patch: Partial<Pick<UserRecord, 'role' | 'googleSub' | 'name' | 'passwordHash'>>): Promise<void>;
  countByRole(role: Role): Promise<number>;
  getProgress(userId: string): Promise<ProgressRecord | null>;
  saveProgress(userId: string, data: ProgressData): Promise<number>;
  listAll(): Promise<{ user: UserRecord; progress: ProgressRecord | null }[]>;
}

// What is actually stored: no plaintext email or name. Looked up by emailHash; read back by decrypting.
interface UserRow {
  id: string; emailHash: string; emailEnc: string; nameEnc: string; passwordHash: string | null;
  role: Role; googleSubHash: string | null; googleSubEnc: string | null; createdAt: number;
}
const toRow = (u: UserRecord): UserRow => ({
  id: u.id, emailHash: lookupHash(u.email), emailEnc: encrypt(u.email), nameEnc: encrypt(u.name), passwordHash: u.passwordHash,
  role: u.role, googleSubHash: u.googleSub ? lookupHash(u.googleSub) : null, googleSubEnc: u.googleSub ? encrypt(u.googleSub) : null, createdAt: u.createdAt,
});
const fromRow = (r: UserRow): UserRecord => ({
  id: r.id, email: decrypt(r.emailEnc), name: decrypt(r.nameEnc), passwordHash: r.passwordHash,
  role: r.role, googleSub: r.googleSubEnc ? decrypt(r.googleSubEnc) : null, createdAt: Number(r.createdAt),
});
const sealProgress = (d: ProgressData) => encrypt(JSON.stringify(d));
const openProgress = (blob: string): ProgressData => sanitize(JSON.parse(decrypt(blob)));

/* ---------------- Postgres (production: Neon, Vercel Postgres, Render Postgres, any DATABASE_URL) ---------------- */
async function createPgStore(url: string): Promise<Store> {
  assertKey();
  const { default: pg } = await import('pg');
  const local = /localhost|127\.0\.0\.1/.test(url);
  // Neon adds channel_binding and sslmode to its connection strings. node-postgres does not support
  // channel_binding, and we set TLS explicitly below, so drop both.
  const u = new URL(url);
  u.searchParams.delete('channel_binding');
  u.searchParams.delete('sslmode');
  // Neon serves a publicly trusted certificate, so verify it fully; other hosts keep the lenient default.
  const neon = /\.neon\.tech$/.test(u.hostname);
  const pool = new pg.Pool({
    connectionString: u.toString(),
    max: 3,
    connectionTimeoutMillis: 10000,
    ssl: process.env.PGSSL === 'disable' || local ? false : neon ? true : { rejectUnauthorized: false },
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS academy_users (
      id TEXT PRIMARY KEY,
      email TEXT,
      name TEXT,
      password_hash TEXT,
      created_at BIGINT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS academy_progress (
      user_id TEXT PRIMARY KEY REFERENCES academy_users(id) ON DELETE CASCADE,
      data JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at BIGINT NOT NULL
    );
    ALTER TABLE academy_users ADD COLUMN IF NOT EXISTS email_hash TEXT;
    ALTER TABLE academy_users ADD COLUMN IF NOT EXISTS email_enc TEXT;
    ALTER TABLE academy_users ADD COLUMN IF NOT EXISTS name_enc TEXT;
    ALTER TABLE academy_users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'learner';
    ALTER TABLE academy_users ADD COLUMN IF NOT EXISTS google_sub_hash TEXT;
    ALTER TABLE academy_users ADD COLUMN IF NOT EXISTS google_sub_enc TEXT;
    ALTER TABLE academy_users ALTER COLUMN email DROP NOT NULL;
    ALTER TABLE academy_users ALTER COLUMN name DROP NOT NULL;
    ALTER TABLE academy_users ALTER COLUMN password_hash DROP NOT NULL;
    ALTER TABLE academy_progress ADD COLUMN IF NOT EXISTS data_enc TEXT;
    CREATE UNIQUE INDEX IF NOT EXISTS academy_users_email_hash_idx ON academy_users (email_hash);`);

  // One time, idempotent upgrade of rows written before encryption existed: seal them, then erase the plaintext.
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const old = await client.query('SELECT id, email, name FROM academy_users WHERE email IS NOT NULL AND email_hash IS NULL FOR UPDATE');
    for (const r of old.rows) {
      await client.query('UPDATE academy_users SET email_hash=$2, email_enc=$3, name_enc=$4, email=NULL, name=NULL WHERE id=$1',
        [r.id, lookupHash(r.email), encrypt(r.email), encrypt(r.name ?? String(r.email).split('@')[0])]);
    }
    const oldP = await client.query("SELECT user_id, data FROM academy_progress WHERE data_enc IS NULL AND data <> '{}'::jsonb FOR UPDATE");
    for (const r of oldP.rows) {
      await client.query("UPDATE academy_progress SET data_enc=$2, data='{}'::jsonb WHERE user_id=$1", [r.user_id, sealProgress(sanitize(r.data))]);
    }
    await client.query('COMMIT');
    if (old.rowCount || oldP.rowCount) console.log(`[security] encrypted ${old.rowCount} user record(s) and ${oldP.rowCount} progress record(s) at rest`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  const rowOf = (r: any): UserRow => ({
    id: r.id, emailHash: r.email_hash, emailEnc: r.email_enc, nameEnc: r.name_enc, passwordHash: r.password_hash,
    role: r.role, googleSubHash: r.google_sub_hash, googleSubEnc: r.google_sub_enc, createdAt: Number(r.created_at),
  });
  const progOf = (data_enc: string | null) => (data_enc ? openProgress(data_enc) : sanitize(null));

  return {
    kind: 'postgres',
    async findByEmail(email) { const r = await pool.query('SELECT * FROM academy_users WHERE email_hash = $1', [lookupHash(email)]); return r.rows[0] ? fromRow(rowOf(r.rows[0])) : null; },
    async findById(id) { const r = await pool.query('SELECT * FROM academy_users WHERE id = $1', [id]); return r.rows[0] ? fromRow(rowOf(r.rows[0])) : null; },
    async createUser(u) {
      const r = toRow(u);
      await pool.query(
        'INSERT INTO academy_users (id, email_hash, email_enc, name_enc, password_hash, role, google_sub_hash, google_sub_enc, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [r.id, r.emailHash, r.emailEnc, r.nameEnc, r.passwordHash, r.role, r.googleSubHash, r.googleSubEnc, r.createdAt],
      );
    },
    async updateUser(id, patch) {
      if (patch.role) await pool.query('UPDATE academy_users SET role=$2 WHERE id=$1', [id, patch.role]);
      if (patch.name) await pool.query('UPDATE academy_users SET name_enc=$2 WHERE id=$1', [id, encrypt(patch.name)]);
      if (patch.googleSub) await pool.query('UPDATE academy_users SET google_sub_hash=$2, google_sub_enc=$3 WHERE id=$1', [id, lookupHash(patch.googleSub), encrypt(patch.googleSub)]);
      if ('passwordHash' in patch) await pool.query('UPDATE academy_users SET password_hash=$2 WHERE id=$1', [id, patch.passwordHash ?? null]);
    },
    async countByRole(role) { const r = await pool.query('SELECT count(*)::int AS c FROM academy_users WHERE role=$1', [role]); return r.rows[0].c; },
    async getProgress(userId) {
      const r = await pool.query('SELECT data_enc, updated_at FROM academy_progress WHERE user_id = $1', [userId]);
      return r.rows[0] ? { data: progOf(r.rows[0].data_enc), updatedAt: Number(r.rows[0].updated_at) } : null;
    },
    async saveProgress(userId, data) {
      const now = Date.now();
      await pool.query(
        `INSERT INTO academy_progress (user_id, data, data_enc, updated_at) VALUES ($1, '{}'::jsonb, $2, $3)
         ON CONFLICT (user_id) DO UPDATE SET data = '{}'::jsonb, data_enc = EXCLUDED.data_enc, updated_at = EXCLUDED.updated_at`,
        [userId, sealProgress(data), now],
      );
      return now;
    },
    async listAll() {
      const r = await pool.query('SELECT u.*, p.data_enc AS penc, p.updated_at AS pupdated FROM academy_users u LEFT JOIN academy_progress p ON p.user_id = u.id ORDER BY u.created_at');
      return r.rows.map((x: any) => ({ user: fromRow(rowOf(x)), progress: x.penc ? { data: progOf(x.penc), updatedAt: Number(x.pupdated) } : null }));
    },
  };
}

/* ---------------- JSON file (local development only; disks on Render free and Vercel are ephemeral) ---------------- */
async function createFileStore(file: string): Promise<Store> {
  assertKey();
  interface Db { users: UserRow[]; progress: Record<string, { enc: string; updatedAt: number }> }
  let db: Db = { users: [], progress: {} };
  try { db = JSON.parse(await fs.readFile(file, 'utf8')); } catch { /* new file */ }
  if (!Array.isArray(db.users)) db = { users: [], progress: {} };
  db.users = db.users.filter((r) => r.emailHash); // ignore rows from before encryption (development file only)
  let writing: Promise<void> = Promise.resolve();
  const persist = () => {
    writing = writing.then(async () => {
      await fs.mkdir(path.dirname(file), { recursive: true });
      await fs.writeFile(file, JSON.stringify(db));
    });
    return writing;
  };
  const prog = (userId: string): ProgressRecord | null => { const p = db.progress[userId]; return p ? { data: openProgress(p.enc), updatedAt: p.updatedAt } : null; };
  return {
    kind: 'file',
    async findByEmail(email) { const h = lookupHash(email); const r = db.users.find((x) => x.emailHash === h); return r ? fromRow(r) : null; },
    async findById(id) { const r = db.users.find((x) => x.id === id); return r ? fromRow(r) : null; },
    async createUser(u) { db.users.push(toRow(u)); await persist(); },
    async updateUser(id, patch) {
      const r = db.users.find((x) => x.id === id);
      if (!r) return;
      if (patch.role) r.role = patch.role;
      if (patch.name) r.nameEnc = encrypt(patch.name);
      if (patch.googleSub) { r.googleSubHash = lookupHash(patch.googleSub); r.googleSubEnc = encrypt(patch.googleSub); }
      if ('passwordHash' in patch) r.passwordHash = patch.passwordHash ?? null;
      await persist();
    },
    async countByRole(role) { return db.users.filter((x) => x.role === role).length; },
    async getProgress(userId) { return prog(userId); },
    async saveProgress(userId, data) { const now = Date.now(); db.progress[userId] = { enc: sealProgress(data), updatedAt: now }; await persist(); return now; },
    async listAll() { return db.users.map((r) => ({ user: fromRow(r), progress: prog(r.id) })); },
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
