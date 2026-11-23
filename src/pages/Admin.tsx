import { useEffect, useMemo, useState } from 'react';
import { modules } from '../content';
import type { ProgressData } from '../../shared/progress';
import { sanitize } from '../../shared/progress';
import { useAuth } from '../lib/auth';
import { day1Done, moduleStats, overall } from '../lib/stats';
import { Badge, Button, Card, PageHead, Progress } from '../ui';

interface Learner { id: string; name: string; email: string; joined: number; updatedAt: number; data: ProgressData | null }

const day = (t: number) => (t ? new Date(t).toISOString().slice(0, 10) : 'never');

export function AdminPage() {
  const auth = useAuth();
  const [rows, setRows] = useState<Learner[] | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (auth.status !== 'user') return;
    fetch('/api/admin/cohort', { credentials: 'same-origin' })
      .then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Failed'); setRows(j.learners); })
      .catch((e) => setErr(e.message));
  }, [auth.status]);

  const table = useMemo(() => (rows ?? []).map((l) => {
    const p = sanitize(l.data);
    const o = overall(p);
    return {
      ...l, pct: o.pct, day1: day1Done(p), final: !!p.final?.passed,
      mods: modules.map((m) => moduleStats(p, m).pct),
      active: l.updatedAt,
    };
  }), [rows]);

  if (auth.status !== 'user') return <PageHead title="Cohort progress">Sign in with an admin account to see this page.</PageHead>;
  if (err) return <PageHead title="Cohort progress">{err === 'Admins only' ? 'Your account is not an admin. Ask for your email to be added to ADMIN_EMAILS.' : err}</PageHead>;
  if (!rows) return <PageHead title="Cohort progress">Loading...</PageHead>;

  const csv = () => {
    const head = ['name', 'email', 'joined', 'last_active', 'overall_pct', 'day1_proof', 'final_passed', ...modules.map((m) => `m${m.number}_pct`)];
    const q = (v: string | number | boolean) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = [head.join(','), ...table.map((r) => [r.name, r.email, day(r.joined), day(r.active), r.pct, r.day1, r.final, ...r.mods].map(q).join(','))];
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    a.download = `academy-cohort-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const avg = table.length ? Math.round(table.reduce((a, r) => a + r.pct, 0) / table.length) : 0;
  return (
    <>
      <PageHead kicker="Admin" title="Cohort progress">Who has started, who has done the Day 1 proof, and who has passed the final.</PageHead>
      <div className="grid c3" style={{ marginBottom: 16 }}>
        <Card><b>Learners</b><p className="stat"><b>{table.length}</b></p></Card>
        <Card><b>Day 1 proof done</b><p className="stat"><b>{table.filter((r) => r.day1).length}</b></p></Card>
        <Card><b>Final passed</b><p className="stat"><b>{table.filter((r) => r.final).length}</b> <span className="small muted">average progress {avg}%</span></p></Card>
      </div>
      <div className="row" style={{ marginBottom: 10 }}><Button onClick={csv}>Download CSV</Button></div>
      <div style={{ overflowX: 'auto' }}>
        <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ textAlign: 'left' }}><th>Learner</th><th>Overall</th><th>Day 1</th><th>Final</th>{modules.map((m) => <th key={m.id}>M{m.number}</th>)}<th>Last active</th></tr></thead>
          <tbody>
            {table.map((r) => (
              <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td><b>{r.name}</b><div className="small muted">{r.email}</div></td>
                <td style={{ minWidth: 110 }}><Progress value={r.pct} /> <span className="small">{r.pct}%</span></td>
                <td>{r.day1 ? <Badge tone="ok">Done</Badge> : <Badge>Open</Badge>}</td>
                <td>{r.final ? <Badge tone="ok">Passed</Badge> : <Badge>Open</Badge>}</td>
                {r.mods.map((v, i) => <td key={i} className="small">{v}%</td>)}
                <td className="small muted">{day(r.active)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
