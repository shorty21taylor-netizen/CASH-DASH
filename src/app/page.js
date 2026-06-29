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
        <span className="font-mono text-[12px] uppercase tracking-[0.15em]" style={{ color: 'var(--crm-text-muted)' }}>Initializing...</span>
      </div>
    );
  }

  const totalComm = data?.commRevenue || 0;
  const pnl = data?.netPnl || 0;
  const isPositive = pnl >= 0;

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-[14px] uppercase tracking-[0.12em] font-semibold" style={{ color: 'var(--crm-text)' }}>SHORTY WAR ROOM</h1>
        <div className="flex gap-px rounded" style={{ border: '1px solid var(--crm-border)' }}>
          {['mtd', 'ytd'].map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className="px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors"
              style={{
                background: range === r ? '#1E90FF' : 'transparent',
                color: range === r ? '#fff' : 'var(--crm-text-muted)',
              }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Total Commissions — accent blue panel */}
      <div className="panel-accent p-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-70 mb-2">TOTAL COMMISSIONS ({range.toUpperCase()})</p>
        <p className="metric-number-xl text-white">
          ${totalComm.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <div className="flex justify-center gap-8 mt-3">
          <span className="font-mono text-[11px] opacity-60">PIPELINE <span className="text-white opacity-90">${(data?.pendingComm || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}</span></span>
          <span className="font-mono text-[11px] opacity-60">DEALS <span className="text-white opacity-90">{data?.totalCommissions || 0}</span></span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard title="Market Profits" value={data?.marketProfits || 0} subtitle="Trading & investments" positive={(data?.marketProfits || 0) >= 0} />
        <MetricCard title="Renewal Income" value={data?.renewalIncome || 0} subtitle={`${data?.activePolicies || 0} active policies`} positive={true} />
        <MetricCard title="Other Income" value={data?.otherIncome || 0} subtitle="Non-commission" />
        <MetricCard title="Net Worth" value={data?.netWorth || 0} positive={(data?.netWorth || 0) >= 0} />
      </div>

      {/* Stream breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { key: 'htA', label: 'I2I OFFER' },
          { key: 'htB', label: 'BNB OFFER' },
          { key: 'life', label: 'LIFE INSURANCE' },
          { key: 'summit', label: 'SUMMIT PLACEMENT' },
        ].map((s, idx) => (
          <div key={s.key} className={idx === 0 ? 'panel-accent p-5' : 'glass-card-solid p-5'}>
            <p className={`font-mono text-[10px] uppercase tracking-[0.12em] mb-2 ${idx === 0 ? 'opacity-70' : ''}`}
              style={idx !== 0 ? { color: 'var(--crm-text-muted)' } : {}}>
              {s.label}
            </p>
            <p className={`metric-number ${idx === 0 ? 'text-white' : ''}`}
              style={idx !== 0 ? { color: 'var(--crm-text)' } : {}}>
              ${(data?.byStream?.[s.key] || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <StreamChart data={data?.monthlyData || []} />
        <TrendChart
          data={(data?.monthlyData || []).map((m) => ({ label: m.month, revenue: m.revenue, expenses: m.expenses }))}
          lines={[
            { key: 'revenue', name: 'Revenue', color: '#22c55e' },
            { key: 'expenses', name: 'Expenses', color: '#ef4444' },
          ]}
          title="REVENUE VS EXPENSES"
        />
      </div>

      {/* Net P&L */}
      <div className="glass-card-solid p-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--crm-text-muted)' }}>NET P&L ({range.toUpperCase()})</p>
        <p className="metric-number-xl" style={{ color: isPositive ? 'var(--crm-positive)' : 'var(--crm-negative)' }}>
          {pnl < 0 ? '-' : ''}${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <div className="flex justify-center gap-8 mt-3">
          <span className="font-mono text-[11px]" style={{ color: 'var(--crm-text-muted)' }}>REV <span style={{ color: 'var(--crm-positive)' }}>${(data?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}</span></span>
          <span className="font-mono text-[11px]" style={{ color: 'var(--crm-text-muted)' }}>EXP <span style={{ color: 'var(--crm-negative)' }}>${(data?.totalExpenses || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}</span></span>
          <span className="font-mono text-[11px]" style={{ color: 'var(--crm-text-muted)' }}>MKT <span style={{ color: 'var(--crm-text)' }}>${(data?.marketProfits || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}</span></span>
        </div>
      </div>
    </div>
  );
}
