'use client';

import { useState, useEffect } from 'react';

export default function PnLPage() {
  const [data, setData] = useState(null);
  const [range, setRange] = useState('mtd');
  const [expenses, setExpenses] = useState([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expForm, setExpForm] = useState({ category: 'business', label: '', amount: '', recurring: false, frequency: 'once', date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    fetch(`/api/dashboard?range=${range}`).then((r) => r.json()).then(setData);
    fetch('/api/expenses').then((r) => r.json()).then((d) => setExpenses(d.expenses || []));
  }, [range]);

  async function addExpense(e) {
    e.preventDefault();
    await fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expForm) });
    setShowExpenseForm(false);
    setExpForm({ category: 'business', label: '', amount: '', recurring: false, frequency: 'once', date: new Date().toISOString().split('T')[0] });
    fetch(`/api/dashboard?range=${range}`).then((r) => r.json()).then(setData);
    fetch('/api/expenses').then((r) => r.json()).then((d) => setExpenses(d.expenses || []));
  }

  async function deleteExpense(id) {
    await fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'delete', id }) });
    fetch(`/api/dashboard?range=${range}`).then((r) => r.json()).then(setData);
    fetch('/api/expenses').then((r) => r.json()).then((d) => setExpenses(d.expenses || []));
  }

  if (!data) return <div className="text-neutral-500">Loading...</div>;

  const margin = data.totalRevenue > 0 ? ((data.netPnl / data.totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">P&L Statement</h1>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--crm-surface)' }}>
          {['mtd', 'ytd'].map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${range === r ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white'}`}>
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card-solid overflow-hidden">
        <div className="p-6 border-b" style={{ borderColor: 'var(--crm-border)' }}>
          <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">Revenue</h2>
          <div className="space-y-2">
            <Row label="I2I Offer" value={data.byStream?.htA || 0} />
            <Row label="BNB Offer" value={data.byStream?.htB || 0} />
            <Row label="Life Insurance" value={data.byStream?.life || 0} />
            <Row label="Summit Placement" value={data.byStream?.summit || 0} />
            <Row label="Renewal Income" value={data.renewalIncome || 0} />
            <Row label="Market Profits" value={data.marketProfits || 0} positive={(data.marketProfits || 0) >= 0} negative={(data.marketProfits || 0) < 0} />
            <Row label="Other Income" value={data.otherIncome || 0} />
            <Row label="Total Revenue" value={data.totalRevenue || 0} bold positive />
          </div>
        </div>
        <div className="p-6 border-b" style={{ borderColor: 'var(--crm-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Expenses</h2>
            <button onClick={() => setShowExpenseForm(!showExpenseForm)} className="text-xs text-red-400 hover:text-red-300">+ Add Expense</button>
          </div>
          {showExpenseForm && (
            <form onSubmit={addExpense} className="mb-4 p-4 rounded-lg bg-neutral-900 space-y-3">
              <div className="grid grid-cols-4 gap-3">
                <input name="label" placeholder="Label" value={expForm.label} onChange={(e) => setExpForm({ ...expForm, label: e.target.value })} required className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white" />
                <input name="amount" type="number" step="0.01" placeholder="Amount" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} required className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white" />
                <select value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })} className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white">
                  <option value="business">Business</option>
                  <option value="personal">Personal</option>
                </select>
                <select value={expForm.frequency} onChange={(e) => setExpForm({ ...expForm, frequency: e.target.value, recurring: e.target.value !== 'once' })} className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white">
                  <option value="once">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <button type="submit" className="px-3 py-1 bg-red-600 text-white rounded text-sm">Add</button>
            </form>
          )}
          <div className="space-y-2">
            <Row label="Business Expenses" value={data.bizExpenses || 0} negative />
            <Row label="Personal Expenses" value={data.personalExpenses || 0} negative />
            <Row label="Total Expenses" value={data.totalExpenses || 0} bold negative />
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            <Row label="Net P&L" value={data.netPnl || 0} bold positive={data.netPnl >= 0} negative={data.netPnl < 0} xl />
            <Row label="Margin" value={`${margin}%`} />
          </div>
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="glass-card-solid overflow-hidden">
          <h3 className="px-6 py-4 font-semibold border-b" style={{ borderColor: 'var(--crm-border)' }}>Expense Detail</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--crm-border)' }}>
                <th className="text-left px-4 py-2 text-xs text-neutral-500">Label</th>
                <th className="text-left px-4 py-2 text-xs text-neutral-500">Category</th>
                <th className="text-right px-4 py-2 text-xs text-neutral-500">Amount</th>
                <th className="text-left px-4 py-2 text-xs text-neutral-500">Frequency</th>
                <th className="text-right px-4 py-2 text-xs text-neutral-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                  <td className="px-4 py-2 text-sm">{e.label}</td>
                  <td className="px-4 py-2 text-sm capitalize text-neutral-400">{e.category}</td>
                  <td className="px-4 py-2 text-sm text-right font-mono text-red-400">${(e.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-2 text-sm text-neutral-400 capitalize">{e.frequency}</td>
                  <td className="px-4 py-2 text-right"><button onClick={() => deleteExpense(e.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, bold, positive, negative, xl }) {
  const formatted = typeof value === 'number'
    ? `${value < 0 ? '-' : ''}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    : value;
  const color = positive ? 'text-green-400' : negative ? 'text-red-400' : 'text-white';
  return (
    <div className={`flex justify-between items-center ${bold ? 'py-2 border-t' : 'py-1'}`} style={bold ? { borderColor: 'var(--crm-border)' } : {}}>
      <span className={`text-sm ${bold ? 'font-bold' : 'text-neutral-400'}`}>{label}</span>
      <span className={`font-mono ${bold ? 'font-bold' : ''} ${xl ? 'text-2xl' : 'text-sm'} ${color}`}>{formatted}</span>
    </div>
  );
}
