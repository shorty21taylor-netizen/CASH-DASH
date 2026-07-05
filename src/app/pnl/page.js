'use client';

import { useState, useEffect, useCallback } from 'react';
import { localToday } from '../../lib/constants.js';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function buildQuery(rangeState) {
  const today = localToday();
  const base = `today=${today}`;
  if (rangeState.type === 'mtd') return `range=mtd&${base}`;
  if (rangeState.type === 'qtd') return `range=qtd&${base}`;
  if (rangeState.type === 'ytd') return `range=ytd&${base}`;
  if (rangeState.type === 'month') return `range=month&month=${rangeState.month}&${base}`;
  if (rangeState.type === 'custom') return `range=custom&start=${rangeState.start}&end=${rangeState.end}&${base}`;
  return `range=mtd&${base}`;
}

function rangeDisplayLabel(rangeState, data) {
  if (rangeState.type === 'mtd') return 'MTD';
  if (rangeState.type === 'qtd') return data?.rangeLabel || 'QTD';
  if (rangeState.type === 'ytd') return 'YTD';
  if (rangeState.type === 'month') {
    const [y, m] = rangeState.month.split('-');
    return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
  }
  if (rangeState.type === 'custom') return 'Custom';
  return 'MTD';
}

export default function PnLPage() {
  const [data, setData] = useState(null);
  const [rangeState, setRangeState] = useState({ type: 'mtd' });
  const [expenses, setExpenses] = useState([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expForm, setExpForm] = useState({ category: 'business', label: '', amount: '', recurring: false, frequency: 'once', date: localToday() });
  const [showMonths, setShowMonths] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  function reload() {
    fetch(`/api/dashboard?${buildQuery(rangeState)}`).then((r) => r.json()).then(setData);
    fetch('/api/expenses').then((r) => r.json()).then((d) => setExpenses(d.expenses || []));
  }

  useEffect(() => { reload(); }, [rangeState]);

  const selectRange = useCallback((type) => {
    setRangeState({ type });
    setShowMonths(false);
    setShowCustom(false);
  }, []);

  const selectMonth = useCallback((monthStr) => {
    setRangeState({ type: 'month', month: monthStr });
    setShowMonths(false);
    setShowCustom(false);
  }, []);

  const applyCustom = useCallback(() => {
    if (customStart && customEnd) {
      setRangeState({ type: 'custom', start: customStart, end: customEnd });
      setShowCustom(false);
      setShowMonths(false);
    }
  }, [customStart, customEnd]);

  async function addExpense(e) {
    e.preventDefault();
    await fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(expForm) });
    setShowExpenseForm(false);
    setExpForm({ category: 'business', label: '', amount: '', recurring: false, frequency: 'once', date: localToday() });
    reload();
  }

  async function deleteExpense(id) {
    await fetch('/api/expenses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ _action: 'delete', id }) });
    reload();
  }

  if (!data) return <span className="text-[15px]" style={{ color: 'var(--crm-text-muted)' }}>Loading...</span>;

  const today = localToday();
  const currentYear = parseInt(today.split('-')[0]);
  const currentMonth = parseInt(today.split('-')[1]);
  const monthOptions = [];
  for (let m = 0; m < currentMonth; m++) {
    const val = `${currentYear}-${String(m + 1).padStart(2, '0')}`;
    monthOptions.push({ label: MONTH_NAMES[m], value: val });
  }

  const label = rangeDisplayLabel(rangeState, data);
  const margin = data.totalRevenue > 0 ? ((data.netPnl / data.totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold">P&L Statement</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-px rounded-xl overflow-hidden" style={{ border: '1px solid var(--crm-border)' }}>
            {['mtd', 'qtd', 'ytd'].map((r) => (
              <button key={r} onClick={() => selectRange(r)}
                className="px-4 py-2 text-[13px] font-medium transition-colors"
                style={{
                  background: rangeState.type === r ? 'var(--crm-accent)' : 'transparent',
                  color: rangeState.type === r ? '#fff' : 'var(--crm-text-muted)',
                  fontWeight: rangeState.type === r ? 600 : 400,
                }}>
                {r.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="relative">
            <button onClick={() => { setShowMonths(!showMonths); setShowCustom(false); }}
              className="px-4 py-2 rounded-xl text-[13px] font-medium transition-colors"
              style={{
                border: '1px solid var(--crm-border)',
                background: rangeState.type === 'month' ? 'var(--crm-accent)' : 'transparent',
                color: rangeState.type === 'month' ? '#fff' : 'var(--crm-text-muted)',
              }}>
              {rangeState.type === 'month' ? label : 'Month'}
            </button>
            {showMonths && (
              <div className="absolute right-0 top-full mt-2 p-3 rounded-xl z-50 grid grid-cols-4 gap-1.5" style={{ background: 'var(--crm-surface)', border: '1px solid var(--crm-border)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', minWidth: '220px' }}>
                {monthOptions.map((mo) => (
                  <button key={mo.value} onClick={() => selectMonth(mo.value)}
                    className="px-3 py-2 rounded-lg text-[13px] font-medium transition-colors"
                    style={{
                      background: rangeState.type === 'month' && rangeState.month === mo.value ? 'var(--crm-accent)' : 'var(--crm-surface2)',
                      color: rangeState.type === 'month' && rangeState.month === mo.value ? '#fff' : 'var(--crm-text-muted)',
                    }}>
                    {mo.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => { setShowCustom(!showCustom); setShowMonths(false); }}
              className="px-4 py-2 rounded-xl text-[13px] font-medium transition-colors"
              style={{
                border: '1px solid var(--crm-border)',
                background: rangeState.type === 'custom' ? 'var(--crm-accent)' : 'transparent',
                color: rangeState.type === 'custom' ? '#fff' : 'var(--crm-text-muted)',
              }}>
              Custom
            </button>
            {showCustom && (
              <div className="absolute right-0 top-full mt-2 p-4 rounded-xl z-50 space-y-3" style={{ background: 'var(--crm-surface)', border: '1px solid var(--crm-border)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', minWidth: '260px' }}>
                <div>
                  <label className="block text-[12px] mb-1" style={{ color: 'var(--crm-text-muted)' }}>Start date</label>
                  <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="input-field text-[13px]" />
                </div>
                <div>
                  <label className="block text-[12px] mb-1" style={{ color: 'var(--crm-text-muted)' }}>End date</label>
                  <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="input-field text-[13px]" />
                </div>
                <button onClick={applyCustom}
                  className="w-full px-4 py-2 rounded-xl text-[13px] font-semibold"
                  style={{ background: 'var(--crm-accent)', color: '#fff', opacity: customStart && customEnd ? 1 : 0.4 }}>
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card-solid overflow-hidden">
        <div className="p-6 border-b" style={{ borderColor: 'var(--crm-border)' }}>
          <h2 className="text-[14px] font-medium mb-5" style={{ color: 'var(--crm-text-secondary)' }}>Revenue ({label})</h2>
          <div className="space-y-1.5">
            {(data.streams || []).map((s) => (
              <Row key={s.key} label={s.label} value={data.byStream?.[s.key] || 0} />
            ))}
            <Row label="Base Pay (general)" value={data.basePayGeneral || 0} />
            <Row label="Retainer Income" value={data.retainerIncome || 0} />
            <Row label="Additional Income" value={data.additionalIncome || 0} />
            <Row label="Renewal Income" value={data.renewalIncome || 0} />
            <Row label="Market Profits" value={data.marketProfits || 0} positive={(data.marketProfits || 0) >= 0} negative={(data.marketProfits || 0) < 0} />
            <Row label="Other Income" value={data.otherIncome || 0} />
            <Row label="Total Revenue" value={data.totalRevenue || 0} bold positive />
          </div>
        </div>
        <div className="p-6 border-b" style={{ borderColor: 'var(--crm-border)' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[14px] font-medium" style={{ color: 'var(--crm-text-secondary)' }}>Expenses ({label})</h2>
            <button onClick={() => setShowExpenseForm(!showExpenseForm)} className="text-[14px] font-medium" style={{ color: 'var(--crm-accent)' }}>+ Add</button>
          </div>
          {showExpenseForm && (
            <form onSubmit={addExpense} className="mb-5 p-5 rounded-xl space-y-4" style={{ background: 'var(--crm-surface2)' }}>
              <div className="grid grid-cols-4 gap-4">
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
              <button type="submit" className="px-4 py-2 rounded-xl text-[14px] font-semibold" style={{ background: 'var(--crm-accent)', color: '#fff' }}>Add</button>
            </form>
          )}
          <div className="space-y-1.5">
            <Row label="Business Expenses" value={data.bizExpenses || 0} negative />
            <Row label="Personal Expenses" value={data.personalExpenses || 0} negative />
            <Row label="Total Expenses" value={data.totalExpenses || 0} bold negative />
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-1.5">
            <Row label={`Net P&L (${label})`} value={data.netPnl || 0} bold positive={data.netPnl >= 0} negative={data.netPnl < 0} xl />
            <Row label="Margin" value={`${margin}%`} />
          </div>
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="glass-card-solid overflow-hidden">
          <h3 className="px-6 py-4 text-[15px] font-bold border-b" style={{ borderColor: 'var(--crm-border)' }}>Expense Detail</h3>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--crm-border)' }}>
                <th className="text-left px-5 py-3 text-[14px] font-medium" style={{ color: 'var(--crm-text-secondary)' }}>Label</th>
                <th className="text-left px-5 py-3 text-[14px] font-medium" style={{ color: 'var(--crm-text-secondary)' }}>Category</th>
                <th className="text-right px-5 py-3 text-[14px] font-medium" style={{ color: 'var(--crm-text-secondary)' }}>Amount</th>
                <th className="text-left px-5 py-3 text-[14px] font-medium" style={{ color: 'var(--crm-text-secondary)' }}>Frequency</th>
                <th className="text-right px-5 py-3 text-[14px] font-medium" style={{ color: 'var(--crm-text-secondary)' }}></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b hover:bg-white/[0.02]" style={{ borderColor: 'var(--crm-border)' }}>
                  <td className="px-5 py-3 text-[15px]">{e.label}</td>
                  <td className="px-5 py-3 text-[14px] capitalize" style={{ color: 'var(--crm-text-muted)' }}>{e.category}</td>
                  <td className="px-5 py-3 text-right text-[14px] font-medium" style={{ color: 'var(--crm-negative)' }}>${(e.amount || 0).toLocaleString()}</td>
                  <td className="px-5 py-3 text-[14px] capitalize" style={{ color: 'var(--crm-text-muted)' }}>{e.frequency}</td>
                  <td className="px-5 py-3 text-right"><button onClick={() => deleteExpense(e.id)} className="text-[13px]" style={{ color: 'var(--crm-negative)' }}>Del</button></td>
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
    <div className={`flex justify-between items-center ${bold ? 'py-3 border-t' : 'py-1.5'}`} style={bold ? { borderColor: 'var(--crm-border)' } : {}}>
      <span className={`text-[14px] ${bold ? 'font-bold' : ''}`} style={{ color: bold ? 'var(--crm-text)' : 'var(--crm-text-muted)' }}>{label}</span>
      <span className={`${xl ? 'text-3xl font-bold' : 'text-[14px]'} ${bold ? 'font-bold' : ''}`} style={{ color }}>{formatted}</span>
    </div>
  );
}
