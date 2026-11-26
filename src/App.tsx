import { useCallback, useEffect, useRef, useState } from 'react';
import { SearchPalette, ShortcutsHelp, modKey, setSearchOpen } from './components/SearchPalette';
import { Sidebar, LOGO_FULL } from './components/Sidebar';
import { MiniTree, TreeOverlay, openTree } from './components/Tree';
import { initAuth, useAuth } from './lib/auth';
import { href, useRouteState } from './lib/router';
import { nextAction, overall } from './lib/stats';
import { useProgress } from './lib/store';
import { KnowledgePage, LessonPage, PathPage } from './pages/Learn';
import { AdminPage } from './pages/Admin';
import { JourneyPage } from './pages/Journey';
import { AuthScreen } from './pages/AuthScreen';
import { Onboarding } from './pages/Onboarding';
import { SetupPage } from './pages/Setup';
import { TiersPage } from './pages/Tiers';
import { SalesforcePage } from './pages/Salesforce';
import { LoginPage } from './pages/Login';
import { Dashboard, ProgressPage } from './pages/Overview';
import { GlossaryPage, StartPage } from './pages/Start';
import { AssignmentsPage, FinalPage, PlaygroundPage, ResourcesPage } from './pages/Practice';
import { ConceptDrawer, PageHead } from './ui';
import { Icon } from './ui/icons';

const COLLAPSE_KEY = 'cca-sidebar-collapsed';

function typing(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
}

export function App() {
  const { now, page: route } = useRouteState();
  const p = useProgress();
  const auth = useAuth();
  const [open, setOpen] = useState(false);
  const [help, setHelp] = useState(false);
  const [collapsed, setCollapsed] = useState(() => { try { return localStorage.getItem(COLLAPSE_KEY) === '1'; } catch { return false; } });
  const gPressed = useRef(0);
  // True once the first load of a signed-in learner's saved progress has finished (or failed), so a returning
  // learner never flashes the setup questions while their saved answers are still arriving.
  const [loaded, setLoaded] = useState(false);

  const toggleCollapsed = useCallback(() => setCollapsed((c) => { const n = !c; try { localStorage.setItem(COLLAPSE_KEY, n ? '1' : '0'); } catch { /* ignore */ } return n; }), []);
  const openHelp = useCallback(() => setHelp(true), []);
  const progressRef = useRef(p);
  progressRef.current = p;

  useEffect(() => { document.documentElement.dataset.theme = p.theme; }, [p.theme]);
  useEffect(() => { void initAuth(); }, []);
  useEffect(() => setOpen(false), [now.join('/')]);
  useEffect(() => {
    if (auth.status !== 'user') setLoaded(false);
    else if (auth.sync === 'saved' || auth.sync === 'error') setLoaded(true);
  }, [auth.status, auth.sync]);

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

  // The academy sits behind sign-in. A first-time learner is walked through setup before anything else.
  // If the API is unreachable (static hosting, offline), the app opens as before and saves locally.
  if (auth.status === 'loading' || (auth.status === 'user' && !loaded)) return <div className="splash"><img src={LOGO_FULL} alt="Concretio" height={30} /><div className="spin" aria-label="Loading" /></div>;
  if (auth.status === 'guest') return <AuthScreen />;
  if (auth.status === 'user' && !p.profile.done) return <Onboarding />;

  const [a, b, c] = route;

  let page;
  if (!a) page = <Dashboard />;
  else if (a === 'start') page = <StartPage />;
  else if (a === 'glossary') page = <GlossaryPage />;
  else if (a === 'path') page = <PathPage />;
  else if (a === 'journey') page = <JourneyPage />;
  else if (a === 'tiers') page = <TiersPage tier={b} />;
  else if (a === 'salesforce') page = <SalesforcePage />;
  else if (a === 'setup') page = <SetupPage />;
  else if (a === 'lesson' && b) page = <LessonPage key={b} id={b} scrollToQuiz={c === 'quiz'} />;
  else if (a === 'playground') page = <PlaygroundPage id={b} />;
  else if (a === 'knowledge') page = <KnowledgePage lessonId={b} />;
  else if (a === 'assignments') page = <AssignmentsPage id={b} />;
  else if (a === 'resources') page = <ResourcesPage />;
  else if (a === 'final') page = <FinalPage />;
  else if (a === 'progress') page = <ProgressPage />;
  else if (a === 'login') page = <LoginPage />;
  else if (a === 'admin') page = <AdminPage />;
  else page = <PageHead title="Page not found"><a href={href()}>Back to dashboard</a></PageHead>;

  // The highlight follows the click immediately; the page below catches up without blocking it.
  const activeRoute = now[0];
  const active = activeRoute === 'lesson' ? 'path' : activeRoute ?? '';
  return (
    <div className={`app ${collapsed ? 'collapsed' : ''}`}>
      <div className="mobilebar">
        <button className="iconbtn" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}><Icon name="menu" size={20} /></button>
        <a href="#/" className="mobilebrand" aria-label="Concretio FDE Academy, home"><img src={LOGO_FULL} alt="Concretio" height={22} /><span>FDE Academy</span></a>
        <button className="iconbtn" onClick={() => setSearchOpen(true)} aria-label="Search"><Icon name="search" size={20} /></button>
        <button className="iconbtn" data-tree-target onClick={() => openTree('view')} aria-label="My growth tree"><MiniTree pct={overall(p).pct} size={24} /></button>
        <a className="btn sm primary" href="#/login">{auth.status === 'user' ? 'Account' : 'Sign in'}</a>
      </div>
      <Sidebar active={active} open={open} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} onHelp={openHelp} />
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <main className="main">{page}</main>
      <SearchPalette />
      <TreeOverlay />
      {help && <ShortcutsHelp onClose={() => setHelp(false)} />}
      <ConceptDrawer />
    </div>
  );
}
