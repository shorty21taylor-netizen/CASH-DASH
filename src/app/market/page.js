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
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Market Profits</h1>
          <p className="text-neutral-500 text-sm">Trading & investment gains</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">+ Log Profit</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard title="Total P&L" value={total} positive={total >= 0} />
        <MetricCard title="Realized" value={realized} positive={realized >= 0} />
        <MetricCard title="Unrealized" value={unrealized} positive={unrealized >= 0} />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card-solid p-6 space-y-4">
          <h2 className="font-semibold">Log Market Profit/Loss</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Source / Broker</label>
              <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="e.g. Robinhood, TD" className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Ticker / Asset</label>
              <input value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value })} placeholder="e.g. AAPL, BTC" className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Amount ($)</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required placeholder="Negative for losses" className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm">
                <option value="realized">Realized</option>
                <option value="unrealized">Unrealized</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Notes</label>
              <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium">Add</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm">Cancel</button>
          </div>
        </form>
      )}

      {chartData.length > 1 && (
        <TrendChart data={chartData} lines={[{ key: 'profit', name: 'Market P&L', color: '#22c55e' }]} title="Monthly Market P&L" />
      )}

      <div className="glass-card-solid overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--crm-border)' }}>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Ticker</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Source</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Type</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-neutral-500 uppercase">Notes</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {profits.map((p) => (
              <tr key={p.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                <td className="px-4 py-3 text-sm">{p.date}</td>
                <td className="px-4 py-3 text-sm font-mono font-medium">{p.ticker || '—'}</td>
                <td className="px-4 py-3 text-sm text-neutral-400">{p.source || '—'}</td>
                <td className={`px-4 py-3 text-sm text-right font-mono ${(p.amount || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(p.amount || 0) < 0 ? '-' : ''}${Math.abs(p.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${p.type === 'realized' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {p.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-neutral-400 truncate max-w-[200px]">{p.notes}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:text-red-300">×</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {profits.length === 0 && <EmptyState icon="📈" message="No market profits logged yet." />}
      </div>
    </div>
  );
}
