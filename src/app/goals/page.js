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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Goals</h1>
        <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-xl text-[14px] font-semibold" style={{ background: 'var(--crm-accent)', color: '#fff' }}>+ New goal</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-6 space-y-5">
          <h2 className="text-[15px] font-bold">New Goal</h2>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-[14px] mb-1.5" style={{ color: 'var(--crm-text-secondary)' }}>Title</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required className="input-field" />
            </div>
            <div>
              <label className="block text-[14px] mb-1.5" style={{ color: 'var(--crm-text-secondary)' }}>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                <option value="business">Business</option>
                <option value="personal">Personal</option>
                <option value="health">Health</option>
                <option value="financial">Financial</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-5">
            <div>
              <label className="block text-[14px] mb-1.5" style={{ color: 'var(--crm-text-secondary)' }}>Target</label>
              <input type="number" step="0.01" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} required className="input-field" />
            </div>
            <div>
              <label className="block text-[14px] mb-1.5" style={{ color: 'var(--crm-text-secondary)' }}>Current</label>
              <input type="number" step="0.01" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-[14px] mb-1.5" style={{ color: 'var(--crm-text-secondary)' }}>Unit</label>
              <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-[14px] mb-1.5" style={{ color: 'var(--crm-text-secondary)' }}>Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-5 py-2.5 rounded-xl text-[14px] font-semibold" style={{ background: 'var(--crm-accent)', color: '#fff' }}>Add Goal</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-[14px]" style={{ background: 'var(--crm-surface2)', color: 'var(--crm-text-secondary)' }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {goals.map((g) => {
          const pct = g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0;
          return (
            <div key={g.id} className="glass-card-solid p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[16px] font-bold">{g.title}</h3>
                  <p className="text-[14px] capitalize" style={{ color: 'var(--crm-text-muted)' }}>{g.category} {g.deadline && `· Due ${g.deadline}`}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-semibold">{g.unit === '$' ? '$' : ''}{g.current}{g.unit !== '$' ? ` ${g.unit}` : ''} / {g.unit === '$' ? '$' : ''}{g.target}{g.unit !== '$' ? ` ${g.unit}` : ''}</span>
                  <button onClick={() => handleDelete(g.id)} className="text-[13px] ml-2" style={{ color: 'var(--crm-negative)' }}>x</button>
                </div>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--crm-surface2)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--crm-accent)' }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[13px] font-medium" style={{ color: 'var(--crm-text-muted)' }}>{pct.toFixed(0)}%</span>
                <input type="number" step="1" placeholder="Update" className="input-field w-28 text-[13px]"
                  onKeyDown={(e) => { if (e.key === 'Enter') { updateProgress(g, parseFloat(e.target.value)); e.target.value = ''; } }} />
              </div>
            </div>
          );
        })}
        {goals.length === 0 && <EmptyState message="No goals yet. Set one!" />}
      </div>
    </div>
  );
}
