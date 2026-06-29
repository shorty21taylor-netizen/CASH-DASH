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
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-[14px] uppercase tracking-[0.12em] font-semibold">HEALTH LOG</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded font-mono text-[11px] uppercase tracking-[0.1em]" style={{ background: '#1E90FF', color: '#fff' }}>+ LOG ENTRY</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-5 space-y-4">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.1em] font-semibold">NEW ENTRY</h2>
          <div className="grid grid-cols-5 gap-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--crm-text-muted)' }}>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--crm-text-muted)' }}>Weight (lbs)</label>
              <input type="number" step="0.1" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--crm-text-muted)' }}>Sleep (hrs)</label>
              <input type="number" step="0.5" value={form.sleep_hours} onChange={(e) => setForm({ ...form, sleep_hours: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--crm-text-muted)' }}>Calories</label>
              <input type="number" value={form.calories} onChange={(e) => setForm({ ...form, calories: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--crm-text-muted)' }}>Workout</label>
              <button type="button" onClick={() => setForm({ ...form, workout: !form.workout })}
                className="w-full px-3 py-2 rounded font-mono text-[11px] uppercase"
                style={{
                  background: form.workout ? '#1E90FF' : 'var(--crm-surface2)',
                  color: form.workout ? '#fff' : 'var(--crm-text-muted)',
                  border: form.workout ? 'none' : '1px solid var(--crm-border)',
                }}>
                {form.workout ? '✓ Yes' : 'No'}
              </button>
            </div>
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--crm-text-muted)' }}>Notes</label>
            <input placeholder="Optional" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded font-mono text-[11px] uppercase" style={{ background: '#1E90FF', color: '#fff' }}>Save</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded font-mono text-[11px] uppercase" style={{ background: 'var(--crm-surface2)', color: 'var(--crm-text-secondary)' }}>Cancel</button>
          </div>
        </form>
      )}

      {chartData.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <TrendChart data={chartData} lines={[{ key: 'weight', name: 'Weight', color: '#1E90FF' }]} title="WEIGHT TREND" />
          <TrendChart data={chartData} lines={[{ key: 'sleep', name: 'Sleep (hrs)', color: '#4a4a50' }]} title="SLEEP TREND" />
        </div>
      )}

      <div className="glass-card-solid overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--crm-border)' }}>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>Date</th>
              <th className="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>Weight</th>
              <th className="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>Sleep</th>
              <th className="text-center px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>Workout</th>
              <th className="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>Calories</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>Notes</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                <td className="px-4 py-3 font-mono text-[12px]">{l.date}</td>
                <td className="px-4 py-3 text-right font-mono text-[12px]">{l.weight || '—'}</td>
                <td className="px-4 py-3 text-right font-mono text-[12px]">{l.sleep_hours || '—'}h</td>
                <td className="px-4 py-3 text-center font-mono text-[11px]" style={{ color: l.workout ? '#1E90FF' : 'var(--crm-text-muted)' }}>{l.workout ? '✓' : '—'}</td>
                <td className="px-4 py-3 text-right font-mono text-[12px]">{l.calories || '—'}</td>
                <td className="px-4 py-3 font-mono text-[11px] truncate max-w-[200px]" style={{ color: 'var(--crm-text-muted)' }}>{l.notes || ''}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(l.id)} className="font-mono text-[10px] uppercase" style={{ color: 'var(--crm-negative)' }}>x</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <EmptyState icon="—" message="No health logs yet. Start tracking!" />}
      </div>
    </div>
  );
}
