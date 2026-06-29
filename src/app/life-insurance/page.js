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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Life Insurance</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--crm-text-muted)' }}>Policy management & renewal projections</p>
        </div>
        <button onClick={() => { setForm(getBlank()); setEditing(null); setShowForm(true); }} className="px-4 py-2 rounded-xl text-[13px] font-medium" style={{ background: 'var(--crm-accent)', color: '#0a0c0a' }}>
          + New policy
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <MetricCard title="Active policies" value={active.length} />
        <MetricCard title="Total premium" value={totalPremium} />
        <MetricCard title="First year comm" value={totalFirstYear} positive={true} />
        <MetricCard title="Annual renewals" value={totalRenewals} positive={true} />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-5 space-y-4">
          <h2 className="text-sm font-semibold">{editing ? 'Edit' : 'New'} Policy</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Client name</label>
              <input name="client_name" value={form.client_name} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Sold date</label>
              <input name="sold_date" type="date" value={form.sold_date} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Annual premium ($)</label>
              <input name="premium" type="number" step="0.01" value={form.premium} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Commission rate</label>
              <input name="commission_rate" type="number" step="0.01" value={form.commission_rate} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>First year ($)</label>
              <input name="first_year_amount" type="number" step="0.01" value={form.first_year_amount} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Renewal rate</label>
              <input name="renewal_rate" type="number" step="0.01" value={form.renewal_rate} onChange={handleChange} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] mb-2" style={{ color: 'var(--crm-text-secondary)' }}>Renewal months</label>
            <div className="flex gap-2 flex-wrap">
              {MONTHS.map((m, i) => (
                <button key={i} type="button" onClick={() => toggleMonth(i)}
                  className="px-3 py-1 rounded-lg text-[12px] transition-colors"
                  style={{
                    background: (form.renewal_months || []).includes(i) ? 'var(--crm-accent)' : 'var(--crm-surface2)',
                    color: (form.renewal_months || []).includes(i) ? '#0a0c0a' : 'var(--crm-text-muted)',
                  }}>{m}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input-field" style={{ width: 'auto' }}>
              {Object.values(POLICY_STATUSES).map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-xl text-[13px] font-medium" style={{ background: 'var(--crm-accent)', color: '#0a0c0a' }}>{editing ? 'Update' : 'Add'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-[13px]" style={{ background: 'var(--crm-surface2)', color: 'var(--crm-text-secondary)' }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="glass-card-solid overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--crm-border)' }}>
              <th className="text-left px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Client</th>
              <th className="text-right px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Premium</th>
              <th className="text-right px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Rate</th>
              <th className="text-right px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>First year</th>
              <th className="text-right px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Renewal</th>
              <th className="text-left px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Months</th>
              <th className="text-left px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Status</th>
              <th className="text-right px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                <td className="px-4 py-3 text-sm font-medium">{p.client_name}</td>
                <td className="px-4 py-3 text-right text-[13px]">${(p.premium || 0).toLocaleString()}/yr</td>
                <td className="px-4 py-3 text-right text-[13px]">{((p.commission_rate || 0) * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-right text-[13px]" style={{ color: 'var(--crm-accent)' }}>${(p.first_year_amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-right text-[13px]">{((p.renewal_rate || 0) * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-[12px]" style={{ color: 'var(--crm-text-muted)' }}>{(p.renewal_months || []).map((m) => MONTHS[m]).join(', ') || '—'}</td>
                <td className="px-4 py-3">
                  <span className="text-[12px] px-2 py-0.5 rounded-lg" style={{
                    background: p.status === 'active' ? 'rgba(74,222,128,0.1)' : p.status === 'pending' ? 'rgba(255,255,255,0.05)' : 'rgba(239,68,68,0.1)',
                    color: p.status === 'active' ? 'var(--crm-accent)' : p.status === 'pending' ? 'var(--crm-text-secondary)' : '#ef4444',
                  }}>{POLICY_STATUSES[p.status]?.label}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setForm({ ...p }); setEditing(p.id); setShowForm(true); }} className="text-[12px] mr-3" style={{ color: 'var(--crm-text-muted)' }}>Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-[12px]" style={{ color: 'var(--crm-negative)' }}>Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {policies.length === 0 && <EmptyState message="No policies yet" />}
      </div>
    </div>
  );
}
