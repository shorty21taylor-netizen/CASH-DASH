import { NextResponse } from 'next/server';
import { initStore, getCache, getIncomePaySettings, expandBasePaysByStream } from '../../../lib/store.js';

export async function GET(request) {
  await initStore();
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || 'mtd';
  const todayParam = searchParams.get('today');
  const cache = getCache();
  const { commissions, policies, expenses, income_other, accounts, market_profits } = cache;

  const ips = getIncomePaySettings();

  const now = todayParam ? new Date(todayParam + 'T00:00:00') : new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  let rangeStart, rangeEnd, retainerMonths, rangeLabel;

  if (range === 'ytd') {
    rangeStart = `${year}-01-01`;
    rangeEnd = null;
    retainerMonths = month + 1;
    rangeLabel = 'YTD';
  } else if (range === 'qtd') {
    const qStart = Math.floor(month / 3) * 3;
    rangeStart = `${year}-${String(qStart + 1).padStart(2, '0')}-01`;
    rangeEnd = null;
    retainerMonths = month - qStart + 1;
    rangeLabel = `Q${Math.floor(month / 3) + 1}`;
  } else if (range === 'month') {
    const mp = searchParams.get('month');
    if (mp) {
      rangeStart = `${mp}-01`;
      const [my, mm] = mp.split('-').map(Number);
      const lastDay = new Date(my, mm, 0).getDate();
      rangeEnd = `${mp}-${String(lastDay).padStart(2, '0')}`;
      retainerMonths = 1;
      rangeLabel = mp;
    } else {
      rangeStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      rangeEnd = null;
      retainerMonths = 1;
      rangeLabel = 'MTD';
    }
  } else if (range === 'custom') {
    rangeStart = searchParams.get('start') || `${year}-01-01`;
    rangeEnd = searchParams.get('end') || null;
    const s = new Date(rangeStart + 'T00:00:00');
    const e = rangeEnd ? new Date(rangeEnd + 'T00:00:00') : now;
    retainerMonths = Math.max(1, (e.getFullYear() - s.getFullYear()) * 12 + e.getMonth() - s.getMonth() + 1);
    rangeLabel = 'Custom';
  } else {
    rangeStart = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    rangeEnd = null;
    retainerMonths = 1;
    rangeLabel = 'MTD';
  }

  function inRange(dateStr) {
    if (!dateStr) return false;
    if (dateStr < rangeStart) return false;
    if (rangeEnd && dateStr > rangeEnd) return false;
    return true;
  }

  const paidComm = commissions.filter((c) => c.status === 'paid' && inRange(c.date));

  function commEarned(c) { return Math.round((Number(c.amount) || 0) * (Number(c.rate) || 0) * 100) / 100; }

  const commByStream = { htA: 0, htB: 0, life: 0, summit: 0 };
  paidComm.forEach((c) => {
    const earned = commEarned(c);
    const s = c.stream || 'htA';
    if (commByStream[s] !== undefined) commByStream[s] += earned;
    else commByStream.htA += earned;
    console.log('[comm]', { stream: s, client: c.client_name, amount: c.amount, rate: c.rate, earned });
  });
  Object.keys(commByStream).forEach((k) => { commByStream[k] = Math.round(commByStream[k] * 100) / 100; });

  const commRevenue = commByStream.htA + commByStream.htB + commByStream.life;
  const summitCommRevenue = commByStream.summit;

  const i2iRetainer = ips.retainers?.i2i?.enabled ? (Number(ips.retainers.i2i.amount) || 0) * retainerMonths : 0;
  const bnbRetainer = ips.retainers?.bnb?.enabled ? (Number(ips.retainers.bnb.amount) || 0) * retainerMonths : 0;
  const retainerTotal = Math.round((i2iRetainer + bnbRetainer) * 100) / 100;

  const bpEnd = rangeEnd ? new Date(rangeEnd + 'T00:00:00') : now;
  const bpByStream = expandBasePaysByStream(ips, rangeStart, bpEnd);
  const basePayTotal = Math.round(((Number(bpByStream.htA) || 0) + (Number(bpByStream.htB) || 0)
    + (Number(bpByStream.life) || 0) + (Number(bpByStream.summit) || 0) + (Number(bpByStream.general) || 0)) * 100) / 100;
  console.log('[dashboard] base pay by stream:', JSON.stringify(bpByStream), 'total:', basePayTotal);

  const additionalIncomeTotal = Math.round((ips.additional_income || []).reduce((s, inc) => {
    return s + (Number(inc.amount) || 0) * retainerMonths;
  }, 0) * 100) / 100;

  const byStream = {
    htA: Math.round((commByStream.htA + i2iRetainer + (Number(bpByStream.htA) || 0)) * 100) / 100,
    htB: Math.round((commByStream.htB + bnbRetainer + (Number(bpByStream.htB) || 0)) * 100) / 100,
    life: Math.round((commByStream.life + (Number(bpByStream.life) || 0)) * 100) / 100,
    summit: Math.round((summitCommRevenue + (Number(bpByStream.summit) || 0)) * 100) / 100,
  };

  const renewalIncome = policies
    .filter((p) => p.status === 'active')
    .reduce((s, p) => s + (Number(p.premium) || 0) * (Number(p.renewal_rate) || 0), 0);

  const otherIncome = income_other
    .filter((i) => inRange(i.date))
    .reduce((s, i) => s + (Number(i.amount) || 0), 0);

  const marketProfits = (market_profits || [])
    .filter((p) => inRange(p.date))
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const totalRevenue = Math.round((commRevenue + summitCommRevenue + basePayTotal + retainerTotal + additionalIncomeTotal + otherIncome + marketProfits) * 100) / 100;

  console.log('[dashboard] revenue breakdown:', { commRevenue, summitCommRevenue, basePayTotal, retainerTotal, additionalIncomeTotal, otherIncome, marketProfits, totalRevenue });

  const rangeExpenses = expenses.filter((e) => {
    if (e.recurring && e.frequency === 'monthly') return true;
    if (e.recurring && e.frequency === 'yearly') return retainerMonths >= 12;
    return inRange(e.date);
  });
  const totalExpenses = rangeExpenses.reduce((s, e) => {
    if (e.recurring && e.frequency === 'monthly') {
      return s + ((Number(e.amount) || 0) * retainerMonths);
    }
    return s + (Number(e.amount) || 0);
  }, 0);

  const bizExpenses = rangeExpenses.filter((e) => e.category === 'business')
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const personalExpenses = rangeExpenses.filter((e) => e.category === 'personal')
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const netPnl = Math.round((totalRevenue - totalExpenses) * 100) / 100;

  const realAccounts = accounts.filter((a) => a.id !== 'app-settings' && a.id !== 'income_pay_settings');
  const netWorth = realAccounts.reduce((s, a) => {
    return s + (a.type === 'debt' ? -(Number(a.balance) || 0) : (Number(a.balance) || 0));
  }, 0);

  const pendingComm = commissions
    .filter((c) => c.status !== 'paid')
    .reduce((s, c) => s + (Number(c.amount) || 0) * (Number(c.rate) || 0), 0);

  const monthlyData = buildMonthlyData(commissions, expenses, market_profits || []);

  return NextResponse.json({
    range,
    rangeLabel,
    rangeStart,
    rangeEnd,
    commRevenue,
    summitCommRevenue,
    totalRevenue,
    totalExpenses,
    netPnl,
    byStream,
    renewalIncome,
    retainerIncome: retainerTotal,
    basePayIncome: basePayTotal,
    basePayGeneral: Number(bpByStream.general) || 0,
    additionalIncome: additionalIncomeTotal,
    otherIncome,
    marketProfits,
    pendingComm,
    bizExpenses,
    personalExpenses,
    netWorth,
    monthlyData,
    totalCommissions: commissions.length,
    activePolicies: policies.filter((p) => p.status === 'active').length,
  });
}

function buildMonthlyData(commissions, expenses, marketProfits) {
  const months = {};
  commissions.forEach((c) => {
    if (!c.date) return;
    const m = c.date.substring(0, 7);
    if (!months[m]) months[m] = { month: m, htA: 0, htB: 0, life: 0, summit: 0, market: 0, revenue: 0, expenses: 0 };
    if (c.status === 'paid') {
      const earned = (Number(c.amount) || 0) * (Number(c.rate) || 0);
      months[m][c.stream] += earned;
      months[m].revenue += earned;
    }
  });
  expenses.forEach((e) => {
    if (!e.date) return;
    const m = e.date.substring(0, 7);
    if (!months[m]) months[m] = { month: m, htA: 0, htB: 0, life: 0, summit: 0, market: 0, revenue: 0, expenses: 0 };
    months[m].expenses += Number(e.amount) || 0;
  });
  marketProfits.forEach((p) => {
    if (!p.date) return;
    const m = p.date.substring(0, 7);
    if (!months[m]) months[m] = { month: m, htA: 0, htB: 0, life: 0, summit: 0, market: 0, revenue: 0, expenses: 0 };
    months[m].market += Number(p.amount) || 0;
    months[m].revenue += Number(p.amount) || 0;
  });
  return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
}
