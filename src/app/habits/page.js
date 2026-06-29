'use client';

import { useState, useEffect } from 'react';
import EmptyState from '../../components/EmptyState.js';

export default function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', cadence: 'daily' });

  useEffect(() => { load(); }, []);
  function load() { fetch('/api/habits').then((r) => r.json()).then((d) => setHabits(d.habits || [])); }

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch('/api/habits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ name: '', cadence: 'daily' });
    load();
  }

  async function toggleDay(habit, dateStr) {
    const history = { ...(habit.history || {}) };
    history[dateStr] = !history[dateStr];
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if (history[key]) streak++;
      else break;
    }
    await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...habit, history, streak }),
    });
    load();
  }

  async function handleDelete(id) {
    await fetch('/api/habits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'delete', id }) });
    load();
  }

  const last14 = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last14.push(d.toISOString().split('T')[0]);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Habits</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl text-[13px] font-medium" style={{ background: 'var(--crm-accent)', color: '#0a0c0a' }}>+ New habit</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-5 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Habit name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-field" />
          </div>
          <div>
            <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Cadence</label>
            <select value={form.cadence} onChange={(e) => setForm({ ...form, cadence: e.target.value })} className="input-field">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <button type="submit" className="px-4 py-2 rounded-xl text-[13px] font-medium" style={{ background: 'var(--crm-accent)', color: '#0a0c0a' }}>Add</button>
          <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-[13px]" style={{ background: 'var(--crm-surface2)', color: 'var(--crm-text-secondary)' }}>Cancel</button>
        </form>
      )}

      <div className="space-y-3">
        {habits.map((h) => (
          <div key={h.id} className="glass-card-solid p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="text-[14px] font-semibold">{h.name}</h3>
                <span className="text-[12px] px-2 py-0.5 rounded-lg capitalize" style={{ background: 'var(--crm-surface2)', color: 'var(--crm-text-muted)' }}>{h.cadence}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-[14px] font-semibold" style={{ color: 'var(--crm-accent)' }}>{h.streak || 0}</span>
                  <span className="text-[12px]" style={{ color: 'var(--crm-text-muted)' }}>streak</span>
                </div>
                <button onClick={() => handleDelete(h.id)} className="text-[12px]" style={{ color: 'var(--crm-negative)' }}>x</button>
              </div>
            </div>
            <div className="flex gap-1">
              {last14.map((dateStr) => {
                const done = h.history?.[dateStr];
                return (
                  <button key={dateStr} onClick={() => toggleDay(h, dateStr)}
                    className="w-8 h-8 rounded-lg text-xs transition-all"
                    style={{
                      background: done ? 'rgba(74,222,128,0.15)' : 'var(--crm-surface2)',
                      color: done ? 'var(--crm-accent)' : 'var(--crm-text-muted)',
                      border: done ? '1px solid rgba(74,222,128,0.3)' : '1px solid var(--crm-border)',
                    }}
                    title={dateStr}>
                    {done ? '✓' : parseInt(dateStr.split('-')[2])}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {habits.length === 0 && <EmptyState message="No habits yet. Build one!" />}
      </div>
    </div>
  );
}
