'use client';

import { useState, useEffect, useCallback } from 'react';
import { localToday } from '../lib/constants.js';
import MetricCard from '../components/MetricCard.js';
import StreamChart from '../components/StreamChart.js';
import TrendChart from '../components/TrendChart.js';

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

export default function WarRoom() {
  const [data, setData] = useState(null);
  const [rangeState, setRangeState] = useState({ type: 'mtd' });
  const [loading, setLoading] = useState(true);
  const [showMonths, setShowMonths] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const refreshData = useCallback(() => {
    setLoading(true);
    fetch(`/api/dashboard?${buildQuery(rangeState)}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [rangeState]);

  useEffect(() => { refreshData(); }, [refreshData]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[15px]" style={{ color: 'var(--crm-text-muted)' }}>Initializing...</span>
      </div>
    );
  }

  const today = localToday();
  const currentYear = parseInt(today.split('-')[0]);
  const currentMonth = parseInt(today.split('-')[1]);
  const monthOptions = [];
  for (let m = 0; m < currentMonth; m++) {
    const val = `${currentYear}-${String(m + 1).padStart(2, '0')}`;
    monthOptions.push({ label: MONTH_NAMES[m], value: val });
  }

  const totalRev = data?.totalRevenue || 0;
  const totalComm = data?.commRevenue || 0;
  const pnl = data?.netPnl || 0;
  const isPositive = pnl >= 0;
  const label = rangeDisplayLabel(rangeState, data);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold" style={{ color: 'var(--crm-text)' }}>Shorty War Room</h1>
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

      <div className="panel-hero p-8 text-center rounded-3xl relative">
        <button onClick={refreshData}
          className="absolute top-4 right-4 p-2 rounded-xl transition-all hover:scale-105 active:scale-95"
          style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
          title="Refresh totals">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 2v6h-6" /><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M3 22v-6h6" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
          </svg>
        </button>
        <p className="text-[15px] opacity-70 mb-3" style={{ color: 'var(--crm-text-secondary)' }}>Total revenue ({label})</p>
        <p className="metric-number-xl text-white">
          <span className="accent-dollar">$</span>{totalRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <div className="flex justify-center gap-10 mt-4">
          <span className="text-[15px]" style={{ color: 'var(--crm-text-secondary)' }}>Commissions <span className="font-semibold" style={{ color: 'var(--crm-text)' }}>${totalComm.toLocaleString('en-US', { minimumFractionDigits: 0 })}</span></span>
          <span className="text-[15px]" style={{ color: 'var(--crm-text-secondary)' }}>Pipeline <span className="font-semibold" style={{ color: 'var(--crm-text)' }}>${(data?.pendingComm || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}</span></span>
          <span className="text-[15px]" style={{ color: 'var(--crm-text-secondary)' }}>Deals <span className="font-semibold" style={{ color: 'var(--crm-text)' }}>{data?.totalCommissions || 0}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Market profits" value={data?.marketProfits || 0} subtitle="Trading & investments" positive={(data?.marketProfits || 0) >= 0} />
        <MetricCard title="Renewal income" value={data?.renewalIncome || 0} subtitle={`${data?.activePolicies || 0} active policies`} positive={true} />
        <MetricCard title="Other income" value={data?.otherIncome || 0} subtitle="Non-commission" />
        <MetricCard title="Net worth" value={data?.netWorth || 0} positive={(data?.netWorth || 0) >= 0} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {(data?.streams || []).map((s, idx) => (
          <div key={s.key} className={idx === 0 ? 'panel-accent p-6 rounded-2xl' : 'glass-card-solid p-6'}>
            <p className="text-[14px] font-medium mb-3"
              style={{ color: idx === 0 ? 'rgba(255,255,255,0.7)' : 'var(--crm-text-muted)' }}>
              {s.label}
            </p>
            <p className={`metric-number ${idx === 0 ? 'text-white' : ''}`}
              style={idx !== 0 ? { color: 'var(--crm-text)' } : {}}>
              <span className="accent-dollar">$</span>{(data?.byStream?.[s.key] || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StreamChart data={data?.monthlyData || []} streams={data?.streams || []} />
        <TrendChart
          data={(data?.monthlyData || []).map((m) => ({ label: m.month, revenue: m.revenue, expenses: m.expenses }))}
          lines={[
            { key: 'revenue', name: 'Revenue', color: '#1E90FF' },
            { key: 'expenses', name: 'Expenses', color: '#ef4444' },
          ]}
          title="Revenue vs Expenses"
        />
      </div>

      <div className="glass-card-solid p-8 text-center">
        <p className="text-[15px] mb-3" style={{ color: 'var(--crm-text-secondary)' }}>Net P&L ({label})</p>
        <p className="metric-number-xl" style={{ color: isPositive ? 'var(--crm-positive)' : 'var(--crm-negative)' }}>
          {pnl < 0 ? '-' : ''}<span className="accent-dollar">$</span>{Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <div className="flex justify-center gap-10 mt-4">
          <span className="text-[15px]" style={{ color: 'var(--crm-text-muted)' }}>Rev <span className="font-semibold" style={{ color: 'var(--crm-positive)' }}>${(data?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}</span></span>
          <span className="text-[15px]" style={{ color: 'var(--crm-text-muted)' }}>Exp <span className="font-semibold" style={{ color: 'var(--crm-negative)' }}>${(data?.totalExpenses || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}</span></span>
          <span className="text-[15px]" style={{ color: 'var(--crm-text-muted)' }}>Mkt <span className="font-semibold" style={{ color: 'var(--crm-text)' }}>${(data?.marketProfits || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}</span></span>
        </div>
      </div>
    </div>
  );
}
