'use client';

import { useState, useEffect } from 'react';
import PnLCard from '../components/PnLCard.js';
import StreamChart from '../components/StreamChart.js';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-dark-400 text-lg">Loading Summit Command Center...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-4xl">⛰</span>
        <div>
          <h1 className="text-2xl font-bold text-white">Summit Command Center</h1>
          <p className="text-dark-400 text-sm">Commission P&L Dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PnLCard
          title="Total Earned (Paid)"
          value={data?.totalRevenue || 0}
          subtitle={`${data?.totalCommissions || 0} commissions`}
          trend="up"
        />
        <PnLCard
          title="Pipeline (Pending)"
          value={data?.pendingRevenue || 0}
          subtitle="Awaiting approval/payment"
          trend="neutral"
        />
        <PnLCard
          title="Renewal Income (Annual)"
          value={data?.renewalIncome || 0}
          subtitle={`${data?.activePolicies || 0} active policies`}
          trend="up"
        />
        <PnLCard
          title="Total P&L"
          value={(data?.totalRevenue || 0) + (data?.renewalIncome || 0)}
          subtitle="Earned + Renewals"
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-3">High Ticket A</h3>
          <p className="text-2xl font-bold text-summit-400">${(data?.byStream?.htA || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-dark-400 text-sm mt-1">Paid commissions</p>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-3">High Ticket B</h3>
          <p className="text-2xl font-bold text-summit-500">${(data?.byStream?.htB || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-dark-400 text-sm mt-1">Paid commissions</p>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-3">Life Insurance</h3>
          <p className="text-2xl font-bold text-summit-300">${(data?.byStream?.life || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
          <p className="text-dark-400 text-sm mt-1">Paid commissions</p>
        </div>
      </div>

      <StreamChart data={data?.monthlyData || []} />
    </div>
  );
}
