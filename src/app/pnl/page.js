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

  if (!data) return <span className="text-sm" style={{ color: 'var(--crm-text-muted)' }}>Loading...</span>;

  const margin = data.totalRevenue > 0 ? ((data.netPnl / data.totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">P&L Statement</h1>
        <div className="flex gap-px rounded-xl overflow-hidden" style={{ border: '1px solid var(--crm-border)' }}>
          {['mtd', 'ytd'].map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className="px-4 py-1.5 text-[13px] transition-colors"
              style={{
                background: range === r ? 'var(--crm-accent)' : 'transparent',
                color: range === r ? '#0a0c0a' : 'var(--crm-text-muted)',
                fontWeight: range === r ? 600 : 400,
              }}>
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card-solid overflow-hidden">
        <div className="p-5 border-b" style={{ borderColor: 'var(--crm-border)' }}>
          <h2 className="text-[13px] mb-4" style={{ color: 'var(--crm-text-secondary)' }}>Revenue</h2>
          <div className="space-y-1">
            <Row label="I2I Offer" value={data.byStream?.htA || 0} />
            <Row label="BNB Offer" value={data.byStream?.htB || 0} />
            <Row label="Life Insurance" value={data.byStream?.life || 0} />
            <Row label="Summit Placement" value={data.byStream?.summit || 0} />
            <Row label="Retainer Income" value={data.retainerIncome || 0} />
            <Row label="Renewal Income" value={data.renewalIncome || 0} />
            <Row label="Market Profits" value={data.marketProfits || 0} positive={(data.marketProfits || 0) >= 0} negative={(data.marketProfits || 0) < 0} />
            <Row label="Other Income" value={data.otherIncome || 0} />
            <Row label="Total Revenue" value={data.totalRevenue || 0} bold positive />
          </div>
        </div>
        <div className="p-5 border-b" style={{ borderColor: 'var(--crm-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[13px]" style={{ color: 'var(--crm-text-secondary)' }}>Expenses</h2>
            <button onClick={() => setShowExpenseForm(!showExpenseForm)} className="text-[13px]" style={{ color: 'var(--crm-accent)' }}>+ Add</button>
          </div>
          {showExpenseForm && (
            <form onSubmit={addExpense} className="mb-4 p-4 rounded-xl space-y-3" style={{ background: 'var(--crm-surface2)' }}>
              <div className="grid grid-cols-4 gap-3">
                <input name="label" placeholder="Label" value={expForm.label} onChange={(e) => setExpForm({ ...expForm, label: e.target.value })} required className="input-field" />
                <input name="amount" type="number" step="0.01" placeholder="Amount" value={expForm.amount} onChange={(e) => setExpForm({ ...expForm, amount: e.target.value })} required className="input-field" />
                <select value={expForm.category} onChange={(e) => setExpForm({ ...expForm, category: e.target.value })} className="input-field">
                  <option value="business">Business</option>
                  <option value="personal">Personal</option>
                </select>
                <select value={expForm.frequency} onChange={(e) => setExpForm({ ...expForm, frequency: e.target.value, recurring: e.target.value !== 'once' })} className="input-field">
                  <option value="once">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <button type="submit" className="px-3 py-1 rounded-xl text-[13px] font-medium" style={{ background: 'var(--crm-accent)', color: '#0a0c0a' }}>Add</button>
            </form>
          )}
          <div className="space-y-1">
            <Row label="Business Expenses" value={data.bizExpenses || 0} negative />
            <Row label="Personal Expenses" value={data.personalExpenses || 0} negative />
            <Row label="Total Expenses" value={data.totalExpenses || 0} bold negative />
          </div>
        </div>
        <div className="p-5">
          <div className="space-y-1">
            <Row label="Net P&L" value={data.netPnl || 0} bold positive={data.netPnl >= 0} negative={data.netPnl < 0} xl />
            <Row label="Margin" value={`${margin}%`} />
          </div>
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="glass-card-solid overflow-hidden">
          <h3 className="px-5 py-3 text-sm font-semibold border-b" style={{ borderColor: 'var(--crm-border)' }}>Expense Detail</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--crm-border)' }}>
                <th className="text-left px-4 py-2 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Label</th>
                <th className="text-left px-4 py-2 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Category</th>
                <th className="text-right px-4 py-2 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Amount</th>
                <th className="text-left px-4 py-2 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}>Frequency</th>
                <th className="text-right px-4 py-2 text-[13px] font-normal" style={{ color: 'var(--crm-text-secondary)' }}></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                  <td className="px-4 py-2 text-sm">{e.label}</td>
                  <td className="px-4 py-2 text-[13px] capitalize" style={{ color: 'var(--crm-text-muted)' }}>{e.category}</td>
                  <td className="px-4 py-2 text-right text-[13px]" style={{ color: 'var(--crm-negative)' }}>${(e.amount || 0).toLocaleString()}</td>
                  <td className="px-4 py-2 text-[13px] capitalize" style={{ color: 'var(--crm-text-muted)' }}>{e.frequency}</td>
                  <td className="px-4 py-2 text-right"><button onClick={() => deleteExpense(e.id)} className="text-[12px]" style={{ color: 'var(--crm-negative)' }}>Del</button></td>
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
  const color = positive ? 'var(--crm-positive)' : negative ? 'var(--crm-negative)' : 'var(--crm-text)';
  return (
    <div className={`flex justify-between items-center ${bold ? 'py-2 border-t' : 'py-1'}`} style={bold ? { borderColor: 'var(--crm-border)' } : {}}>
      <span className={`text-[13px] ${bold ? 'font-semibold' : ''}`} style={{ color: bold ? 'var(--crm-text)' : 'var(--crm-text-muted)' }}>{label}</span>
      <span className={`${xl ? 'text-2xl font-light' : 'text-[13px]'} ${bold ? 'font-semibold' : ''}`} style={{ color }}>{formatted}</span>
    </div>
  );
}
