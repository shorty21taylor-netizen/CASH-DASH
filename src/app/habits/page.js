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
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Habits</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">+ New Habit</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-6 flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs text-neutral-500 mb-1">Habit Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Cadence</label>
            <select value={form.cadence} onChange={(e) => setForm({ ...form, cadence: e.target.value })} className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Add</button>
          <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm">Cancel</button>
        </form>
      )}

      <div className="space-y-3">
        {habits.map((h) => (
          <div key={h.id} className="glass-card-solid p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">{h.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 capitalize">{h.cadence}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-orange-400 text-sm">🔥</span>
                  <span className="text-sm font-bold text-orange-400">{h.streak || 0}</span>
                  <span className="text-xs text-neutral-500">streak</span>
                </div>
                <button onClick={() => handleDelete(h.id)} className="text-xs text-red-400 hover:text-red-300">×</button>
              </div>
            </div>
            <div className="flex gap-1">
              {last14.map((dateStr) => {
                const done = h.history?.[dateStr];
                return (
                  <button key={dateStr} onClick={() => toggleDay(h, dateStr)}
                    className={`w-8 h-8 rounded-md text-xs font-medium transition-all ${
                      done ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-neutral-800 text-neutral-600 hover:bg-neutral-700 border border-neutral-700'
                    }`}
                    title={dateStr}>
                    {done ? '✓' : parseInt(dateStr.split('-')[2])}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {habits.length === 0 && <EmptyState icon="🔥" message="No habits yet. Build one!" />}
      </div>
    </div>
  );
}
