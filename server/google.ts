// Google sign in (OpenID Connect, authorization code flow with PKCE). No passwords are involved.
// Setup: Google Cloud Console > APIs and Services > Credentials > OAuth client ID (Web application).
// Authorised redirect URIs must include <APP_URL>/api/auth/google/callback for every environment you use.
import { createHash, randomBytes } from 'node:crypto';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export interface GoogleIdentity { sub: string; email: string; emailVerified: boolean; name: string; hostedDomain?: string }

/** Injectable so tests can run the whole flow without calling Google. */
export interface GoogleClient {
  authUrl(p: { redirectUri: string; state: string; nonce: string; challenge: string; domainHint?: string }): string;
  exchange(p: { code: string; verifier: string; redirectUri: string; nonce: string }): Promise<GoogleIdentity>;
}

export const googleConfigured = (): boolean => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const b64url = (b: Buffer): string => b.toString('base64url');
export const newPkce = () => {
  const verifier = b64url(randomBytes(32));
  return { verifier, challenge: b64url(createHash('sha256').update(verifier).digest()) };
};
export const randomToken = (): string => b64url(randomBytes(24));

export const realGoogle: GoogleClient = {
  authUrl({ redirectUri, state, nonce, challenge, domainHint }) {
    const q = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!, redirect_uri: redirectUri, response_type: 'code', scope: 'openid email profile',
      state, nonce, code_challenge: challenge, code_challenge_method: 'S256', prompt: 'select_account',
    });
    if (domainHint) q.set('hd', domainHint); // only a hint for the account chooser; the domain is enforced on our side
    return `${AUTH_URL}?${q}`;
  },
  async exchange({ code, verifier, redirectUri, nonce }) {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri, grant_type: 'authorization_code', code_verifier: verifier,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error('Google rejected the sign in code');
    const { id_token } = (await res.json()) as { id_token?: string };
    if (!id_token) throw new Error('Google did not return an identity');
    const { payload } = await jwtVerify(id_token, JWKS, { issuer: ['https://accounts.google.com', 'accounts.google.com'], audience: process.env.GOOGLE_CLIENT_ID! });
    if (payload.nonce !== nonce) throw new Error('Sign in nonce mismatch');
    const email = String(payload.email ?? '').toLowerCase();
    return { sub: String(payload.sub), email, emailVerified: payload.email_verified === true, name: String(payload.name ?? email.split('@')[0]), hostedDomain: payload.hd ? String(payload.hd).toLowerCase() : undefined };
  },
};
