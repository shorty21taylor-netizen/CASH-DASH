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
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-[14px] uppercase tracking-[0.12em] font-semibold">LIFE INSURANCE</h1>
          <p className="font-mono text-[11px] mt-0.5" style={{ color: 'var(--crm-text-muted)' }}>Policy management & renewal projections</p>
        </div>
        <button onClick={() => { setForm(getBlank()); setEditing(null); setShowForm(true); }} className="px-4 py-2 rounded font-mono text-[11px] uppercase tracking-[0.1em]" style={{ background: '#1E90FF', color: '#fff' }}>
          + NEW POLICY
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <MetricCard title="Active Policies" value={active.length} />
        <MetricCard title="Total Premium" value={totalPremium} />
        <MetricCard title="First Year Comm" value={totalFirstYear} positive={true} />
        <MetricCard title="Annual Renewals" value={totalRenewals} positive={true} />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-5 space-y-4">
          <h2 className="font-mono text-[12px] uppercase tracking-[0.1em] font-semibold">{editing ? 'EDIT' : 'NEW'} POLICY</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--crm-text-muted)' }}>Client Name</label>
              <input name="client_name" value={form.client_name} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--crm-text-muted)' }}>Sold Date</label>
              <input name="sold_date" type="date" value={form.sold_date} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--crm-text-muted)' }}>Annual Premium ($)</label>
              <input name="premium" type="number" step="0.01" value={form.premium} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--crm-text-muted)' }}>Commission Rate</label>
              <input name="commission_rate" type="number" step="0.01" value={form.commission_rate} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--crm-text-muted)' }}>First Year ($)</label>
              <input name="first_year_amount" type="number" step="0.01" value={form.first_year_amount} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--crm-text-muted)' }}>Renewal Rate</label>
              <input name="renewal_rate" type="number" step="0.01" value={form.renewal_rate} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-2" style={{ color: 'var(--crm-text-muted)' }}>Renewal Months</label>
            <div className="flex gap-2 flex-wrap">
              {MONTHS.map((m, i) => (
                <button key={i} type="button" onClick={() => toggleMonth(i)}
                  className="px-3 py-1 rounded font-mono text-[10px] uppercase transition-colors"
                  style={{
                    background: (form.renewal_months || []).includes(i) ? '#1E90FF' : 'var(--crm-surface2)',
                    color: (form.renewal_months || []).includes(i) ? '#fff' : 'var(--crm-text-muted)',
                  }}>{m}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.12em] mb-1" style={{ color: 'var(--crm-text-muted)' }}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input-field" style={{ width: 'auto' }}>
              {Object.values(POLICY_STATUSES).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded font-mono text-[11px] uppercase" style={{ background: '#1E90FF', color: '#fff' }}>{editing ? 'Update' : 'Add'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded font-mono text-[11px] uppercase" style={{ background: 'var(--crm-surface2)', color: 'var(--crm-text-secondary)' }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="glass-card-solid overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--crm-border)' }}>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>Client</th>
              <th className="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>Premium</th>
              <th className="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>Rate</th>
              <th className="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>First Year</th>
              <th className="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>Renewal</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>Months</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>Status</th>
              <th className="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-[0.12em] font-normal" style={{ color: 'var(--crm-text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                <td className="px-4 py-3 text-sm font-medium">{p.client_name}</td>
                <td className="px-4 py-3 text-right font-mono text-[13px]">${(p.premium || 0).toLocaleString()}/yr</td>
                <td className="px-4 py-3 text-right font-mono text-[13px]">{((p.commission_rate || 0) * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-right font-mono text-[13px]" style={{ color: '#1E90FF' }}>${(p.first_year_amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono text-[13px]">{((p.renewal_rate || 0) * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 font-mono text-[11px]" style={{ color: 'var(--crm-text-muted)' }}>{(p.renewal_months || []).map((m) => MONTHS[m]).join(', ') || '—'}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded" style={{
                    background: p.status === 'active' ? 'rgba(34,197,94,0.1)' : p.status === 'pending' ? 'rgba(255,255,255,0.05)' : 'rgba(239,68,68,0.1)',
                    color: p.status === 'active' ? '#22c55e' : p.status === 'pending' ? 'var(--crm-text-secondary)' : '#ef4444',
                  }}>{POLICY_STATUSES[p.status]?.label}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setForm({ ...p }); setEditing(p.id); setShowForm(true); }} className="font-mono text-[10px] uppercase mr-3" style={{ color: 'var(--crm-text-muted)' }}>Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="font-mono text-[10px] uppercase" style={{ color: 'var(--crm-negative)' }}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {policies.length === 0 && <EmptyState icon="—" message="No policies yet" />}
      </div>
    </div>
  );
}
