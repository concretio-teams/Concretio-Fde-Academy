import { useEffect, useRef, useState } from 'react';
import { SearchPalette, ShortcutsHelp, modKey, setSearchOpen } from './components/SearchPalette';
import { initAuth, useAuth } from './lib/auth';
import { href, useRoute } from './lib/router';
import { PAGES } from './lib/search';
import { nextAction, overall } from './lib/stats';
import { actions, streak, useProgress } from './lib/store';
import { KnowledgePage, LessonPage, PathPage } from './pages/Learn';
import { LoginPage, syncLabel } from './pages/Login';
import { Dashboard, ProgressPage } from './pages/Overview';
import { AssignmentsPage, FinalPage, PlaygroundPage, ResourcesPage } from './pages/Practice';
import { Button, ConceptDrawer, PageHead } from './ui';

const ICONS: Record<string, string> = { '': '◧', path: '⇢', playground: '▶', knowledge: '?', assignments: '✎', resources: '↗', final: '★', progress: '◔' };
const NAV = PAGES.map(([k, label]) => [k, label, ICONS[k]] as const);
const COLLAPSE_KEY = 'cca-sidebar-collapsed';

function typing(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
}

export function App() {
  const route = useRoute();
  const p = useProgress();
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [help, setHelp] = useState(false);
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; } });
  const gPressed = useRef(0);

  const toggleCollapsed = () => setCollapsed((c) => { const n = !c; try { localStorage.setItem(COLLAPSE_KEY, n ? '1' : '0'); } catch { /* ignore */ } return n; });
  const progressRef = useRef(p);
  progressRef.current = p;

  useEffect(() => { document.documentElement.dataset.theme = p.theme; }, [p.theme]);
  useEffect(() => { void initAuth(); }, []);
  useEffect(() => setOpen(false), [route.join('/')]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(true); return; }
      if (typing(e.target) || mod || e.altKey) return;
      if (e.key === '/') { e.preventDefault(); setSearchOpen(true); }
      else if (e.key === '?') { setHelp(true); }
      else if (e.key === '[') { toggleCollapsed(); }
      else if (e.key === 'Escape') { setHelp(false); }
      else if (e.key.toLowerCase() === 'c') { window.location.hash = nextAction(progressRef.current).href; }
      else if (e.key.toLowerCase() === 'g') { gPressed.current = Date.now(); }
      else if (Date.now() - gPressed.current < 1200) {
        const dest: Record<string, string> = { d: '#/', p: '#/path', l: '#/playground' };
        const k = e.key.toLowerCase();
        if (dest[k]) { window.location.hash = dest[k]; gPressed.current = 0; }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const [a, b, c] = route;
  const o = overall(p);
  const st = streak(p.days);
  const next = nextAction(p);

  let page;
  if (!a) page = <Dashboard />;
  else if (a === 'path') page = <PathPage />;
  else if (a === 'lesson' && b) page = <LessonPage key={b} id={b} scrollToQuiz={c === 'quiz'} />;
  else if (a === 'playground') page = <PlaygroundPage id={b} />;
  else if (a === 'knowledge') page = <KnowledgePage lessonId={b} />;
  else if (a === 'assignments') page = <AssignmentsPage id={b} />;
  else if (a === 'resources') page = <ResourcesPage />;
  else if (a === 'final') page = <FinalPage />;
  else if (a === 'progress') page = <ProgressPage />;
  else if (a === 'login') page = <LoginPage />;
  else page = <PageHead title="Page not found"><a href={href()}>Back to dashboard</a></PageHead>;

  const active = a === 'lesson' ? 'path' : a ?? '';
  return (
    <div className={`app ${collapsed ? 'collapsed' : ''}`}>
      <div className="mobilebar">
        <Button size="sm" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>Menu</Button>
        <b style={{ flex: 1 }}>Claude Code Academy</b>
        <Button size="sm" onClick={() => setSearchOpen(true)} aria-label="Search">Search</Button>
        <a className="btn sm primary" href="#/login">{auth.status === 'user' ? 'Account' : 'Sign in'}</a>
      </div>
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">
        <div className="brand">
          <span className="logo">&gt;_</span><span className="lbl">Claude Code Academy</span>
          <button className="collapse-btn" onClick={toggleCollapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={`${collapsed ? 'Expand' : 'Collapse'} sidebar ([)`}>{collapsed ? '»' : '«'}</button>
        </div>
        <button className="searchbtn" onClick={() => setSearchOpen(true)} title={`Search (${modKey} K)`}>
          <span className="ic">⌕</span><span className="lbl">Search</span><kbd className="lbl">{modKey} K</kbd>
        </button>
        <a className="continue" href={next.href} title={`${next.label}: ${next.why}`}>
          <span className="ic">▸</span><span className="lbl"><small>{next.step}</small><b>{next.label}</b></span>
        </a>
        <nav className="nav">
          {NAV.map(([k, label, ic]) => (
            <a key={k} href={k ? href(k) : '#/'} className={active === k ? 'active' : ''} title={label} aria-current={active === k ? 'page' : undefined}>
              <span className="ic">{ic}</span><span className="lbl">{label}</span>
            </a>
          ))}
        </nav>
        <div className="side-foot">
          <div className="small muted lbl">{o.pct}% complete, {st.current} day streak</div>
          {auth.status === 'user' && auth.user ? (
            <a className="account" href="#/login" title={`${auth.user.email}: ${syncLabel(auth)}`}>
              <span className="avatar">{(auth.user.name || auth.user.email)[0].toUpperCase()}</span>
              <span className="lbl"><b>{auth.user.name}</b><small className={auth.sync === 'error' ? 'warnText' : ''}>{syncLabel(auth)}</small></span>
            </a>
          ) : (
            <a className="account" href="#/login" title="Sign in to save progress across devices">
              <span className="avatar">→</span><span className="lbl"><b>Sign in</b><small>{auth.status === 'unavailable' ? 'Server offline, saving locally' : 'Save progress to your account'}</small></span>
            </a>
          )}
          <div className="row" style={{ gap: 6 }}>
            <Button size="sm" onClick={() => actions.setTheme(p.theme === 'dark' ? 'light' : 'dark')} title="Toggle theme" aria-label="Toggle theme">{p.theme === 'dark' ? '☀' : '☾'}<span className="lbl">{p.theme === 'dark' ? ' Light' : ' Dark'}</span></Button>
            <Button size="sm" onClick={() => setHelp(true)} title="Keyboard shortcuts (?)" aria-label="Keyboard shortcuts">?</Button>
          </div>
        </div>
      </aside>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <main className="main">{page}</main>
      <SearchPalette />
      {help && <ShortcutsHelp onClose={() => setHelp(false)} />}
      <ConceptDrawer />
    </div>
  );
}
