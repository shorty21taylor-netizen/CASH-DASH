'use client';

import { useState, useEffect } from 'react';
import TrendChart from '../../components/TrendChart.js';
import { localToday } from '../../lib/constants.js';
import EmptyState from '../../components/EmptyState.js';

export default function HealthPage() {
  const [logs, setLogs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ date: localToday(), weight: '', sleep_hours: '', workout: false, calories: '', notes: '' });

  useEffect(() => { load(); }, []);
  function load() { fetch('/api/health').then((r) => r.json()).then((d) => setLogs(d.logs || [])); }

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch('/api/health', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ date: localToday(), weight: '', sleep_hours: '', workout: false, calories: '', notes: '' });
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Health Log</h1>
        <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-xl text-[14px] font-semibold" style={{ background: 'var(--crm-accent)', color: '#fff' }}>+ Log entry</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-6 space-y-5">
          <h2 className="text-[15px] font-bold">New Entry</h2>
          <div className="grid grid-cols-5 gap-5">
            <div>
              <label className="block text-[14px] mb-1.5" style={{ color: 'var(--crm-text-secondary)' }}>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-[14px] mb-1.5" style={{ color: 'var(--crm-text-secondary)' }}>Weight (lbs)</label>
              <input type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-[14px] mb-1.5" style={{ color: 'var(--crm-text-secondary)' }}>Sleep (hrs)</label>
              <input type="number" step="0.5" value={form.sleep_hours} onChange={(e) => setForm({ ...form, sleep_hours: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-[14px] mb-1.5" style={{ color: 'var(--crm-text-secondary)' }}>Calories</label>
              <input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-[14px] mb-1.5" style={{ color: 'var(--crm-text-secondary)' }}>Workout</label>
              <button type="button" onClick={() => setForm({ ...form, workout: !form.workout })}
                className="w-full px-4 py-2.5 rounded-xl text-[14px]"
                style={{
                  background: form.workout ? 'var(--crm-accent)' : 'var(--crm-surface2)',
                  color: form.workout ? '#fff' : 'var(--crm-text-muted)',
                  border: form.workout ? 'none' : '1px solid var(--crm-border)',
                  fontWeight: form.workout ? 600 : 400,
                }}>
                {form.workout ? '✓ Yes' : 'No'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[14px] mb-1.5" style={{ color: 'var(--crm-text-secondary)' }}>Notes</label>
            <input placeholder="Optional" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-5 py-2.5 rounded-xl text-[14px] font-semibold" style={{ background: 'var(--crm-accent)', color: '#fff' }}>Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-[14px]" style={{ background: 'var(--crm-surface2)', color: 'var(--crm-text-secondary)' }}>Cancel</button>
          </div>
        </form>
      )}

      {chartData.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TrendChart data={chartData} lines={[{ key: 'weight', name: 'Weight', color: '#1E90FF' }]} title="Weight trend" />
          <TrendChart data={chartData} lines={[{ key: 'sleep', name: 'Sleep (hrs)', color: '#4a4a50' }]} title="Sleep trend" />
        </div>
      )}

      <div className="glass-card-solid overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--crm-border)' }}>
              <th className="text-left px-5 py-4 text-[14px] font-medium" style={{ color: 'var(--crm-text-secondary)' }}>Date</th>
              <th className="text-right px-5 py-4 text-[14px] font-medium" style={{ color: 'var(--crm-text-secondary)' }}>Weight</th>
              <th className="text-right px-5 py-4 text-[14px] font-medium" style={{ color: 'var(--crm-text-secondary)' }}>Sleep</th>
              <th className="text-center px-5 py-4 text-[14px] font-medium" style={{ color: 'var(--crm-text-secondary)' }}>Workout</th>
              <th className="text-right px-5 py-4 text-[14px] font-medium" style={{ color: 'var(--crm-text-secondary)' }}>Calories</th>
              <th className="text-left px-5 py-4 text-[14px] font-medium" style={{ color: 'var(--crm-text-secondary)' }}>Notes</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                <td className="px-5 py-4 text-[14px]">{l.date}</td>
                <td className="px-5 py-4 text-right text-[14px]">{l.weight || '—'}</td>
                <td className="px-5 py-4 text-right text-[14px]">{l.sleep_hours || '—'}h</td>
                <td className="px-5 py-4 text-center text-[14px]" style={{ color: l.workout ? 'var(--crm-accent)' : 'var(--crm-text-muted)' }}>{l.workout ? '✓' : '—'}</td>
                <td className="px-5 py-4 text-right text-[14px]">{l.calories || '—'}</td>
                <td className="px-5 py-4 text-[13px] truncate max-w-[200px]" style={{ color: 'var(--crm-text-muted)' }}>{l.notes || ''}</td>
                <td className="px-5 py-4 text-right"><button onClick={() => handleDelete(l.id)} className="text-[13px]" style={{ color: 'var(--crm-negative)' }}>x</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <EmptyState message="No health logs yet. Start tracking!" />}
      </div>
    </div>
  );
}
