// Application level encryption for personal data stored in the database.
//
// Why encrypt instead of hash: a hash is one way, so it suits passwords (we only ever compare). Emails, names and
// progress notes must be read back, so they are encrypted with AES-256-GCM. Emails also need an exact match lookup,
// so we store a keyed hash (HMAC-SHA256) next to the ciphertext and search on that.
//
// DATA_KEY is the only secret that unlocks the data. Keep it in the host's secret store AND in a password manager:
// if it is lost the data cannot be recovered, and if it leaks the database contents can be read.
import { createCipheriv, createDecipheriv, createHmac, hkdfSync, randomBytes } from 'node:crypto';

const PREFIX = 'v1.';
let cached: { enc: Buffer; mac: Buffer } | null = null;

function keys(): { enc: Buffer; mac: Buffer } {
  if (cached) return cached;
  let raw = process.env.DATA_KEY || '';
  if (!raw) {
    if (process.env.NODE_ENV === 'production' || process.env.RENDER || process.env.VERCEL) {
      throw new Error('DATA_KEY is not configured (32 random bytes, base64). Refusing to store personal data unencrypted.');
    }
    console.warn('[warn] DATA_KEY is not set: using an insecure development key. Never do this with real data.');
    raw = Buffer.from('academy-development-key-not-secret').toString('base64');
  }
  const master = Buffer.from(raw, 'base64');
  if (master.length < 32) throw new Error('DATA_KEY must decode to at least 32 bytes. Generate one: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'base64\'))"');
  const derive = (label: string) => Buffer.from(hkdfSync('sha256', master, Buffer.alloc(0), `academy:${label}`, 32));
  cached = { enc: derive('encrypt'), mac: derive('lookup') };
  return cached;
}

/** Fail at startup, not on the first request, when the key is missing or malformed. */
export const assertKey = (): void => { keys(); };

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', keys().enc, iv);
  const ct = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return PREFIX + Buffer.concat([iv, c.getAuthTag(), ct]).toString('base64');
}

export function decrypt(blob: string): string {
  if (!blob.startsWith(PREFIX)) throw new Error('Unsupported ciphertext format');
  const buf = Buffer.from(blob.slice(PREFIX.length), 'base64');
  const d = createDecipheriv('aes-256-gcm', keys().enc, buf.subarray(0, 12));
  d.setAuthTag(buf.subarray(12, 28));
  return Buffer.concat([d.update(buf.subarray(28)), d.final()]).toString('utf8');
}

/** Deterministic keyed hash for exact match lookups (email, Google subject). Not reversible without DATA_KEY. */
export const lookupHash = (value: string): string => createHmac('sha256', keys().mac).update(value.trim().toLowerCase()).digest('hex');
