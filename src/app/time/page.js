'use client';

import { useState, useEffect } from 'react';
import { TIME_CATEGORIES, localToday } from '../../lib/constants.js';
import EmptyState from '../../components/EmptyState.js';
import ClientOnly from '../../components/ClientOnly.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

const CAT_COLORS = { deep_work: '#1E90FF', meetings: 'rgba(30,144,255,0.65)', admin: 'rgba(30,144,255,0.45)', learning: 'rgba(30,144,255,0.35)', health: 'rgba(30,144,255,0.25)', personal: 'rgba(30,144,255,0.18)', other: 'rgba(30,144,255,0.12)' };

export default function TimePage() {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: localToday(), category: 'deep_work', hours: '', notes: '' });

  useEffect(() => { load(); }, []);
  function load() { fetch('/api/time').then((r) => r.json()).then((d) => setLogs(d.logs || [])); }

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch('/api/time', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ date: localToday(), category: 'deep_work', hours: '', notes: '' });
    load();
  }

  async function handleDelete(id) {
    await fetch('/api/time', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'delete', id }) });
    load();
  }

  const byCat = {};
  logs.forEach((l) => { byCat[l.category] = (byCat[l.category] || 0) + (l.hours || 0); });
  const chartData = TIME_CATEGORIES.map((c) => ({ category: c.replace('_', ' '), hours: byCat[c] || 0, fill: CAT_COLORS[c] || 'rgba(30,144,255,0.12)' }));
  const totalHours = Object.values(byCat).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Time Log</h1>
          <p className="text-[14px] mt-1" style={{ color: 'var(--crm-text-muted)' }}>{totalHours.toFixed(1)} hours logged</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-xl text-[14px] font-semibold" style={{ background: 'var(--crm-accent)', color: '#fff' }}>+ Log time</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-6 flex gap-5 items-end flex-wrap">
          <div>
            <label className="block text-[14px] mb-1.5" style={{ color: 'var(--crm-text-secondary)' }}>Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-[14px] mb-1.5" style={{ color: 'var(--crm-text-secondary)' }}>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
              {TIME_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[14px] mb-1.5" style={{ color: 'var(--crm-text-secondary)' }}>Hours</label>
            <input type="number" step="0.25" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} required className="input-field w-24" />
          </div>
          <div className="flex-1">
            <label className="block text-[14px] mb-1.5" style={{ color: 'var(--crm-text-secondary)' }}>Notes</label>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" />
          </div>
          <button type="submit" className="px-5 py-2.5 rounded-xl text-[14px] font-semibold" style={{ background: 'var(--crm-accent)', color: '#fff' }}>Add</button>
          <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-[14px]" style={{ background: 'var(--crm-surface2)', color: 'var(--crm-text-secondary)' }}>Cancel</button>
        </form>
      )}

      {totalHours > 0 && (
        <ClientOnly>
          <div className="glass-card-solid p-6">
            <h3 className="text-[15px] font-semibold mb-5" style={{ color: 'var(--crm-text-secondary)' }}>Hours by category</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="none" vertical={false} />
                  <XAxis dataKey="category" stroke="#6a7080" fontSize={13} fontFamily="Inter" tickLine={false} axisLine={false} />
                  <YAxis stroke="#6a7080" fontSize={13} fontFamily="Inter" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#12141a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', color: '#f4f6f8', fontFamily: 'Inter', fontSize: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }} labelStyle={{ color: '#9aa0aa' }} />
                  <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
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
              <th className="text-left px-5 py-4 text-[14px] font-medium" style={{ color: 'var(--crm-text-secondary)' }}>Date</th>
              <th className="text-left px-5 py-4 text-[14px] font-medium" style={{ color: 'var(--crm-text-secondary)' }}>Category</th>
              <th className="text-right px-5 py-4 text-[14px] font-medium" style={{ color: 'var(--crm-text-secondary)' }}>Hours</th>
              <th className="text-left px-5 py-4 text-[14px] font-medium" style={{ color: 'var(--crm-text-secondary)' }}>Notes</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                <td className="px-5 py-4 text-[14px]">{l.date}</td>
                <td className="px-5 py-4">
                  <span className="text-[13px] px-3 py-1 rounded-lg capitalize font-medium" style={{ backgroundColor: (CAT_COLORS[l.category] || 'rgba(30,144,255,0.12)') + '30', color: l.category === 'deep_work' ? 'var(--crm-accent)' : 'var(--crm-text-secondary)' }}>
                    {(l.category || '').replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-4 text-right text-[14px] font-medium">{l.hours}h</td>
                <td className="px-5 py-4 text-[13px] truncate max-w-[300px]" style={{ color: 'var(--crm-text-muted)' }}>{l.notes}</td>
                <td className="px-5 py-4 text-right"><button onClick={() => handleDelete(l.id)} className="text-[13px]" style={{ color: 'var(--crm-negative)' }}>x</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <EmptyState message="No time logged yet." />}
      </div>
    </div>
  );
}
