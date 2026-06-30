'use client';

import { useState, useEffect } from 'react';
import MetricCard from '../components/MetricCard.js';
import StreamChart from '../components/StreamChart.js';
import TrendChart from '../components/TrendChart.js';

export default function WarRoom() {
  const [data, setData] = useState(null);
  const [range, setRange] = useState('mtd');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/dashboard?range=${range}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[15px]" style={{ color: 'var(--crm-text-muted)' }}>Initializing...</span>
      </div>
    );
  }

  const totalComm = data?.commRevenue || 0;
  const pnl = data?.netPnl || 0;
  const isPositive = pnl >= 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" style={{ color: 'var(--crm-text)' }}>Shorty War Room</h1>
        <div className="flex gap-px rounded-xl overflow-hidden" style={{ border: '1px solid var(--crm-border)' }}>
          {['mtd', 'ytd'].map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className="px-5 py-2 text-[14px] font-medium transition-colors"
              style={{
                background: range === r ? 'var(--crm-accent)' : 'transparent',
                color: range === r ? '#fff' : 'var(--crm-text-muted)',
                fontWeight: range === r ? 600 : 400,
              }}>
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-hero p-8 text-center rounded-3xl">
        <p className="text-[15px] opacity-70 mb-3" style={{ color: 'var(--crm-text-secondary)' }}>Total commissions ({range.toUpperCase()})</p>
        <p className="metric-number-xl text-white">
          <span className="accent-dollar">$</span>{totalComm.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <div className="flex justify-center gap-10 mt-4">
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
        {[
          { key: 'htA', label: 'I2I Offer' },
          { key: 'htB', label: 'BNB Offer' },
          { key: 'life', label: 'Life Insurance' },
          { key: 'summit', label: 'Summit Placement' },
        ].map((s, idx) => (
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
        <StreamChart data={data?.monthlyData || []} />
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
        <p className="text-[15px] mb-3" style={{ color: 'var(--crm-text-secondary)' }}>Net P&L ({range.toUpperCase()})</p>
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
