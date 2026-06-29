'use client';

import { useState, useEffect } from 'react';
import { TIME_CATEGORIES } from '../../lib/constants.js';
import EmptyState from '../../components/EmptyState.js';
import ClientOnly from '../../components/ClientOnly.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const CAT_COLORS = { deep_work: '#1E90FF', meetings: '#4a4a50', admin: '#3a3a40', learning: '#5a5a60', health: '#6a6a70', personal: '#2a2a30', other: '#505058' };

export default function TimePage() {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], category: 'deep_work', hours: '', notes: '' });

  useEffect(() => { load(); }, []);
  function load() { fetch('/api/time').then((r) => r.json()).then((d) => setLogs(d.logs || [])); }

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch('/api/time', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ date: new Date().toISOString().split('T')[0], category: 'deep_work', hours: '', notes: '' });
    load();
  }

  async function handleDelete(id) {
    await fetch('/api/time', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'delete', id }) });
    load();
  }

  const byCat = {};
  logs.forEach((l) => { byCat[l.category] = (byCat[l.category] || 0) + (l.hours || 0); });
  const chartData = TIME_CATEGORIES.map((c) => ({ category: c.replace('_', ' '), hours: byCat[c] || 0, fill: CAT_COLORS[c] || '#505058' }));
  const totalHours = Object.values(byCat).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-[14px] uppercase tracking-[0.12em] font-semibold">TIME LOG</h1>
          <p className="font-mono text-[11px] mt-0.5" style={{ color: 'var(--crm-text-muted)' }}>{totalHours.toFixed(1)} hours logged</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded font-mono text-[11px] uppercase tracking-[0.1em]" style={{ background: '#1E90FF', color: '#fff' }}>+ LOG TIME</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-5 flex gap-4 items-end flex-wrap">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--crm-text-muted)' }}>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--crm-text-muted)' }}>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
              {TIME_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--crm-text-muted)' }}>Hours</label>
            <input type="number" step="0.25" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} required className="input-field w-20" />
          </div>
          <div className="flex-1">
            <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--crm-text-muted)' }}>Notes</label>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" />
          </div>
          <button type="submit" className="px-4 py-2 rounded font-mono text-[11px] uppercase" style={{ background: '#1E90FF', color: '#fff' }}>Add</button>
          <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded font-mono text-[11px] uppercase" style={{ background: 'var(--crm-surface2)', color: 'var(--crm-text-secondary)' }}>Cancel</button>
        </form>
      )}

      {totalHours > 0 && (
        <ClientOnly>
          <div className="glass-card-solid p-5">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold mb-4">HOURS BY CATEGORY</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="category" stroke="#6a6a70" fontSize={10} fontFamily="JetBrains Mono, monospace" textTransform="uppercase" />
                  <YAxis stroke="#6a6a70" fontSize={11} fontFamily="JetBrains Mono, monospace" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--crm-surface)', border: '1px solid var(--crm-border)', borderRadius: '4px', color: 'var(--crm-text)', fontFamily: 'JetBrains Mono, monospace', fontSize: '11px' }} />
                  <Bar dataKey="hours" radius={[2, 2, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </ClientOnly>
      )}

      <div className="glass-card-solid overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--crm-border)' }}>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>Date</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>Category</th>
              <th className="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>Hours</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>Notes</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                <td className="px-4 py-3 font-mono text-[12px]">{l.date}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded capitalize" style={{ backgroundColor: (CAT_COLORS[l.category] || '#505058') + '30', color: l.category === 'deep_work' ? '#1E90FF' : 'var(--crm-text-secondary)' }}>
                    {(l.category || '').replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-[12px]">{l.hours}h</td>
                <td className="px-4 py-3 font-mono text-[11px] truncate max-w-[300px]" style={{ color: 'var(--crm-text-muted)' }}>{l.notes}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(l.id)} className="font-mono text-[10px] uppercase" style={{ color: 'var(--crm-negative)' }}>x</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <EmptyState icon="—" message="No time logged yet." />}
      </div>
    </div>
  );
}
