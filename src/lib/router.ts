import { startTransition, useEffect, useState } from 'react';

export function parseHash(): string[] {
  const h = window.location.hash.replace(/^#\/?/, '');
  return h.split('/').filter(Boolean).map(decodeURIComponent);
}

/**
 * Two views of the current route:
 * - `now` updates immediately, so navigation highlights respond on click.
 * - `page` updates in a low priority transition, so a heavy lesson page never blocks the click.
 */
export function useRouteState(): { now: string[]; page: string[] } {
  const [now, setNow] = useState<string[]>(parseHash());
  const [page, setPage] = useState<string[]>(now);
  useEffect(() => {
    const on = () => {
      const next = parseHash();
      setNow(next);
      startTransition(() => setPage(next));
      // Jump, never animate: smooth scrolling on every navigation feels like lag.
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    };
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return { now, page };
}

export function useRoute(): string[] {
  return useRouteState().page;
}

export const href = (...parts: string[]) => '#/' + parts.map(encodeURIComponent).join('/');
export const go = (...parts: string[]) => { window.location.hash = href(...parts); };
