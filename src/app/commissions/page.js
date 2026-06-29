'use client';

import { useState, useEffect } from 'react';
import { STREAMS, STATUSES, DEFAULT_RATES } from '../../lib/constants.js';
import EmptyState from '../../components/EmptyState.js';

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterStream, setFilterStream] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState(getBlank());

  function getBlank() {
    return { stream: 'htA', client_name: '', amount: '', rate: DEFAULT_RATES.htA, status: 'pending', date: new Date().toISOString().split('T')[0] };
  }

  useEffect(() => { load(); }, [filterStream, filterStatus]);

  function load() {
    const params = new URLSearchParams();
    if (filterStream) params.set('stream', filterStream);
    if (filterStatus) params.set('status', filterStatus);
    fetch(`/api/commissions?${params}`).then((r) => r.json()).then((d) => setCommissions(d.commissions || []));
  }

  function openEdit(c) {
    setForm({ ...c });
    setEditing(c.id);
    setShowForm(true);
  }

  function openNew() {
    setForm(getBlank());
    setEditing(null);
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch('/api/commissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { ...form, id: editing } : form),
    });
    setShowForm(false);
    load();
  }

  async function handleDelete(id) {
    await fetch('/api/commissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _action: 'delete', id }),
    });
    load();
  }

  function handleChange(e) {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    if (name === 'stream' && !editing) updated.rate = DEFAULT_RATES[value] || 0.10;
    setForm(updated);
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Commissions</h1>
        <button onClick={openNew} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
          + New Commission
        </button>
      </div>

      <div className="flex gap-3">
        <select value={filterStream} onChange={(e) => setFilterStream(e.target.value)} className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm">
          <option value="">All Streams</option>
          {Object.values(STREAMS).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white text-sm">
          <option value="">All Statuses</option>
          {Object.values(STATUSES).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-6 space-y-4">
          <h2 className="font-semibold text-lg">{editing ? 'Edit' : 'New'} Commission</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Stream</label>
              <select name="stream" value={form.stream} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm">
                {Object.values(STREAMS).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm">
                {Object.values(STATUSES).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Client Name</label>
            <input name="client_name" value={form.client_name} onChange={handleChange} required className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Amount ($)</label>
              <input name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} required className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Rate</label>
              <input name="rate" type="number" step="0.01" value={form.rate} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
              {editing ? 'Update' : 'Add'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="glass-card-solid overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--crm-border)' }}>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Client</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Stream</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Amount</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Commission</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Date</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => (
              <tr key={c.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'var(--crm-border)' }}>
                <td className="px-4 py-3 text-sm font-medium">{c.client_name}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: STREAMS[c.stream]?.color + '18', color: STREAMS[c.stream]?.color }}>
                    {STREAMS[c.stream]?.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right font-mono">${(c.amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-green-400">${((c.amount || 0) * (c.rate || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: STATUSES[c.status]?.color + '18', color: STATUSES[c.status]?.color }}>
                    {STATUSES[c.status]?.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-400">{c.date}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(c)} className="text-xs text-neutral-400 hover:text-white mr-3">Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {commissions.length === 0 && <EmptyState icon="💰" message="No commissions yet. Add your first one!" />}
      </div>
    </div>
  );
}
