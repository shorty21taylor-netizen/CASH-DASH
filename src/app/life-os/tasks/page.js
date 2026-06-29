'use client';

import { useState, useEffect } from 'react';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');

  useEffect(() => { load(); }, []);

  function load() {
    fetch('/api/life-os?type=task')
      .then((r) => r.json())
      .then((d) => setTasks(d.items || []));
  }

  async function handleAdd(e) {
    e.preventDefault();
    await fetch('/api/life-os', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'task', title, priority, completed: false }),
    });
    setTitle('');
    load();
  }

  async function toggleComplete(item) {
    await fetch('/api/life-os', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, completed: !item.completed }),
    });
    load();
  }

  async function handleDelete(id) {
    await fetch('/api/life-os', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _action: 'delete', id }),
    });
    load();
  }

  const priorityColors = { high: 'text-red-400', medium: 'text-yellow-400', low: 'text-green-400' };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Tasks</h1>

      <form onSubmit={handleAdd} className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex gap-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New task..." required className="flex-1 bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className="bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white">
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button type="submit" className="px-4 py-2 bg-summit-600 hover:bg-summit-700 text-white rounded-lg text-sm font-medium">Add</button>
      </form>

      <div className="space-y-2">
        {tasks.map((t) => (
          <div key={t.id} className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex items-center gap-3">
            <button onClick={() => toggleComplete(t)} className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${t.completed ? 'bg-green-500 border-green-500' : 'border-dark-500'}`}>
              {t.completed && <span className="text-white text-xs">✓</span>}
            </button>
            <p className={`flex-1 text-white ${t.completed ? 'line-through opacity-50' : ''}`}>{t.title}</p>
            <span className={`text-xs font-medium ${priorityColors[t.priority] || 'text-dark-400'}`}>{t.priority}</span>
            <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-300 text-sm">×</button>
          </div>
        ))}
        {tasks.length === 0 && <p className="text-dark-400 text-center py-8">No tasks yet. Add one above!</p>}
      </div>
    </div>
  );
}
