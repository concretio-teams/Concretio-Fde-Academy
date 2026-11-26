import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { modules } from '../content';
import { PART_NAMES, headStart, partProgress, treeStage } from '../lib/tree';
import { useProgress } from '../lib/store';
import { Button } from '../ui';

/* ------------------------------------------------------------------ open and close state */
type Mode = 'intro' | 'view' | null;
let mode: Mode = null;
const subs = new Set<() => void>();
const setMode = (m: Mode) => { mode = m; subs.forEach((f) => f()); };
/** 'intro' is the first big reveal after setup. 'view' is the same tree opened from the sidebar icon. */
export const openTree = (m: 'intro' | 'view' = 'view') => setMode(m);
const useMode = () => useSyncExternalStore((cb) => { subs.add(cb); return () => { subs.delete(cb); }; }, () => mode);

/* ------------------------------------------------------------------ geometry */
const TRUNK = 'M200 384 C196 340 206 300 200 236';
const ROOTS = [
  'M200 384 C190 405 165 420 120 432', 'M200 384 C195 410 185 435 170 452', 'M200 384 C200 400 200 420 200 446',
  'M200 384 C205 412 215 438 232 452', 'M200 384 C212 405 240 420 282 430',
];
const LOWER = [{ d: 'M200 318 C175 305 150 290 118 268', w: 11 }, { d: 'M200 306 C228 292 252 276 284 254', w: 11 }];
const UPPER = [{ d: 'M200 270 C182 252 168 232 150 204', w: 9 }, { d: 'M200 262 C220 244 236 222 254 196', w: 9 }, { d: 'M200 240 C200 214 200 190 200 162', w: 9 }];
type Blob = [number, number, number];
const LEFT: Blob[] = [[132, 262, 26], [112, 258, 34], [96, 280, 24], [84, 236, 28], [150, 236, 28], [118, 214, 32], [150, 196, 32], [172, 208, 28], [132, 172, 26], [170, 160, 30], [190, 140, 28], [78, 262, 22]];
const RIGHT: Blob[] = [[268, 252, 26], [288, 252, 34], [304, 274, 24], [316, 230, 28], [250, 230, 28], [282, 208, 32], [252, 184, 32], [230, 202, 28], [268, 164, 26], [230, 154, 30], [200, 126, 34], [322, 256, 22]];
const BLOSSOM: [number, number][] = [[104, 248], [146, 208], [176, 176], [296, 246], [254, 206], [224, 172], [200, 140]];
const FRUIT: [number, number][] = [[126, 262], [158, 234], [132, 196], [274, 262], [242, 232], [268, 196]];
const GREENS = ['#3f9b5b', '#52b36e', '#2f8a50', '#6cc58a'];
const star = (r: number) => Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI) / 5; const rr = i % 2 ? r * 0.45 : r;
  return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`;
}).join(' ');
const STAR_PTS = star(20);
const clamp = (x: number) => Math.min(1, Math.max(0, x));
/** 0 until the support reaches "from", then fades in over "span". */
const g = (x: number, from: number, span = 0.12) => clamp((x - from) / span);
const count = (p: number, n: number) => (p <= 0 ? 0 : Math.max(1, Math.round(p * n)));

function Stroke({ d, w, color, p, delay, exp, noGhost }: { d: string; w: number; color: string; p: number; delay: number; exp?: boolean; noGhost?: boolean }) {
  // exp: the lighter "head start" layer, drawn in full underneath the real growth
  if (exp) return <path d={d} className="tr-exp" stroke={color} strokeWidth={w} />;
  return (
    <>
      {!noGhost && <path d={d} className="tr-ghost" strokeWidth={w} />}
      <path d={d} className="tr-built" stroke={color} strokeWidth={w} pathLength={100} style={{ strokeDasharray: `${Math.max(0, p) * 100} 100`, opacity: p > 0 ? 1 : 0, transitionDelay: `${delay}ms` }} />
    </>
  );
}

function Blobs({ list, p, delay }: { list: Blob[]; p: number; delay: number }) {
  const n = count(p, list.length);
  return (
    <>
      {list.map(([x, y, r], i) => <circle key={`g${i}`} cx={x} cy={y} r={r} className="tr-gleaf" />)}
      {list.map(([x, y, r], i) => (
        <g key={i} className="tr-leaf" style={{ opacity: i < n ? 1 : 0, transform: `scale(${i < n ? 1 : 0.2})`, transformOrigin: `${x}px ${y}px`, transitionDelay: `${delay + i * 60}ms` }}>
          <circle cx={x} cy={y} r={r} fill={GREENS[i % GREENS.length]} />
          <circle cx={x - r * 0.28} cy={y - r * 0.32} r={r * 0.36} fill="#fff" opacity={0.16} />
        </g>
      ))}
    </>
  );
}

/** The whole tree. Built parts are solid and coloured, the part still to grow is a faint silhouette. */
export function TreeSvg({ parts, sun, hot, head, animate = true }: { parts: number[]; sun: boolean; hot: number | null; head?: boolean[]; animate?: boolean }) {
  const uid = useId().replace(/:/g, '');
  const [on, setOn] = useState(!animate);
  useEffect(() => { if (!animate) return; const t = setTimeout(() => setOn(true), 120); return () => clearTimeout(t); }, [animate]);
  const raw = (i: number) => (on ? parts[i] ?? 0 : 0);
  const h = (i: number) => on && !!head?.[i];
  const hasHead = !!head?.some(Boolean);
  const eff = (i: number) => Math.max(raw(i), h(i) ? 1 : 0); // what a part above can rest on
  // A part only shows growth once the part it hangs from has grown enough to hold it.
  const v = (i: number) => {
    const r = raw(i);
    switch (i) {
      case 1: return r * g(eff(0), 0, 0.12); // trunk needs roots
      case 2: return r * g(eff(1), 0.42, 0.1); // lower branches need the trunk to reach them
      case 3: return r * g(eff(1), 0.75, 0.1); // upper branches need a taller trunk
      case 4: case 5: return r * g(eff(2), 0.3, 0.2); // canopy needs branches
      case 6: case 7: return r * g((eff(4) + eff(5)) / 2, 0.2, 0.2); // blossoms and fruit need leaves
      case 8: return r * g(eff(3), 0.6, 0.2); // the crown sits on the upper branches
      default: return r;
    }
  };
  const dim = (n: number) => `tr-part ${hot !== null && hot !== n ? 'dim' : ''}`;
  const empty = parts.every((x) => x === 0);
  const sprout = !empty && parts[1] === 0 && parts[0] > 0;
  const lightRoot = '#d6b17a'; const lightWood = '#d6b17a';

  return (
    <svg className="tr-svg" viewBox="0 0 400 468" role="img" aria-label="Your growth tree">
      <defs>
        <radialGradient id={`h${uid}`} cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#f5ba2f" stopOpacity="0.42" /><stop offset="100%" stopColor="#f5ba2f" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx={200} cy={200} r={210} fill={`url(#h${uid})`} className="tr-halo" style={{ opacity: sun && on ? 1 : 0 }} />

      <rect x={30} y={384} width={340} height={76} rx={18} className="tr-soil" />
      <line x1={30} y1={384} x2={370} y2={384} className="tr-edge" />

      <g className={dim(1)}>{h(0) && ROOTS.map((d, i) => <Stroke key={`e${i}`} exp d={d} w={i === 2 ? 7 : 5} color={lightRoot} p={1} delay={0} />)}{ROOTS.map((d, i) => <Stroke key={i} d={d} w={i === 2 ? 7 : 5} color="#7a5230" p={Math.min(1, Math.max(0, v(0) * 5 - i * 0.6))} delay={i * 90} noGhost={h(0)} />)}</g>

      <g className={dim(2)}>
        {h(1) && <><Stroke exp d={TRUNK} w={26} color={lightWood} p={1} delay={0} /><Stroke exp d="M205 380 C201 340 211 300 205 240" w={7} color="#efd7ab" p={1} delay={0} /></>}
        <Stroke d={TRUNK} w={26} color="#8b5e34" p={v(1)} delay={0} noGhost={h(1)} />
        <Stroke d="M205 380 C201 340 211 300 205 240" w={7} color="#a9794a" p={v(1)} delay={80} noGhost={h(1)} />
      </g>

      <g className="tr-sway">
        <g className={dim(3)}>{h(2) && LOWER.map((b, i) => <Stroke key={`e${i}`} exp d={b.d} w={b.w} color={lightWood} p={1} delay={0} />)}{LOWER.map((b, i) => <Stroke key={i} d={b.d} w={b.w} color="#8b5e34" p={Math.min(1, Math.max(0, v(2) * 2 - i * 0.8))} delay={i * 150} noGhost={h(2)} />)}</g>
        <g className={dim(4)}>{h(3) && UPPER.map((b, i) => <Stroke key={`e${i}`} exp d={b.d} w={b.w} color={lightWood} p={1} delay={0} />)}{UPPER.map((b, i) => <Stroke key={i} d={b.d} w={b.w} color="#8b5e34" p={Math.min(1, Math.max(0, v(3) * 3 - i * 1.0))} delay={i * 130} noGhost={h(3)} />)}</g>
        <g className={dim(5)}><Blobs list={LEFT} p={v(4)} delay={0} /></g>
        <g className={dim(6)}><Blobs list={RIGHT} p={v(5)} delay={0} /></g>

        <g className={dim(7)}>
          {BLOSSOM.map(([x, y], i) => <circle key={`g${i}`} cx={x} cy={y} r={7} className="tr-gleaf" />)}
          {BLOSSOM.map(([x, y], i) => {
            const k = i < count(v(6), BLOSSOM.length);
            return (
              <g key={i} className="tr-leaf" style={{ opacity: k ? 1 : 0, transform: `scale(${k ? 1 : 0.2})`, transformOrigin: `${x}px ${y}px`, transitionDelay: `${i * 90}ms` }}>
                {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * 4.6} cy={y + Math.sin((a * Math.PI) / 180) * 4.6} r={3.3} fill="#f6b4cb" />)}
                <circle cx={x} cy={y} r={2.6} fill="#f5ba2f" />
              </g>
            );
          })}
        </g>

        <g className={dim(8)}>
          {FRUIT.map(([x, y], i) => <circle key={`g${i}`} cx={x} cy={y} r={7} className="tr-gleaf" />)}
          {FRUIT.map(([x, y], i) => {
            const k = i < count(v(7), FRUIT.length);
            return (
              <g key={i} className="tr-leaf" style={{ opacity: k ? 1 : 0, transform: `scale(${k ? 1 : 0.2})`, transformOrigin: `${x}px ${y}px`, transitionDelay: `${i * 90}ms` }}>
                <circle cx={x} cy={y} r={7} fill="#ee7d22" />
                <circle cx={x - 2.2} cy={y - 2.4} r={2.2} fill="#fff" opacity={0.3} />
                <path d={`M${x} ${y - 7} q1 -4 4 -5`} stroke="#4c7a3a" strokeWidth={1.6} fill="none" strokeLinecap="round" />
              </g>
            );
          })}
        </g>

        <g className={dim(9)} transform="translate(200 82)">
          <polygon points={STAR_PTS} className="tr-gstar" />
          <polygon points={STAR_PTS} className="tr-star" style={{ opacity: v(8) > 0 ? 1 : 0, transform: `scale(${v(8) > 0 ? 0.35 + 0.65 * v(8) : 0.2})` }} />
        </g>
      </g>

      {(empty || sprout) && !hasHead && on && (
        <g className="tr-seed">
          <ellipse cx={200} cy={378} rx={10} ry={7} fill="#8b5e34" />
          <ellipse cx={197} cy={375.5} rx={4} ry={2.4} fill="#fff" opacity={0.25} />
        </g>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ small tree icon, fills with progress */
export function MiniTree({ pct, head = 0, size = 26 }: { pct: number; head?: number; size?: number }) {
  const uid = useId().replace(/:/g, '');
  const top = 21 - (18.5 * Math.min(100, Math.max(0, pct))) / 100; // water line: bottom of the tree to its crown
  const green = top < 14.5 ? { y: top, h: 14.5 - top } : null;
  const brown = { y: Math.max(top, 14.5), h: 21 - Math.max(top, 14.5) };
  const headTop = 21 - (18.5 * Math.min(100, Math.max(0, head))) / 100; // lighter level for the head start
  const showHead = head > pct;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <clipPath id={`c${uid}`}>
          <circle cx={12} cy={9} r={6.5} /><circle cx={7} cy={11.5} r={4.5} /><circle cx={17} cy={11.5} r={4.5} /><rect x={10.8} y={13} width={2.4} height={8} rx={1} />
        </clipPath>
      </defs>
      <g clipPath={`url(#c${uid})`}>
        <rect x={0} y={0} width={24} height={24} fill="currentColor" opacity={0.16} />
        {showHead && <rect x={0} y={headTop} width={24} height={24 - headTop} fill="#b8956a" opacity={0.55} />}
        {green && <rect x={0} y={green.y} width={24} height={green.h} fill="#52b36e" />}
        {brown.h > 0 && <rect x={0} y={brown.y} width={24} height={brown.h} fill="#9a6a3c" />}
      </g>
      <g fill="none" stroke="currentColor" strokeOpacity={0.55} strokeWidth={0.9}>
        <circle cx={12} cy={9} r={6.5} /><circle cx={7} cy={11.5} r={4.5} /><circle cx={17} cy={11.5} r={4.5} /><rect x={10.8} y={13} width={2.4} height={8} rx={1} />
      </g>
    </svg>
  );
}

/** The sidebar row. Its icon is where the big tree shrinks to and grows from. */
export function TreeButton() {
  const p = useProgress();
  const s = treeStage(p);
  const hp = Math.round((headStart(p).filter(Boolean).length / 9) * 100);
  return (
    <button type="button" className="treebtn" onClick={() => openTree('view')} title={`Your tree: ${s.name}, ${s.pct}% grown`}>
      <span className="treeico" data-tree-target><MiniTree pct={s.pct} head={hp} /></span>
      <span className="lbl"><small>Your tree</small><b>{s.name}</b></span>
      <span className="lbl treepct">{s.pct}%</span>
    </button>
  );
}

/* ------------------------------------------------------------------ the big tree, as a card that flies to and from the icon */
interface Origin { dx: number; dy: number; s: number }
const reduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const targetEl = () => [...document.querySelectorAll<HTMLElement>('[data-tree-target]')].find((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > 0 && r.left < window.innerWidth && r.bottom > 0 && r.top < window.innerHeight; });

export function TreeOverlay() {
  const m = useMode();
  const p = useProgress();
  const panel = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'from' | 'open' | 'leaving'>('from');
  const [origin, setOrigin] = useState<Origin | null>(null);
  const [hot, setHot] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  const measure = (): Origin | null => {
    const t = targetEl(); const el = panel.current;
    if (!t || !el) return null;
    // Measure the card at its natural size, whatever transform it currently has.
    const prev = el.style.transform; el.style.transform = 'none';
    const a = el.getBoundingClientRect(); el.style.transform = prev;
    const b = t.getBoundingClientRect();
    return { dx: b.left + b.width / 2 - (a.left + a.width / 2), dy: b.top + b.height / 2 - (a.top + a.height / 2), s: Math.max(0.04, b.width / a.width) };
  };

  useLayoutEffect(() => {
    if (!m) return;
    setHot(null); setPhase('from'); setOrigin(reduced() ? null : measure());
    let r2 = 0; const r1 = requestAnimationFrame(() => { r2 = requestAnimationFrame(() => setPhase('open')); });
    return () => { cancelAnimationFrame(r1); cancelAnimationFrame(r2); };
  }, [m]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const close = () => {
    if (phase === 'leaving') return;
    const done = () => {
      setMode(null);
      const t = targetEl(); if (t) { t.classList.add('pulse'); setTimeout(() => t.classList.remove('pulse'), 900); }
    };
    if (reduced()) return done();
    setOrigin(measure()); setPhase('leaving');
    timer.current = setTimeout(done, 780);
  };

  useEffect(() => {
    if (!m) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!m) return null;
  const s = treeStage(p);
  const parts = partProgress(p);
  const head = headStart(p, parts);
  const headNames = PART_NAMES.filter((_, i) => head[i]);
  const open = phase === 'open';
  const style = {
    transform: open || !origin ? 'none' : `translate(${origin.dx}px, ${origin.dy}px) scale(${origin.s})`,
    opacity: open ? 1 : 0,
    transition: phase === 'from' ? 'none' : 'transform .78s cubic-bezier(.62,0,.22,1), opacity .6s ease',
  };

  return (
    <div className="treeov" role="dialog" aria-modal="true" aria-label="Your growth tree">
      <div className="treebg" style={{ opacity: open ? 1 : 0 }} onClick={m === 'view' ? close : undefined} />
      <div className="treecard" ref={panel} style={style}>
        <div className="treehead">
          <div>
            <div className="kicker">{m === 'intro' ? 'Your growth tree' : 'Your tree'}</div>
            <h2>{m === 'intro' ? 'Every step grows it.' : s.name}</h2>
          </div>
          {m === 'view' && <button className="iconbtn treex" onClick={close} aria-label="Close and shrink the tree to the sidebar">×</button>}
        </div>

        <TreeSvg parts={parts} sun={!!p.final?.passed} hot={hot} head={head} />

        <div className="treestat">
          <div><b>{s.name}</b><span>{s.pct}% grown, {s.left}% still to grow</span></div>
          <div className="treebar" aria-hidden="true"><i style={{ width: `${s.pct}%` }} /></div>
        </div>

        {headNames.length > 0 && (
          <p className="small" style={{ margin: '0 0 8px', textAlign: 'center' }}>Your experience gives you a <b>head start</b>: the lighter {headNames.join(' and ').toLowerCase()}. Pass those lessons' quizzes to make them solid.</p>
        )}
        {m === 'intro' && (
          <p className="muted" style={{ margin: '4px 0 12px' }}>You start as a seed. Finishing lessons, quizzes and assignments{p.profile.sf ? ', and the Salesforce courses on your path,' : ''} grows the roots, then the trunk, the branches, the leaves and the fruit, until the tree is full grown. It lives in the sidebar, so you can come back to it any time.</p>
        )}

        {m === 'view' && <ul className="treelegend">
          {PART_NAMES.map((name, i) => {
            const mod = modules.find((x) => x.number === i + 1);
            const pct = Math.round(parts[i] * 100);
            return (
              <li key={name} onMouseEnter={() => setHot(i + 1)} onMouseLeave={() => setHot(null)} onFocus={() => setHot(i + 1)} onBlur={() => setHot(null)} tabIndex={0}>
                <span className="tlname"><b>{name}</b><small>{p.profile.sf ? `${Math.round((i / 9) * 100)} to ${Math.round(((i + 1) / 9) * 100)}% of your path` : <>Module {i + 1}{mod ? `: ${mod.title}` : ''}</>}</small>{head[i] && <small className="tlhs">Head start from your level</small>}</span>
                <span className="tlpct">{pct}%</span>
              </li>
            );
          })}
        </ul>}
        {m === 'view' && (p.final?.passed ? <p className="small muted" style={{ margin: '8px 0 0' }}>The golden sun behind the tree is your passed final assessment.</p> : <p className="small muted" style={{ margin: '8px 0 0' }}>Pass the final assessment to light up the golden sun behind the tree.</p>)}

        <div className="row" style={{ marginTop: 14, justifyContent: 'center' }}>
          <Button variant="primary" onClick={close}>{m === 'intro' ? 'Start the journey' : 'Back to learning'}</Button>
        </div>
      </div>
    </div>
  );
}
