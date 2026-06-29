'use client';

import { useState, useEffect } from 'react';
import { TIME_CATEGORIES } from '../../lib/constants.js';
import EmptyState from '../../components/EmptyState.js';
import ClientOnly from '../../components/ClientOnly.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const CAT_COLORS = { deep_work: '#4ade80', meetings: 'rgba(74,222,128,0.6)', admin: 'rgba(74,222,128,0.4)', learning: 'rgba(74,222,128,0.3)', health: 'rgba(74,222,128,0.2)', personal: 'rgba(74,222,128,0.15)', other: 'rgba(74,222,128,0.1)' };

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
  const chartData = TIME_CATEGORIES.map((c) => ({ category: c.replace('_', ' '), hours: byCat[c] || 0, fill: CAT_COLORS[c] || 'rgba(74,222,128,0.1)' }));
  const totalHours = Object.values(byCat).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Time Log</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--crm-text-muted)' }}>{totalHours.toFixed(1)} hours logged</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl text-[13px] font-medium" style={{ background: 'var(--crm-accent)', color: '#0a0c0a' }}>+ Log time</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-5 flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
              {TIME_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Hours</label>
            <input type="number" step="0.25" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} required className="input-field w-20" />
          </div>
          <div className="flex-1">
            <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Notes</label>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" />
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl text-[13px] font-medium" style={{ background: 'var(--crm-accent)', color: '#0a0c0a' }}>Add</button>
          <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-[13px]" style={{ background: 'var(--crm-surface2)', color: 'var(--crm-text-secondary)' }}>Cancel</button>
        </form>
      )}

      {totalHours > 0 && (
        <ClientOnly>
          <div className="glass-card-solid p-5">
            <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--crm-text-secondary)' }}>Hours by category</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="none" vertical={false} />
                  <XAxis dataKey="category" stroke="#6a706a" fontSize={12} fontFamily="Inter" tickLine={false} axisLine={false} />
                  <YAxis stroke="#6a706a" fontSize={12} fontFamily="Inter" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#161916', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', color: '#f4f6f4', fontFamily: 'Inter', fontSize: '13px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }} labelStyle={{ color: '#9aa09a' }} />
                  <Bar dataKey="hours" radius={[6, 6, 0, 0]}>
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
              <th className="text-left px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Date</th>
              <th className="text-left px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Category</th>
              <th className="text-right px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Hours</th>
              <th className="text-left px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Notes</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                <td className="px-4 py-3 text-[13px]">{l.date}</td>
                <td className="px-4 py-3">
                  <span className="text-[12px] px-2 py-0.5 rounded-lg capitalize" style={{ backgroundColor: (CAT_COLORS[l.category] || 'rgba(74,222,128,0.1)') + '30', color: l.category === 'deep_work' ? 'var(--crm-accent)' : 'var(--crm-text-secondary)' }}>
                    {(l.category || '').replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-[13px]">{l.hours}h</td>
                <td className="px-4 py-3 text-[12px] truncate max-w-[300px]" style={{ color: 'var(--crm-text-muted)' }}>{l.notes}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(l.id)} className="text-[12px]" style={{ color: 'var(--crm-negative)' }}>x</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <EmptyState message="No time logged yet." />}
      </div>
    </div>
  );
}
