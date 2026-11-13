import { useEffect, useRef, useState } from 'react';
import type { Block } from '../content/types';
import { useProgress } from '../lib/store';
import { Rich, showConcept } from '../ui';

type DiagramBlock = Extract<Block, { type: 'diagram' }>;
let counter = 0;

export function Diagram({ block }: { block: DiagramBlock }) {
  const ref = useRef<HTMLDivElement>(null);
  const dark = useProgress().theme === 'dark';
  const [sel, setSel] = useState<string | null>(null);
  const [err, setErr] = useState('');
  const keys = Object.keys(block.nodes);

  useEffect(() => {
    let dead = false;
    setErr('');
    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({ startOnLoad: false, theme: dark ? 'dark' : 'neutral', securityLevel: 'strict', fontFamily: 'inherit' });
        const id = `mmd${++counter}`;
        const { svg } = await mermaid.render(id, block.mermaid);
        if (dead || !ref.current) return;
        ref.current.innerHTML = svg;
        ref.current.querySelectorAll<SVGGElement>('g.node').forEach((g) => {
          const m = /^flowchart-(.+)-\d+$/.exec(g.id);
          const key = m?.[1];
          if (!key || !block.nodes[key]) return;
          g.setAttribute('tabindex', '0');
          g.setAttribute('role', 'button');
          g.dataset.key = key;
          g.addEventListener('click', () => setSel(key));
          g.addEventListener('keydown', (e) => { if ((e as KeyboardEvent).key === 'Enter') setSel(key); });
        });
      } catch (e) {
        document.querySelectorAll('[id^="dmmd"]').forEach((n) => n.remove());
        if (!dead) setErr(e instanceof Error ? e.message : 'Diagram failed to render');
      }
    })();
    return () => { dead = true; };
  }, [block.mermaid, dark]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    ref.current?.querySelectorAll('g.node').forEach((g) => g.classList.toggle('sel', (g as SVGGElement).dataset.key === sel));
  }, [sel]);

  const info = sel ? block.nodes[sel] : null;
  return (
    <div className="block">
      <div className="block-title">{block.title}{keys.length > 0 && <span className="badge accent">click a box</span>}</div>
      {err ? <pre className="pbox bad">{err}{'\n\n'}{block.mermaid}</pre> : <div className="diagram" ref={ref}>Loading diagram...</div>}
      {block.caption && <div className="muted small" style={{ marginTop: 6 }}><Rich md={block.caption} /></div>}
      {info && (
        <div className="detail">
          <h4>{info.title}</h4>
          <Rich md={info.what} />
          {info.useCase && <><div className="lbl">Use case</div><Rich md={info.useCase} /></>}
          {info.example && <><div className="lbl">Example</div><Rich md={info.example} /></>}
          {info.related && info.related.length > 0 && (
            <div className="row" style={{ marginTop: 8 }}>
              <span className="lbl" style={{ margin: 0 }}>Related</span>
              {info.related.map((r) => <button key={r} className="chip" onClick={() => showConcept(r)}>{r}</button>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
