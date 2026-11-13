import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { PAGES, search, type Entry } from '../lib/search';
import { href } from '../lib/router';
import { showConcept } from '../ui';

let open = false;
const subs = new Set<() => void>();
export const setSearchOpen = (v: boolean) => { open = v; subs.forEach((f) => f()); };
export const useSearchOpen = () => useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb); }; }, () => open);

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
export const modKey = isMac ? '⌘' : 'Ctrl';

const KIND_ICON: Record<string, string> = { Page: '◧', Module: '▤', Lesson: '▸', Concept: '◆', Exercise: '▶', Assignment: '✎', Resource: '↗' };

export function SearchPalette() {
  const isOpen = useSearchOpen();
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results: Entry[] = useMemo(() => {
    if (!isOpen) return [];
    if (!q.trim()) return PAGES.map(([k, title, sub]) => ({ id: 'p' + k, kind: 'Page' as const, title, sub, text: '', go: k ? href(k) : '#/' }));
    return search(q);
  }, [q, isOpen]);

  useEffect(() => { if (isOpen) { setQ(''); setI(0); setTimeout(() => inputRef.current?.focus(), 0); } }, [isOpen]);
  useEffect(() => { setI(0); }, [q]);
  useEffect(() => { listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }); }, [i]);

  if (!isOpen) return null;
  const choose = (e: Entry | undefined) => {
    if (!e) return;
    setSearchOpen(false);
    if (e.concept) showConcept(e.concept);
    else if (e.go) window.location.hash = e.go;
  };
  const onKey = (ev: React.KeyboardEvent) => {
    if (ev.key === 'ArrowDown') { ev.preventDefault(); setI((x) => Math.min(x + 1, results.length - 1)); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); setI((x) => Math.max(x - 1, 0)); }
    else if (ev.key === 'Enter') { ev.preventDefault(); choose(results[i]); }
    else if (ev.key === 'Escape') { ev.preventDefault(); setSearchOpen(false); }
  };

  return (
    <>
      <div className="overlay" onClick={() => setSearchOpen(false)} />
      <div className="palette" role="dialog" aria-label="Search the academy" onKeyDown={onKey}>
        <input
          ref={inputRef} type="text" value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Search lessons, concepts, exercises, commands..." aria-label="Search"
          role="combobox" aria-expanded aria-controls="search-results" aria-activedescendant={results[i] ? 'sr-' + results[i].id : undefined}
        />
        <div className="results" id="search-results" role="listbox" ref={listRef}>
          {results.length === 0 && <div className="empty">No matches for "{q}". Try a command like "compact" or a topic like "hooks".</div>}
          {!q.trim() && <div className="grp">Jump to</div>}
          {results.map((e, k) => (
            <button key={e.id} id={'sr-' + e.id} role="option" aria-selected={k === i} className={`res ${k === i ? 'on' : ''}`} onMouseEnter={() => setI(k)} onClick={() => choose(e)}>
              <span className="ic">{KIND_ICON[e.kind]}</span>
              <span className="tx"><b>{e.title}</b><small>{e.sub}</small></span>
              <span className="badge">{e.kind}</span>
            </button>
          ))}
        </div>
        <div className="foot"><span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div>
      </div>
    </>
  );
}

export function ShortcutsHelp({ onClose }: { onClose: () => void }) {
  const rows: [string, string][] = [
    [`${modKey} K  or  /`, 'Search everything'],
    ['G then D / P / L', 'Go to Dashboard, Path or Playground'],
    ['C', 'Continue where you left off'],
    ['[', 'Collapse or expand the sidebar'],
    ['?', 'Show this help'],
    ['Esc', 'Close dialogs'],
  ];
  return (
    <>
      <div className="overlay" onClick={onClose} />
      <div className="palette" role="dialog" aria-label="Keyboard shortcuts" style={{ padding: 20 }}>
        <div className="row spread"><h3 style={{ margin: 0 }}>Keyboard shortcuts</h3><button className="btn sm" onClick={onClose}>Close</button></div>
        <table style={{ marginTop: 10 }}><tbody>{rows.map(([k, d]) => <tr key={k}><td><kbd>{k}</kbd></td><td style={{ whiteSpace: 'normal', fontWeight: 400 }}>{d}</td></tr>)}</tbody></table>
      </div>
    </>
  );
}
