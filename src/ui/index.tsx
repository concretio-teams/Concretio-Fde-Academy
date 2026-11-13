// Academy UI kit. Every page and block builds on these primitives only.
// This is the single adapter layer: replacing these with Focus UI components later is a one-folder change.
import { useEffect, useState, useSyncExternalStore, type ReactNode, type ButtonHTMLAttributes } from 'react';
import { conceptMap } from '../content';

export function Button({ variant, size, className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost'; size?: 'sm' }) {
  return <button {...p} className={`btn ${variant ?? ''} ${size ?? ''} ${className}`} />;
}

export function LinkButton({ href, variant, size, children }: { href: string; variant?: 'primary' | 'ghost'; size?: 'sm'; children: ReactNode }) {
  return <a href={href} className={`btn ${variant ?? ''} ${size ?? ''}`}>{children}</a>;
}

export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  if (onClick) return <button className={`card click ${className}`} onClick={onClick}>{children}</button>;
  return <div className={`card ${className}`}>{children}</div>;
}

export function Badge({ tone, children }: { tone?: 'ok' | 'accent' | 'warn'; children: ReactNode }) {
  return <span className={`badge ${tone ?? ''}`}>{children}</span>;
}

export function Progress({ value, tone }: { value: number; tone?: 'ok' }) {
  return (
    <div className={`progress ${tone ?? ''}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Ring({ value, label }: { value: number; label?: string }) {
  return (
    <div className="ring" style={{ ['--p' as string]: value }} aria-label={`${value}% complete`}>
      <div><span>{value}%{label && <small className="muted" style={{ display: 'block', fontSize: '.65rem', fontWeight: 500 }}>{label}</small>}</span></div>
    </div>
  );
}

export function PageHead({ kicker, title, children }: { kicker?: string; title: string; children?: ReactNode }) {
  return (
    <div className="page-head">
      {kicker && <div className="kicker">{kicker}</div>}
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Tabs({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="tabs" role="tablist">
        {tabs.map((t, k) => (
          <button key={t.label} role="tab" aria-selected={k === i} className={`tab ${k === i ? 'on' : ''}`} onClick={() => setI(k)}>{t.label}</button>
        ))}
      </div>
      <div>{tabs[i]?.content}</div>
    </div>
  );
}

export function CopyButton({ text, className = 'copy', label = 'Copy' }: { text: string; className?: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      className={className}
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 1200); }).catch(() => undefined);
      }}
    >{ok ? 'Copied' : label}</button>
  );
}

export function CodeBox({ code, lang, title }: { code: string; lang?: string; title?: string }) {
  return (
    <div className="code">
      <div className="bar"><span>{title ?? lang ?? 'text'}</span><CopyButton text={code} /></div>
      <pre><code style={{ background: 'none', border: 0, padding: 0, fontSize: 'inherit' }}>{code}</code></pre>
    </div>
  );
}

/* ---------- click-to-learn concept drawer ---------- */
let openConcept: string | null = null;
const csubs = new Set<() => void>();
export const showConcept = (id: string | null) => { openConcept = id; csubs.forEach((f) => f()); };

export function ConceptDrawer() {
  const id = useSyncExternalStore((cb) => { csubs.add(cb); return () => { csubs.delete(cb); }; }, () => openConcept);
  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') showConcept(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [id]);
  if (!id) return null;
  const c = conceptMap[id];
  if (!c) return null;
  const sections: [string, string][] = [
    ['What it is', c.what], ['Why it matters', c.why], ['How it works', c.how],
    ['When to use it', c.when], ['Practical example', c.example], ['Common mistakes', c.mistakes],
  ];
  return (
    <>
      <div className="overlay" onClick={() => showConcept(null)} />
      <aside className="drawer" role="dialog" aria-label={c.name}>
        <div className="row spread">
          <span className="badge accent">{c.kind ?? 'concept'}</span>
          <Button size="sm" onClick={() => showConcept(null)}>Close</Button>
        </div>
        <h2 style={{ marginTop: 10 }}>{c.name}</h2>
        {sections.map(([l, t]) => (
          <div className="sec" key={l}><div className="lbl">{l}</div><Rich md={t} /></div>
        ))}
      </aside>
    </>
  );
}

/* ---------- rich text renderer ---------- */
const TOKEN = /(\*\*[^*]+\*\*|`[^`]+`|\[\[[^\]]+\]\])/g;

function Inline({ s }: { s: string }) {
  const parts = s.split(TOKEN).filter((x) => x !== '');
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**') && p.length > 4) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith('`') && p.endsWith('`') && p.length > 2) return <code key={i}>{p.slice(1, -1)}</code>;
        if (p.startsWith('[[') && p.endsWith(']]')) {
          const [id, label] = p.slice(2, -2).split('|');
          const c = conceptMap[id.trim()];
          const text = label ?? c?.name ?? id;
          if (!c) return <span key={i}>{text}</span>;
          return <button key={i} className="chip" onClick={() => showConcept(c.id)} title="Click to learn">{text}</button>;
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

export function Rich({ md }: { md: string }) {
  const out: ReactNode[] = [];
  const ul = /^\s*-\s+/, ol = /^\s*\d+\.\s+/;
  for (const para of md.trim().split(/\n\s*\n/)) {
    const lines = para.split('\n');
    let k = 0;
    while (k < lines.length) {
      const kind = ul.test(lines[k]) ? 'ul' : ol.test(lines[k]) ? 'ol' : 'p';
      const grp: string[] = [];
      while (k < lines.length && (ul.test(lines[k]) ? 'ul' : ol.test(lines[k]) ? 'ol' : 'p') === kind) grp.push(lines[k++]);
      const key = out.length;
      if (kind === 'p') out.push(<p key={key}><Inline s={grp.join(' ')} /></p>);
      else {
        const items = grp.map((l, j) => <li key={j}><Inline s={l.replace(kind === 'ul' ? ul : ol, '')} /></li>);
        out.push(kind === 'ul' ? <ul key={key}>{items}</ul> : <ol key={key}>{items}</ol>);
      }
    }
  }
  return <div className="rich">{out}</div>;
}
