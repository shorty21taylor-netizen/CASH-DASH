'use client';

import { useState, useEffect } from 'react';
import EmptyState from '../../components/EmptyState.js';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', target: '', current: '', unit: '$', deadline: '', category: 'business' });

  useEffect(() => { load(); }, []);
  function load() { fetch('/api/goals').then((r) => r.json()).then((d) => setGoals(d.goals || [])); }

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch('/api/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ title: '', target: '', current: '', unit: '$', deadline: '', category: 'business' });
    load();
  }

  async function updateProgress(goal, newCurrent) {
    await fetch('/api/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...goal, current: newCurrent }) });
    load();
  }

  async function handleDelete(id) {
    await fetch('/api/goals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'delete', id }) });
    load();
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Goals</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">+ New Goal</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm">
                <option value="business">Business</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="financial">Financial</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Target</label>
              <input type="number" step="0.01" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} required className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Current</label>
              <input type="number" step="0.01" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Unit</label>
              <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Add Goal</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {goals.map((g) => {
          const pct = g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0;
          return (
            <div key={g.id} className="glass-card-solid p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold">{g.title}</h3>
                  <p className="text-xs text-neutral-500 capitalize">{g.category} {g.deadline && `· Due ${g.deadline}`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono">{g.unit === '$' ? '$' : ''}{g.current}{g.unit !== '$' ? ` ${g.unit}` : ''} / {g.unit === '$' ? '$' : ''}{g.target}{g.unit !== '$' ? ` ${g.unit}` : ''}</span>
                  <button onClick={() => handleDelete(g.id)} className="text-xs text-red-400 hover:text-red-300 ml-2">×</button>
                </div>
              </div>
              <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all bg-gradient-to-r from-red-600 to-orange-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-neutral-500">{pct.toFixed(0)}%</span>
                <input type="number" step="1" placeholder="Update" className="w-24 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-xs text-white"
                  onKeyDown={(e) => { if (e.key === 'Enter') { updateProgress(g, parseFloat(e.target.value)); e.target.value = ''; } }} />
              </div>
            </div>
          );
        })}
        {goals.length === 0 && <EmptyState icon="🎯" message="No goals yet. Set one!" />}
      </div>
    </div>
  );
}
