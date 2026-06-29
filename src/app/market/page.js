'use client';

import { useState, useEffect } from 'react';
import MetricCard from '../../components/MetricCard.js';
import TrendChart from '../../components/TrendChart.js';
import EmptyState from '../../components/EmptyState.js';

export default function MarketProfitsPage() {
  const [profits, setProfits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ source: '', ticker: '', amount: '', type: 'realized', date: new Date().toISOString().split('T')[0], notes: '' });

  useEffect(() => { load(); }, []);
  function load() { fetch('/api/market-profits').then((r) => r.json()).then((d) => setProfits(d.profits || [])); }

  async function handleSubmit(e) {
    e.preventDefault();
    await fetch('/api/market-profits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setForm({ source: '', ticker: '', amount: '', type: 'realized', date: new Date().toISOString().split('T')[0], notes: '' });
    load();
  }

  async function handleDelete(id) {
    await fetch('/api/market-profits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'delete', id }) });
    load();
  }

  const realized = profits.filter((p) => p.type === 'realized').reduce((s, p) => s + (p.amount || 0), 0);
  const unrealized = profits.filter((p) => p.type === 'unrealized').reduce((s, p) => s + (p.amount || 0), 0);
  const total = profits.reduce((s, p) => s + (p.amount || 0), 0);

  const sorted = [...profits].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const monthly = {};
  sorted.forEach((p) => {
    if (!p.date) return;
    const m = p.date.substring(0, 7);
    if (!monthly[m]) monthly[m] = { label: m, profit: 0 };
    monthly[m].profit += p.amount || 0;
  });
  const chartData = Object.values(monthly).slice(-12);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Market Profits</h1>
          <p className="text-[13px] mt-0.5" style={{ color: 'var(--crm-text-muted)' }}>Trading & investment gains</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl text-[13px] font-medium" style={{ background: 'var(--crm-accent)', color: '#0a0c0a' }}>+ Log profit</button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <MetricCard title="Total P&L" value={total} positive={total >= 0} />
        <MetricCard title="Realized" value={realized} positive={realized >= 0} />
        <MetricCard title="Unrealized" value={unrealized} positive={unrealized >= 0} />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-5 space-y-4">
          <h2 className="text-sm font-semibold">Log Market Profit/Loss</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Source / broker</label>
              <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="e.g. Robinhood, TD" className="input-field" />
            </div>
            <div>
              <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Ticker / asset</label>
              <input value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value })} placeholder="e.g. AAPL, BTC" className="input-field" />
            </div>
            <div>
              <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Amount ($)</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required placeholder="Negative for losses" className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                <option value="realized">Realized</option>
                <option value="unrealized">Unrealized</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Notes</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-xl text-[13px] font-medium" style={{ background: 'var(--crm-accent)', color: '#0a0c0a' }}>Add</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-[13px]" style={{ background: 'var(--crm-surface2)', color: 'var(--crm-text-secondary)' }}>Cancel</button>
          </div>
        </form>
      )}

      {chartData.length > 1 && (
        <TrendChart data={chartData} lines={[{ key: 'profit', name: 'Market P&L', color: '#22c55e' }]} title="Monthly market P&L" />
      )}

      <div className="glass-card-solid overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--crm-border)' }}>
              <th className="text-left px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Date</th>
              <th className="text-left px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Ticker</th>
              <th className="text-left px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Source</th>
              <th className="text-right px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Amount</th>
              <th className="text-left px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Type</th>
              <th className="text-left px-4 py-3 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Notes</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {profits.map((p) => (
              <tr key={p.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                <td className="px-4 py-3 text-[13px]">{p.date}</td>
                <td className="px-4 py-3 text-[13px] font-medium">{p.ticker || '—'}</td>
                <td className="px-4 py-3 text-[13px]" style={{ color: 'var(--crm-text-muted)' }}>{p.source || '—'}</td>
                <td className="px-4 py-3 text-right text-[13px]" style={{ color: (p.amount || 0) >= 0 ? 'var(--crm-positive)' : 'var(--crm-negative)' }}>
                  {(p.amount || 0) < 0 ? '-' : ''}${Math.abs(p.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[12px] px-2 py-0.5 rounded-lg" style={{
                    background: p.type === 'realized' ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                    color: p.type === 'realized' ? 'var(--crm-accent)' : 'var(--crm-text-secondary)',
                  }}>{p.type}</span>
                </td>
                <td className="px-4 py-3 text-[12px] truncate max-w-[200px]" style={{ color: 'var(--crm-text-muted)' }}>{p.notes}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(p.id)} className="text-[12px]" style={{ color: 'var(--crm-negative)' }}>x</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {profits.length === 0 && <EmptyState message="No market profits logged" />}
      </div>
    </div>
  );
}
