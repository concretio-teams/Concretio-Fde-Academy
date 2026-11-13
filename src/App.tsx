import { useEffect, useState } from 'react';
import { href, useRoute } from './lib/router';
import { overall } from './lib/stats';
import { actions, streak, useProgress } from './lib/store';
import { AssignmentsPage, FinalPage, PlaygroundPage, ResourcesPage } from './pages/Practice';
import { KnowledgePage, LessonPage, PathPage } from './pages/Learn';
import { Dashboard, ProgressPage } from './pages/Overview';
import { Button, ConceptDrawer, PageHead } from './ui';

const NAV: [string, string, string][] = [
  ['', 'Dashboard', '◧'], ['path', 'Learning path', '⇢'], ['playground', 'Playground', '▶'],
  ['knowledge', 'Knowledge check', '?'], ['assignments', 'Assignments', '✎'], ['resources', 'Resources', '↗'],
  ['final', 'Final assessment', '★'], ['progress', 'My progress', '◔'],
];

export function App() {
  const route = useRoute();
  const p = useProgress();
  const [open, setOpen] = useState(false);
  useEffect(() => { document.documentElement.dataset.theme = p.theme; }, [p.theme]);
  useEffect(() => setOpen(false), [route.join('/')]);
  const [a, b] = route;
  const o = overall(p);
  const st = streak(p.days);

  let page;
  if (!a) page = <Dashboard />;
  else if (a === 'path') page = <PathPage />;
  else if (a === 'lesson' && b) page = <LessonPage key={b} id={b} />;
  else if (a === 'playground') page = <PlaygroundPage />;
  else if (a === 'knowledge') page = <KnowledgePage lessonId={b} />;
  else if (a === 'assignments') page = <AssignmentsPage id={b} />;
  else if (a === 'resources') page = <ResourcesPage />;
  else if (a === 'final') page = <FinalPage />;
  else if (a === 'progress') page = <ProgressPage />;
  else page = <PageHead title="Page not found"><a href={href()}>Back to dashboard</a></PageHead>;

  const active = a === 'lesson' ? 'path' : a ?? '';
  return (
    <div className="app">
      <div className="mobilebar">
        <Button size="sm" onClick={() => setOpen(!open)} aria-label="Menu">Menu</Button>
        <b>Claude Code Academy</b>
      </div>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand"><span className="logo">&gt;_</span> Claude Code Academy</div>
        <nav className="nav">
          {NAV.map(([k, label, ic]) => (
            <a key={k} href={k ? href(k) : '#/'} className={active === k ? 'active' : ''}><span className="ic">{ic}</span>{label}</a>
          ))}
        </nav>
        <div className="side-foot">
          <div className="small muted">{o.pct}% complete, {st.current} day streak</div>
          <Button size="sm" onClick={() => actions.setTheme(p.theme === 'dark' ? 'light' : 'dark')}>{p.theme === 'dark' ? 'Light theme' : 'Dark theme'}</Button>
        </div>
      </aside>
      <main className="main">{page}</main>
      <ConceptDrawer />
    </div>
  );
}
