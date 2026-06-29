'use client';

import { useState, useEffect } from 'react';
import MetricCard from '../../components/MetricCard.js';
import EmptyState from '../../components/EmptyState.js';
import { ACCOUNT_TYPES } from '../../lib/constants.js';

export default function NetWorthPage() {
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'cash', balance: '' });

  useEffect(() => { load(); }, []);
  function load() {
    fetch('/api/accounts').then((r) => r.json()).then((d) => {
      setAccounts((d.accounts || []).filter((a) => a.id !== 'app-settings'));
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch('/api/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ name: '', type: 'cash', balance: '' });
    load();
  }

  async function handleDelete(id) {
    await fetch('/api/accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'delete', id }) });
    load();
  }

  const assets = accounts.filter((a) => a.type !== 'debt').reduce((s, a) => s + (a.balance || 0), 0);
  const debts = accounts.filter((a) => a.type === 'debt').reduce((s, a) => s + (a.balance || 0), 0);
  const netWorth = assets - debts;

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-[14px] uppercase tracking-[0.12em] font-semibold">NET WORTH</h1>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded font-mono text-[11px] uppercase tracking-[0.1em]" style={{ background: '#1E90FF', color: '#fff' }}>+ ADD ACCOUNT</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard title="Total Assets" value={assets} positive={true} />
        <MetricCard title="Total Debt" value={debts} positive={false} />
        <MetricCard title="Net Worth" value={netWorth} positive={netWorth >= 0} />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-5 space-y-4">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.1em] font-semibold">ADD ACCOUNT</h2>
          <div className="grid grid-cols-3 gap-4">
            <input placeholder="Account name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-field" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
              {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <input type="number" step="0.01" placeholder="Balance" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} required className="input-field" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded font-mono text-[11px] uppercase" style={{ background: '#1E90FF', color: '#fff' }}>Add</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded font-mono text-[11px] uppercase" style={{ background: 'var(--crm-surface2)', color: 'var(--crm-text-secondary)' }}>Cancel</button>
          </div>
        </form>
      )}

      {ACCOUNT_TYPES.map((type) => {
        const list = accounts.filter((a) => a.type === type);
        if (list.length === 0) return null;
        return (
          <div key={type} className="glass-card-solid overflow-hidden">
            <h3 className="px-5 py-3 font-mono text-[11px] uppercase tracking-[0.12em] font-semibold border-b" style={{ borderColor: 'var(--crm-border)' }}>{type} ACCOUNTS</h3>
            {list.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-5 py-3 border-b hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                <span className="text-sm">{a.name}</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[13px]" style={{ color: type === 'debt' ? 'var(--crm-negative)' : 'var(--crm-positive)' }}>
                    ${(a.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <button onClick={() => handleDelete(a.id)} className="font-mono text-[10px] uppercase" style={{ color: 'var(--crm-negative)' }}>Del</button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {accounts.length === 0 && <EmptyState icon="—" message="No accounts yet" />}
    </div>
  );
}
