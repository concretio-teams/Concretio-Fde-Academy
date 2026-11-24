import { useEffect, useMemo, useState } from 'react';
import { modules } from '../content';
import type { ProgressData } from '../../shared/progress';
import { sanitize } from '../../shared/progress';
import { useAuth } from '../lib/auth';
import { day1Done, moduleStats, overall } from '../lib/stats';
import { Badge, Button, Card, PageHead, Progress } from '../ui';

interface Learner { id: string; name: string; email: string; joined: number; updatedAt: number; data: ProgressData | null }

const day = (t: number) => (t ? new Date(t).toISOString().slice(0, 10) : 'never');

interface UserRow { id: string; name: string; email: string; role: 'admin' | 'manager' | 'learner'; google: boolean }

/** Admin only: see everyone and change their role. The server enforces this; the page just reflects it. */
function Roles({ meId }: { meId: string }) {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [msg, setMsg] = useState('');
  const load = () => fetch('/api/admin/users', { credentials: 'same-origin' }).then((r) => r.json()).then((j) => setUsers(j.users)).catch(() => setMsg('Could not load users'));
  useEffect(() => { void load(); }, []);
  const change = async (id: string, role: string) => {
    setMsg('');
    const r = await fetch(`/api/admin/users/${id}/role`, { method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
    const j = await r.json().catch(() => ({}));
    setMsg(r.ok ? 'Role updated' : j.error || 'Could not update the role');
    await load();
  };
  if (!users) return null;
  return (
    <div className="block">
      <h3>Users and roles</h3>
      <p className="small muted">Admin can manage roles and see everything. Manager can see the cohort, read only. Learner sees only their own progress.</p>
      {msg && <div className="feedback" role="status">{msg}</div>}
      <div style={{ overflowX: 'auto' }}>
        <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ textAlign: 'left' }}><th>Person</th><th>Sign in</th><th>Role</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderTop: '1px solid var(--border)' }}>
                <td><b>{u.name}</b><div className="small muted">{u.email}</div></td>
                <td className="small">{u.google ? 'Google' : 'Password'}</td>
                <td>
                  <select value={u.role} disabled={u.id === meId} onChange={(e) => void change(u.id, e.target.value)} aria-label={`Role for ${u.name}`}>
                    <option value="learner">Learner</option><option value="manager">Manager</option><option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
  if (err) return <PageHead title="Cohort progress">{/access/i.test(err) ? 'This page is for managers and admins. Ask an admin to change your role.' : err}</PageHead>;
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
      {auth.user?.role === 'admin' && <Roles meId={auth.user.id} />}
      <h3>Progress</h3>
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
