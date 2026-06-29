'use client';

import { useState, useEffect } from 'react';

export default function GoalsPage() {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => { load(); }, []);

  function load() {
    fetch('/api/life-os?type=goal')
      .then((r) => r.json())
      .then((d) => setGoals(d.items || []));
  }

  async function handleAdd(e) {
    e.preventDefault();
    await fetch('/api/life-os', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'goal', title, content, completed: false }),
    });
    setTitle('');
    setContent('');
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Goals</h1>

      <form onSubmit={handleAdd} className="bg-dark-800 border border-dark-700 rounded-xl p-4 space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal title..." required className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Details (optional)..." rows={2} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
        <button type="submit" className="px-4 py-2 bg-summit-600 hover:bg-summit-700 text-white rounded-lg text-sm font-medium">Add Goal</button>
      </form>

      <div className="space-y-2">
        {goals.map((g) => (
          <div key={g.id} className="bg-dark-800 border border-dark-700 rounded-xl p-4 flex items-start gap-3">
            <button onClick={() => toggleComplete(g)} className={`mt-1 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${g.completed ? 'bg-green-500 border-green-500' : 'border-dark-500'}`}>
              {g.completed && <span className="text-white text-xs">✓</span>}
            </button>
            <div className="flex-1">
              <p className={`text-white font-medium ${g.completed ? 'line-through opacity-50' : ''}`}>{g.title}</p>
              {g.content && <p className="text-dark-400 text-sm mt-1">{g.content}</p>}
            </div>
            <button onClick={() => handleDelete(g.id)} className="text-red-400 hover:text-red-300 text-sm">×</button>
          </div>
        ))}
        {goals.length === 0 && <p className="text-dark-400 text-center py-8">No goals yet. Set your first one!</p>}
      </div>
    </div>
  );
}
