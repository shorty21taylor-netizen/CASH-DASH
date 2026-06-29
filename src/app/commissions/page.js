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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Commissions</h1>
        <button onClick={openNew} className="px-4 py-2 rounded-xl text-[13px] font-medium transition-colors" style={{ background: 'var(--crm-accent)', color: '#0a0c0a' }}>
          + New
        </button>
      </div>

      <div className="flex gap-3">
        <select value={filterStream} onChange={(e) => setFilterStream(e.target.value)} className="input-field" style={{ width: 'auto' }}>
          <option value="">All streams</option>
          {Object.values(STREAMS).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field" style={{ width: 'auto' }}>
          <option value="">All statuses</option>
          {Object.values(STATUSES).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-5 space-y-4">
          <h2 className="text-sm font-semibold">{editing ? 'Edit' : 'New'} Commission</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Stream</label>
              <select name="stream" value={form.stream} onChange={handleChange} className="input-field">
                {Object.values(STREAMS).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field">
                {Object.values(STATUSES).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Client name</label>
            <input name="client_name" value={form.client_name} onChange={handleChange} required className="input-field" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Amount ($)</label>
              <input name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Rate</label>
              <input name="rate" type="number" step="0.01" value={form.rate} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Date</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-xl text-[13px] font-medium" style={{ background: 'var(--crm-accent)', color: '#0a0c0a' }}>
              {editing ? 'Update' : 'Add'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-[13px]" style={{ background: 'var(--crm-surface2)', color: 'var(--crm-text-secondary)' }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="glass-card-solid overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--crm-border)' }}>
              <th className="text-left px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Client</th>
              <th className="text-left px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Stream</th>
              <th className="text-right px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Amount</th>
              <th className="text-right px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Commission</th>
              <th className="text-left px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Status</th>
              <th className="text-left px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Date</th>
              <th className="text-right px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => (
              <tr key={c.id} className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                <td className="px-4 py-3 text-sm font-medium">{c.client_name}</td>
                <td className="px-4 py-3">
                  <span className="text-[13px]" style={{ color: 'var(--crm-accent)' }}>{STREAMS[c.stream]?.label}</span>
                </td>
                <td className="px-4 py-3 text-right text-[13px]">${(c.amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-[13px]" style={{ color: 'var(--crm-accent)' }}>${((c.amount || 0) * (c.rate || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3">
                  <span className="text-[12px] px-2 py-0.5 rounded-lg" style={{
                    background: c.status === 'paid' ? 'rgba(74,222,128,0.1)' : c.status === 'approved' ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.05)',
                    color: c.status === 'paid' ? 'var(--crm-accent)' : c.status === 'approved' ? 'var(--crm-accent)' : 'var(--crm-text-secondary)',
                  }}>
                    {STATUSES[c.status]?.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--crm-text-muted)' }}>{c.date}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(c)} className="text-[12px] mr-3 transition-colors" style={{ color: 'var(--crm-text-muted)' }}>Edit</button>
                  <button onClick={() => handleDelete(c.id)} className="text-[12px] transition-colors" style={{ color: 'var(--crm-negative)' }}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {commissions.length === 0 && <EmptyState message="No commissions yet" />}
      </div>
    </div>
  );
}
