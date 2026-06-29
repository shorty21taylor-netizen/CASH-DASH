'use client';

import { useState, useEffect } from 'react';
import { POLICY_STATUSES } from '../../lib/constants.js';
import MetricCard from '../../components/MetricCard.js';
import EmptyState from '../../components/EmptyState.js';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function LifeInsurancePage() {
  const [policies, setPolicies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(getBlank());

  function getBlank() {
    return {
      client_name: '', premium: '', commission_rate: 0.50, first_year_amount: '',
      renewal_rate: 0.05, renewal_months: [], status: 'active',
      sold_date: new Date().toISOString().split('T')[0],
    };
  }

  useEffect(() => { load(); }, []);
  function load() { fetch('/api/policies').then((r) => r.json()).then((d) => setPolicies(d.policies || [])); }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function toggleMonth(monthIdx) {
    const months = [...(form.renewal_months || [])];
    const idx = months.indexOf(monthIdx);
    if (idx >= 0) months.splice(idx, 1);
    else months.push(monthIdx);
    setForm({ ...form, renewal_months: months.sort((a, b) => a - b) });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch('/api/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editing ? { ...form, id: editing } : form),
    });
    setShowForm(false);
    setEditing(null);
    load();
  }

  async function handleDelete(id) {
    await fetch('/api/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _action: 'delete', id }),
    });
    load();
  }

  const active = policies.filter((p) => p.status === 'active');
  const totalPremium = active.reduce((s, p) => s + (p.premium || 0), 0);
  const totalFirstYear = active.reduce((s, p) => s + (p.first_year_amount || 0), 0);
  const totalRenewals = active.reduce((s, p) => s + ((p.premium || 0) * (p.renewal_rate || 0)), 0);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Life Insurance</h1>
          <p className="text-neutral-500 text-sm">Policy management with renewal projections</p>
        </div>
        <button onClick={() => { setForm(getBlank()); setEditing(null); setShowForm(true); }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
          + New Policy
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard title="Active Policies" value={active.length} />
        <MetricCard title="Total Premium" value={totalPremium} />
        <MetricCard title="First Year Commissions" value={totalFirstYear} positive={true} />
        <MetricCard title="Annual Renewals" value={totalRenewals} positive={true} />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-6 space-y-4">
          <h2 className="font-semibold text-lg">{editing ? 'Edit' : 'New'} Policy</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Client Name</label>
              <input name="client_name" value={form.client_name} onChange={handleChange} required className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Sold Date</label>
              <input name="sold_date" type="date" value={form.sold_date} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Annual Premium ($)</label>
              <input name="premium" type="number" step="0.01" value={form.premium} onChange={handleChange} required className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Commission Rate</label>
              <input name="commission_rate" type="number" step="0.01" value={form.commission_rate} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">First Year Amount ($)</label>
              <input name="first_year_amount" type="number" step="0.01" value={form.first_year_amount} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Renewal Rate</label>
              <input name="renewal_rate" type="number" step="0.01" value={form.renewal_rate} onChange={handleChange} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-2">Renewal Months</label>
            <div className="flex gap-2 flex-wrap">
              {MONTHS.map((m, i) => (
                <button key={i} type="button" onClick={() => toggleMonth(i)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    (form.renewal_months || []).includes(i) ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400 hover:text-white'
                  }`}>{m}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-neutral-500 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm">
              {Object.values(POLICY_STATUSES).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">{editing ? 'Update' : 'Add'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="glass-card-solid overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--crm-border)' }}>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Client</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Premium</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Rate</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">First Year</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Renewal</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Months</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                <td className="px-4 py-3 text-sm font-medium">{p.client_name}</td>
                <td className="px-4 py-3 text-sm text-right font-mono">${(p.premium || 0).toLocaleString()}/yr</td>
                <td className="px-4 py-3 text-sm text-right font-mono">{((p.commission_rate || 0) * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-sm text-right font-mono text-green-400">${(p.first_year_amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-right font-mono">{((p.renewal_rate || 0) * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-xs text-neutral-400">{(p.renewal_months || []).map((m) => MONTHS[m]).join(', ') || '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: POLICY_STATUSES[p.status]?.color + '18', color: POLICY_STATUSES[p.status]?.color }}>
                    {POLICY_STATUSES[p.status]?.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setForm({ ...p }); setEditing(p.id); setShowForm(true); }} className="text-xs text-neutral-400 hover:text-white mr-3">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {policies.length === 0 && <EmptyState icon="🛡️" message="No policies yet. Add your first one!" />}
      </div>
    </div>
  );
}
