import { useSyncExternalStore } from 'react';
import { emptyProgress, mergeProgress, sameProgress, sanitize } from '../../shared/progress';
import { actions, getProgress, onProgressChange } from './store';

export interface AuthUser { id: string; email: string; name: string; admin?: boolean }
export interface AuthState {
  status: 'loading' | 'guest' | 'user' | 'unavailable'; // unavailable = no API (static hosting or server down)
  user: AuthUser | null;
  sync: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: number | null;
}

let state: AuthState = { status: 'loading', user: null, sync: 'idle', lastSaved: null };
const subs = new Set<() => void>();
const set = (p: Partial<AuthState>) => { state = { ...state, ...p }; subs.forEach((f) => f()); };

export const useAuth = (): AuthState =>
  useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb); }; }, () => state);

async function api<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; body: T & { error?: string } }> {
  const res = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) throw new Error('API unavailable');
  return { ok: res.ok, status: res.status, body: await res.json() };
}

/* ---------------- cloud sync ---------------- */
let timer: ReturnType<typeof setTimeout> | undefined;
let applying = false;

async function push(keepalive = false): Promise<void> {
  if (state.status !== 'user') return;
  set({ sync: 'saving' });
  try {
    const r = await api<{ data: unknown }>('/api/progress', { method: 'PUT', body: JSON.stringify({ data: getProgress() }), keepalive });
    if (!r.ok) throw new Error(r.body.error || 'Save failed');
    const merged = sanitize(r.body.data);
    // Another device may have added progress: adopt the merged result without triggering another save.
    if (!sameProgress(merged, getProgress())) {
      applying = true;
      actions.replaceProgress({ ...mergeProgress(getProgress(), merged) }, true);
      applying = false;
    }
    set({ sync: 'saved', lastSaved: Date.now() });
  } catch {
    set({ sync: 'error' });
  }
}

function schedulePush() {
  clearTimeout(timer);
  timer = setTimeout(() => { void push(); }, 1200);
}

async function pullAndMerge() {
  set({ sync: 'saving' });
  try {
    const r = await api<{ data: unknown }>('/api/progress');
    if (!r.ok) throw new Error(r.body.error || 'Load failed');
    const remote = r.body.data ? sanitize(r.body.data) : emptyProgress();
    applying = true;
    actions.replaceProgress(mergeProgress(getProgress(), remote), true);
    applying = false;
    await push();
  } catch {
    set({ sync: 'error' });
  }
}

let started = false;
export async function initAuth(): Promise<void> {
  if (!started) {
    started = true;
    onProgressChange((_s, silent) => { if (!silent && !applying && state.status === 'user') schedulePush(); });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && state.status === 'user' && timer) { clearTimeout(timer); timer = undefined; void push(true); }
    });
  }
  try {
    const r = await api<{ user: AuthUser }>('/api/auth/me');
    if (r.ok && r.body.user) { set({ status: 'user', user: r.body.user }); await pullAndMerge(); }
    else set({ status: 'guest', user: null });
  } catch {
    set({ status: 'unavailable', user: null });
  }
}

export async function signOut(): Promise<void> {
  clearTimeout(timer);
  if (state.status === 'user') await push(); // flush pending changes first
  try { await api('/api/auth/logout', { method: 'POST' }); } catch { /* ignore */ }
  // Clear this device so the next person starts fresh; progress stays in the account.
  actions.replaceProgress(emptyProgress(getProgress().theme), true);
  set({ status: 'guest', user: null, sync: 'idle', lastSaved: null });
}

/** Reset progress. For a signed-in user this also wipes the cloud copy. */
export async function resetAll(): Promise<void> {
  if (state.status === 'user') {
    try { await api('/api/progress', { method: 'DELETE' }); } catch { /* local reset still happens */ }
  }
  actions.replaceProgress(emptyProgress(getProgress().theme), true);
  if (state.status === 'user') set({ sync: 'saved', lastSaved: Date.now() });
}
