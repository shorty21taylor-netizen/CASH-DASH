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
      setAccounts((d.accounts || []).filter((a) => a.id !== 'app-settings' && a.id !== 'income_pay_settings'));
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Net Worth</h1>
        <button onClick={() => setShowForm(true)} className="px-5 py-2.5 rounded-xl text-[14px] font-semibold" style={{ background: 'var(--crm-accent)', color: '#fff' }}>+ Add account</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard title="Total assets" value={assets} positive={true} />
        <MetricCard title="Total debt" value={debts} positive={false} />
        <MetricCard title="Net worth" value={netWorth} positive={netWorth >= 0} />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-6 space-y-5">
          <h2 className="text-[15px] font-bold">Add Account</h2>
          <div className="grid grid-cols-3 gap-5">
            <input placeholder="Account name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="input-field" />
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
              {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
            <input type="number" step="0.01" placeholder="Balance" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} required className="input-field" />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="px-5 py-2.5 rounded-xl text-[14px] font-semibold" style={{ background: 'var(--crm-accent)', color: '#fff' }}>Add</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-[14px]" style={{ background: 'var(--crm-surface2)', color: 'var(--crm-text-secondary)' }}>Cancel</button>
          </div>
        </form>
      )}

      {ACCOUNT_TYPES.map((type) => {
        const list = accounts.filter((a) => a.type === type);
        if (list.length === 0) return null;
        return (
          <div key={type} className="glass-card-solid overflow-hidden">
            <h3 className="px-6 py-4 text-[15px] font-bold border-b capitalize" style={{ borderColor: 'var(--crm-border)' }}>{type} accounts</h3>
            {list.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-6 py-4 border-b hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                <span className="text-[15px] font-medium">{a.name}</span>
                <div className="flex items-center gap-5">
                  <span className="text-[14px] font-semibold" style={{ color: type === 'debt' ? 'var(--crm-negative)' : 'var(--crm-positive)' }}>
                    ${(a.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <button onClick={() => handleDelete(a.id)} className="text-[13px]" style={{ color: 'var(--crm-negative)' }}>Del</button>
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {accounts.length === 0 && <EmptyState message="No accounts yet" />}
    </div>
  );
}
