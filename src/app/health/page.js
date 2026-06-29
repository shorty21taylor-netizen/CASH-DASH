'use client';

import { useState, useEffect } from 'react';
import TrendChart from '../../components/TrendChart.js';
import EmptyState from '../../components/EmptyState.js';

export default function HealthPage() {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], weight: '', sleep_hours: '', workout: false, calories: '', notes: '' });

  useEffect(() => { load(); }, []);
  function load() { fetch('/api/health').then((r) => r.json()).then((d) => setLogs(d.logs || [])); }

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch('/api/health', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ date: new Date().toISOString().split('T')[0], weight: '', sleep_hours: '', workout: false, calories: '', notes: '' });
    load();
  }

  async function handleDelete(id) {
    await fetch('/api/health', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'delete', id }) });
    load();
  }

  const sorted = [...logs].sort((a, b) => (a.date || '').localeCompare(b.date || '')).slice(-30);
  const chartData = sorted.map((l) => ({
    label: l.date?.substring(5) || '',
    weight: l.weight,
    sleep: l.sleep_hours,
    calories: l.calories,
  }));

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Health Log</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">+ Log Entry</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-6 space-y-4">
          <div className="grid grid-cols-5 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Weight (lbs)</label>
              <input type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Sleep (hrs)</label>
              <input type="number" step="0.5" value={form.sleep_hours} onChange={(e) => setForm({ ...form, sleep_hours: e.target.value })} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Calories</label>
              <input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Workout</label>
              <button type="button" onClick={() => setForm({ ...form, workout: !form.workout })}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${form.workout ? 'bg-green-600 text-white' : 'bg-neutral-900 border border-neutral-700 text-neutral-400'}`}>
                {form.workout ? '✓ Yes' : 'No'}
              </button>
            </div>
          </div>
          <input placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      {chartData.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TrendChart data={chartData} lines={[{ key: 'weight', name: 'Weight', color: '#dc2626' }]} title="Weight Trend" />
          <TrendChart data={chartData} lines={[{ key: 'sleep', name: 'Sleep (hrs)', color: '#8b5cf6' }]} title="Sleep Trend" />
        </div>
      )}

      <div className="glass-card-solid overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--crm-border)' }}>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Date</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Weight</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Sleep</th>
              <th className="text-center px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Workout</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Calories</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Notes</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                <td className="px-4 py-3 text-sm">{l.date}</td>
                <td className="px-4 py-3 text-sm text-right font-mono">{l.weight || '—'}</td>
                <td className="px-4 py-3 text-sm text-right font-mono">{l.sleep_hours || '—'}h</td>
                <td className="px-4 py-3 text-sm text-center">{l.workout ? '✅' : '—'}</td>
                <td className="px-4 py-3 text-sm text-right font-mono">{l.calories || '—'}</td>
                <td className="px-4 py-3 text-sm text-neutral-400 truncate max-w-[200px]">{l.notes || ''}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(l.id)} className="text-xs text-red-400 hover:text-red-300">×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <EmptyState icon="💪" message="No health logs yet. Start tracking!" />}
      </div>
    </div>
  );
}
