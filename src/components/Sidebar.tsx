import { memo } from 'react';
import { syncLabel } from '../pages/Login';
import { useAuth } from '../lib/auth';
import { href } from '../lib/router';
import { PAGES } from '../lib/search';
import { nextAction, overall } from '../lib/stats';
import { actions, streak, useProgress } from '../lib/store';
import { Icon, type IconName } from '../ui/icons';
import { modKey, setSearchOpen } from './SearchPalette';

const BASE = import.meta.env.BASE_URL;
export const LOGO_FULL = `${BASE}brand/concretio-logo-white.webp`;
export const LOGO_MARK = `${BASE}brand/concretio-balloon.webp`;

const ICON: Record<string, IconName> = {
  start: 'flag', '': 'grid', path: 'route', resources: 'book', glossary: 'list',
  playground: 'play', knowledge: 'help', assignments: 'pencil', final: 'award', progress: 'chart',
};

// Same pages as search, grouped the way a learner thinks: learn it, practise it, prove it.
const SECTIONS: [string, string[]][] = [
  ['Learn', ['start', '', 'path', 'resources', 'glossary']],
  ['Practise', ['playground', 'knowledge', 'assignments']],
  ['Prove', ['final', 'progress']],
];
const labelOf = (k: string) => PAGES.find((p) => p[0] === k)?.[1] ?? k;

interface Props {
  active: string; // key of the highlighted page, updates immediately on click
  open: boolean; // mobile drawer
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onHelp: () => void;
}

function SidebarView({ active, open, collapsed, onToggleCollapsed, onHelp }: Props) {
  const p = useProgress();
  const auth = useAuth();
  const o = overall(p);
  const st = streak(p.days);
  const next = nextAction(p);
  const dark = p.theme === 'dark';
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">
      <div className="brand">
        <a href="#/" className="brandlink" aria-label="Concretio FDE Academy, home">
          <img className="logo-full" src={LOGO_FULL} alt="Concretio" height={26} />
          <img className="logo-mark" src={LOGO_MARK} alt="Concretio" width={30} height={30} />
        </a>
        <button className="iconbtn collapse-btn" onClick={onToggleCollapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={`${collapsed ? 'Expand' : 'Collapse'} sidebar ([)`}>
          <Icon name={collapsed ? 'chevronsRight' : 'chevronsLeft'} />
        </button>
      </div>
      <div className="product lbl">FDE Academy</div>

      <button className="searchbtn" onClick={() => setSearchOpen(true)} title={`Search (${modKey} K)`}>
        <Icon name="search" /><span className="lbl">Search</span><kbd className="lbl">{modKey} K</kbd>
      </button>

      <a className="continue" href={next.href} title={`${next.label}: ${next.why}`}>
        <span className="lbl"><small>Next: {next.step}</small><b>{next.label}</b></span>
        <Icon name="arrow" />
      </a>

      <nav className="nav" aria-label="Pages">
        {SECTIONS.map(([title, keys]) => (
          <div key={title} className="navgroup">
            <div className="navhead lbl">{title}</div>
            {keys.map((k) => (
              <a key={k} href={k ? href(k) : '#/'} className={active === k ? 'active' : ''} title={labelOf(k)} aria-current={active === k ? 'page' : undefined}>
                <Icon name={ICON[k] ?? 'list'} /><span className="lbl">{labelOf(k)}</span>
              </a>
            ))}
          </div>
        ))}
      </nav>

      <div className="side-foot">
        <div className="sideprogress lbl">
          <div className="sp-row"><span>{o.pct}% complete</span><span>{st.current} day streak</span></div>
          <div className="sp-bar" role="progressbar" aria-valuenow={o.pct} aria-valuemin={0} aria-valuemax={100}><i style={{ width: `${o.pct}%` }} /></div>
        </div>
        {auth.status === 'user' && auth.user ? (
          <a className="account" href="#/login" title={`${auth.user.email}: ${syncLabel(auth)}`}>
            <span className="avatar">{(auth.user.name || auth.user.email)[0].toUpperCase()}</span>
            <span className="lbl"><b>{auth.user.name}</b><small className={auth.sync === 'error' ? 'warnText' : ''}>{syncLabel(auth)}</small></span>
          </a>
        ) : (
          <a className="account" href="#/login" title="Sign in to save progress across devices">
            <span className="avatar"><Icon name="login" size={16} /></span>
            <span className="lbl"><b>Sign in</b><small>{auth.status === 'unavailable' ? 'Server offline, saving locally' : 'Save progress to your account'}</small></span>
          </a>
        )}
        <div className="footbtns">
          <button className="iconbtn" onClick={() => actions.setTheme(dark ? 'light' : 'dark')} title={dark ? 'Switch to light theme' : 'Switch to dark theme'} aria-label="Toggle theme">
            <Icon name={dark ? 'sun' : 'moon'} />
          </button>
          <button className="iconbtn" onClick={onHelp} title="Keyboard shortcuts (?)" aria-label="Keyboard shortcuts">
            <Icon name="keyboard" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// Re-render only when navigation or progress actually changes, not when the page content does.
export const Sidebar = memo(SidebarView);
