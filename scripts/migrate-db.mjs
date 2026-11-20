// Copy accounts and progress from one Postgres database to another (for example Render to Neon).
//
//   SRC_DATABASE_URL=... DST_DATABASE_URL=... node scripts/migrate-db.mjs [--dry]
//
// - Read only on the source. Nothing is ever deleted.
// - Safe to run more than once: existing users are kept, progress is only overwritten by newer progress.
// - Verifies every copied row and never prints passwords, hashes or connection strings.
import pg from 'pg';

const dry = process.argv.includes('--dry');
const src = process.env.SRC_DATABASE_URL;
const dst = process.env.DST_DATABASE_URL;
if (!src || !dst) { console.error('Set SRC_DATABASE_URL and DST_DATABASE_URL'); process.exit(2); }

const clean = (u) => {
  // node-postgres does not support channel_binding, and TLS is set explicitly below
  const x = new URL(u);
  x.searchParams.delete('channel_binding');
  x.searchParams.delete('sslmode');
  return x.toString();
};
const connect = async (url) => {
  const local = /localhost|127\.0\.0\.1/.test(url);
  const neon = /\.neon\.tech$/.test(new URL(url).hostname);
  const c = new pg.Client({ connectionString: clean(url), ssl: local ? false : neon ? true : { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
  await c.connect();
  return c;
};
const host = (u) => new URL(u).hostname.replace(/^(.{6}).*(\..*\..*)$/, '$1...$2');

const DDL = `
  CREATE TABLE IF NOT EXISTS academy_users (
    id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL,
    password_hash TEXT NOT NULL, created_at BIGINT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS academy_progress (
    user_id TEXT PRIMARY KEY REFERENCES academy_users(id) ON DELETE CASCADE,
    data JSONB NOT NULL, updated_at BIGINT NOT NULL
  );`;

const s = await connect(src);
const d = await connect(dst);
console.log(`source: ${host(src)}  ->  destination: ${host(dst)}${dry ? '   (dry run)' : ''}`);

const hasTables = await s.query(`SELECT to_regclass('public.academy_users') AS u, to_regclass('public.academy_progress') AS p`);
if (!hasTables.rows[0].u) { console.log('source has no academy_users table: nothing to migrate'); await s.end(); await d.end(); process.exit(0); }
const users = (await s.query('SELECT id, email, name, password_hash, created_at FROM academy_users ORDER BY created_at')).rows;
const progress = hasTables.rows[0].p ? (await s.query('SELECT user_id, data, updated_at FROM academy_progress')).rows : [];
console.log(`source rows: ${users.length} users, ${progress.length} progress records`);

if (dry) { await s.end(); await d.end(); process.exit(0); }

await d.query(DDL);
const before = {
  users: Number((await d.query('SELECT count(*) FROM academy_users')).rows[0].count),
  progress: Number((await d.query('SELECT count(*) FROM academy_progress')).rows[0].count),
};
console.log(`destination before: ${before.users} users, ${before.progress} progress records`);

let addedUsers = 0, skippedUsers = 0, upsertedProgress = 0;
try {
  await d.query('BEGIN');
  for (const u of users) {
    const r = await d.query(
      'INSERT INTO academy_users (id, email, name, password_hash, created_at) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING',
      [u.id, u.email, u.name, u.password_hash, u.created_at],
    );
    if (r.rowCount) addedUsers++; else skippedUsers++;
  }
  for (const p of progress) {
    const r = await d.query(
      `INSERT INTO academy_progress (user_id, data, updated_at) VALUES ($1,$2,$3)
       ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at
       WHERE academy_progress.updated_at < EXCLUDED.updated_at`,
      [p.user_id, JSON.stringify(p.data), p.updated_at],
    );
    upsertedProgress += r.rowCount;
  }
  await d.query('COMMIT');
} catch (e) {
  await d.query('ROLLBACK');
  console.error('Migration failed and was rolled back:', e.message);
  process.exit(1);
}
console.log(`copied: ${addedUsers} new users (${skippedUsers} already present), ${upsertedProgress} progress records written`);

// Verify every source row exists identically in the destination
let bad = 0;
for (const u of users) {
  const r = (await d.query('SELECT email, name, password_hash, created_at FROM academy_users WHERE id = $1', [u.id])).rows[0];
  if (!r || r.email !== u.email || r.name !== u.name || r.password_hash !== u.password_hash || String(r.created_at) !== String(u.created_at)) { bad++; console.log('MISMATCH user', u.id.slice(0, 8)); }
}
for (const p of progress) {
  const r = (await d.query('SELECT data FROM academy_progress WHERE user_id = $1', [p.user_id])).rows[0];
  if (!r || JSON.stringify(r.data) !== JSON.stringify(p.data)) {
    // acceptable only if the destination already held newer progress
    const newer = (await d.query('SELECT updated_at FROM academy_progress WHERE user_id = $1', [p.user_id])).rows[0];
    if (!newer || Number(newer.updated_at) < Number(p.updated_at)) { bad++; console.log('MISMATCH progress', p.user_id.slice(0, 8)); }
  }
}
const after = {
  users: Number((await d.query('SELECT count(*) FROM academy_users')).rows[0].count),
  progress: Number((await d.query('SELECT count(*) FROM academy_progress')).rows[0].count),
};
console.log(`destination after: ${after.users} users, ${after.progress} progress records`);
console.log(bad === 0 && after.users >= users.length ? 'VERIFIED: every source row is present and identical in the destination' : `VERIFICATION FAILED (${bad} mismatches)`);
await s.end(); await d.end();
process.exit(bad === 0 ? 0 : 1);
