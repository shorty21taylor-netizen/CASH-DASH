import { NextResponse } from 'next/server';
import { initStore, getCache } from '../../../lib/store.js';

export async function GET() {
  await initStore();
  const { commissions, policies } = getCache();

  const totalRevenue = commissions
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + (c.amount * c.rate), 0);

  const pendingRevenue = commissions
    .filter((c) => c.status === 'pending' || c.status === 'approved')
    .reduce((sum, c) => sum + (c.amount * c.rate), 0);

  const byStream = {
    htA: commissions.filter((c) => c.stream === 'htA' && c.status === 'paid').reduce((s, c) => s + (c.amount * c.rate), 0),
    htB: commissions.filter((c) => c.stream === 'htB' && c.status === 'paid').reduce((s, c) => s + (c.amount * c.rate), 0),
    life: commissions.filter((c) => c.stream === 'life' && c.status === 'paid').reduce((s, c) => s + (c.amount * c.rate), 0),
  };

  const renewalIncome = policies
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => sum + (p.premium * p.renewal_rate), 0);

  const monthlyData = buildMonthlyData(commissions);

  return NextResponse.json({
    totalRevenue,
    pendingRevenue,
    byStream,
    renewalIncome,
    monthlyData,
    totalCommissions: commissions.length,
    activePolicies: policies.filter((p) => p.status === 'active').length,
  });
}

function buildMonthlyData(commissions) {
  const months = {};
  commissions.forEach((c) => {
    if (!c.date) return;
    const month = c.date.substring(0, 7);
    if (!months[month]) months[month] = { month, htA: 0, htB: 0, life: 0 };
    if (c.status === 'paid') {
      months[month][c.stream] += c.amount * c.rate;
    }
  });
  return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
}
