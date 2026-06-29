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
        <div className="text-neutral-500 animate-in">Initializing War Room...</div>
      </div>
    );
  }

  const totalComm = data?.commRevenue || 0;
  const pnl = data?.netPnl || 0;
  const isPositive = pnl >= 0;

  return (
    <div className="space-y-6 max-w-7xl animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SHORTY WAR ROOM</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--crm-text-muted)' }}>Financial command overview</p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--crm-surface)', border: '1px solid var(--crm-border)' }}>
          {['mtd', 'ytd'].map((r) => (
            <button key={r} onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${range === r ? 'bg-red-600 text-white glow-red' : 'text-neutral-500 hover:text-white'}`}>
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Total Commissions Hero */}
      <div className="pnl-hero-positive rounded-2xl p-8 text-center war-room-scan">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-3">Total Commissions Earned ({range.toUpperCase()})</p>
        <p className="metric-number-xl text-green-400">
          ${totalComm.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <div className="flex justify-center gap-8 mt-4 text-sm">
          <span className="text-neutral-500">Pipeline: <span className="text-yellow-400 font-semibold">${(data?.pendingComm || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></span>
          <span className="text-neutral-500">Deals: <span className="text-white font-semibold">{data?.totalCommissions || 0}</span></span>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Market Profits" value={data?.marketProfits || 0} subtitle="Trading & investments" positive={(data?.marketProfits || 0) >= 0} />
        <MetricCard title="Renewal Income" value={data?.renewalIncome || 0} subtitle={`${data?.activePolicies || 0} active policies`} positive={true} />
        <MetricCard title="Other Income" value={data?.otherIncome || 0} subtitle="Non-commission revenue" />
        <MetricCard title="Net Worth" value={data?.netWorth || 0} positive={(data?.netWorth || 0) >= 0} />
      </div>

      {/* Stream breakdown */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { key: 'htA', label: 'I2I Offer', color: '#dc2626' },
          { key: 'htB', label: 'BNB Offer', color: '#f97316' },
          { key: 'life', label: 'Life Insurance', color: '#eab308' },
          { key: 'summit', label: 'Summit Placement', color: '#8b5cf6' },
        ].map((s) => (
          <div key={s.key} className="glass-card-solid p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full status-pulse" style={{ backgroundColor: s.color, boxShadow: `0 0 8px ${s.color}40` }} />
              <span className="text-xs font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--crm-text-muted)' }}>{s.label}</span>
            </div>
            <p className="metric-number text-white">
              ${(data?.byStream?.[s.key] || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StreamChart data={data?.monthlyData || []} />
        <TrendChart
          data={(data?.monthlyData || []).map((m) => ({ label: m.month, revenue: m.revenue, expenses: m.expenses }))}
          lines={[
            { key: 'revenue', name: 'Revenue', color: '#22c55e' },
            { key: 'expenses', name: 'Expenses', color: '#ef4444' },
          ]}
          title="Revenue vs Expenses"
        />
      </div>

      {/* Net P&L Hero */}
      <div className={`rounded-2xl p-8 text-center war-room-scan ${isPositive ? 'pnl-hero-positive' : 'pnl-hero-negative'}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-3">Net P&L ({range.toUpperCase()})</p>
        <p className={`metric-number-xl ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {pnl < 0 ? '-' : ''}${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <div className="flex justify-center gap-8 mt-4 text-sm">
          <span className="text-neutral-500">Revenue: <span className="text-green-400 font-semibold">${(data?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></span>
          <span className="text-neutral-500">Expenses: <span className="text-red-400 font-semibold">${(data?.totalExpenses || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></span>
          <span className="text-neutral-500">Market: <span className="text-green-400 font-semibold">${(data?.marketProfits || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span></span>
        </div>
      </div>
    </div>
  );
}
