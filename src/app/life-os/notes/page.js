'use client';

import { useState, useEffect } from 'react';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => { load(); }, []);

  function load() {
    fetch('/api/life-os?type=note')
      .then((r) => r.json())
      .then((d) => setNotes(d.items || []));
  }

  async function handleAdd(e) {
    e.preventDefault();
    await fetch('/api/life-os', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'note', title, content }),
    });
    setTitle('');
    setContent('');
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
      <h1 className="text-2xl font-bold text-white">Notes</h1>

      <form onSubmit={handleAdd} className="bg-dark-800 border border-dark-700 rounded-xl p-4 space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title..." required className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your thoughts..." rows={4} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
        <button type="submit" className="px-4 py-2 bg-summit-600 hover:bg-summit-700 text-white rounded-lg text-sm font-medium">Save Note</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map((n) => (
          <div key={n.id} className="bg-dark-800 border border-dark-700 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <h3 className="text-white font-medium">{n.title}</h3>
              <button onClick={() => handleDelete(n.id)} className="text-red-400 hover:text-red-300 text-sm">×</button>
            </div>
            {n.content && <p className="text-dark-400 text-sm mt-2 whitespace-pre-wrap">{n.content}</p>}
          </div>
        ))}
        {notes.length === 0 && <p className="text-dark-400 text-center py-8 col-span-2">No notes yet. Write something!</p>}
      </div>
    </div>
  );
}
