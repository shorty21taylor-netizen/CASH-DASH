'use client';

import { useState, useEffect } from 'react';
import { TIME_CATEGORIES } from '../../lib/constants.js';
import EmptyState from '../../components/EmptyState.js';
import ClientOnly from '../../components/ClientOnly.js';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CAT_COLORS = { deep_work: '#dc2626', meetings: '#f97316', admin: '#eab308', learning: '#22c55e', health: '#8b5cf6', personal: '#3b82f6', other: '#737373' };

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
  const chartData = TIME_CATEGORIES.map((c) => ({ category: c.replace('_', ' '), hours: byCat[c] || 0, fill: CAT_COLORS[c] }));
  const totalHours = Object.values(byCat).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Time Log</h1>
          <p className="text-neutral-500 text-sm">{totalHours.toFixed(1)} hours logged</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">+ Log Time</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-6 flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm">
              {TIME_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Hours</label>
            <input type="number" step="0.25" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} required className="w-20 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-neutral-500 mb-1">Notes</label>
            <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Add</button>
          <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm">Cancel</button>
        </form>
      )}

      {totalHours > 0 && (
        <ClientOnly>
          <div className="glass-card-solid p-6">
            <h3 className="text-white font-semibold mb-4">Hours by Category</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                  <XAxis dataKey="category" stroke="#737373" fontSize={11} />
                  <YAxis stroke="#737373" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px', color: '#fafafa' }} />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <rect key={i} fill={entry.fill} />
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
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Category</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Hours</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Notes</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                <td className="px-4 py-3 text-sm">{l.date}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full capitalize" style={{ backgroundColor: (CAT_COLORS[l.category] || '#737373') + '18', color: CAT_COLORS[l.category] || '#737373' }}>
                    {(l.category || '').replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono">{l.hours}h</td>
                <td className="px-4 py-3 text-sm text-neutral-400 truncate max-w-[300px]">{l.notes}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(l.id)} className="text-xs text-red-400 hover:text-red-300">×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <EmptyState icon="⏱️" message="No time logged yet." />}
      </div>
    </div>
  );
}
