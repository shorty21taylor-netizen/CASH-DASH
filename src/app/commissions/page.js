'use client';

import { useState, useEffect } from 'react';
import CommissionForm from '../../components/CommissionForm.js';
import { STREAMS, STATUSES } from '../../lib/constants.js';

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterStream, setFilterStream] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadCommissions();
  }, [filterStream, filterStatus]);

  function loadCommissions() {
    const params = new URLSearchParams();
    if (filterStream) params.set('stream', filterStream);
    if (filterStatus) params.set('status', filterStatus);
    fetch(`/api/commissions?${params}`)
      .then((r) => r.json())
      .then((d) => setCommissions(d.commissions || []));
  }

  async function handleSubmit(data) {
    await fetch('/api/commissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setShowForm(false);
    setEditing(null);
    loadCommissions();
  }

  async function handleDelete(id) {
    await fetch('/api/commissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _action: 'delete', id }),
    });
    loadCommissions();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">All Commissions</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-summit-600 hover:bg-summit-700 text-white rounded-lg font-medium transition-colors">
          + New Commission
        </button>
      </div>

      <div className="flex gap-3">
        <select value={filterStream} onChange={(e) => setFilterStream(e.target.value)} className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm">
          <option value="">All Streams</option>
          {Object.values(STREAMS).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-dark-800 border border-dark-600 rounded-lg px-3 py-2 text-white text-sm">
          <option value="">All Statuses</option>
          {Object.values(STATUSES).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {(showForm || editing) && (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{editing ? 'Edit' : 'New'} Commission</h2>
          <CommissionForm
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-900">
            <tr>
              <th className="text-left px-4 py-3 text-dark-300 text-sm font-medium">Client</th>
              <th className="text-left px-4 py-3 text-dark-300 text-sm font-medium">Stream</th>
              <th className="text-left px-4 py-3 text-dark-300 text-sm font-medium">Amount</th>
              <th className="text-left px-4 py-3 text-dark-300 text-sm font-medium">Commission</th>
              <th className="text-left px-4 py-3 text-dark-300 text-sm font-medium">Status</th>
              <th className="text-left px-4 py-3 text-dark-300 text-sm font-medium">Date</th>
              <th className="text-left px-4 py-3 text-dark-300 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => (
              <tr key={c.id} className="border-t border-dark-700 hover:bg-dark-750">
                <td className="px-4 py-3 text-white">{c.client_name}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: STREAMS[c.stream]?.color + '22', color: STREAMS[c.stream]?.color }}>
                    {STREAMS[c.stream]?.label || c.stream}
                  </span>
                </td>
                <td className="px-4 py-3 text-white">${(c.amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-summit-400">${((c.amount || 0) * (c.rate || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: STATUSES[c.status]?.color + '22', color: STATUSES[c.status]?.color }}>
                    {STATUSES[c.status]?.label || c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-dark-300">{c.date}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setEditing(c)} className="text-summit-400 hover:text-summit-300 text-sm mr-2">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                </td>
              </tr>
            ))}
            {commissions.length === 0 && (
              <tr><td colSpan="7" className="px-4 py-8 text-center text-dark-400">No commissions yet. Add your first one!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
