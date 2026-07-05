import { NextResponse } from 'next/server';
import { initStore, getCache, getIncomePaySettings, expandBasePaysByStream, getStreams } from '../../../lib/store.js';

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

  const streams = getStreams();
  const streamKeys = streams.map((s) => s.key);

  const paidComm = commissions.filter((c) => c.status === 'paid' && inRange(c.date));

  function commEarned(c) { return Math.round((Number(c.amount) || 0) * (Number(c.rate) || 0) * 100) / 100; }

  const commByStream = {};
  streamKeys.forEach((k) => { commByStream[k] = 0; });
  paidComm.forEach((c) => {
    const earned = commEarned(c);
    const s = c.stream || streamKeys[0] || 'htA';
    if (commByStream[s] !== undefined) commByStream[s] += earned;
    else commByStream[s] = earned;
    console.log('[comm]', { stream: s, client: c.client_name, amount: c.amount, rate: c.rate, earned });
  });
  Object.keys(commByStream).forEach((k) => { commByStream[k] = Math.round(commByStream[k] * 100) / 100; });

  const totalCommRevenue = Math.round(Object.values(commByStream).reduce((s, v) => s + v, 0) * 100) / 100;

  let retainerTotal = 0;
  const retainerByStream = {};
  streamKeys.forEach((k) => {
    const r = ips.retainers?.[k];
    retainerByStream[k] = r?.enabled ? (Number(r.amount) || 0) * retainerMonths : 0;
    retainerTotal += retainerByStream[k];
  });
  retainerTotal = Math.round(retainerTotal * 100) / 100;

  const bpEnd = rangeEnd ? new Date(rangeEnd + 'T00:00:00') : now;
  const bpByStream = expandBasePaysByStream(ips, rangeStart, bpEnd);
  const basePayTotal = Math.round(Object.values(bpByStream).reduce((s, v) => s + (Number(v) || 0), 0) * 100) / 100;
  console.log('[dashboard] base pay by stream:', JSON.stringify(bpByStream), 'total:', basePayTotal);

  const additionalIncomeTotal = Math.round((ips.additional_income || []).reduce((s, inc) => {
    return s + (Number(inc.amount) || 0) * retainerMonths;
  }, 0) * 100) / 100;

  const byStream = {};
  streamKeys.forEach((k) => {
    byStream[k] = Math.round(((commByStream[k] || 0) + (retainerByStream[k] || 0) + (Number(bpByStream[k]) || 0)) * 100) / 100;
  });

  const renewalIncome = policies
    .filter((p) => p.status === 'active')
    .reduce((s, p) => s + (Number(p.premium) || 0) * (Number(p.renewal_rate) || 0), 0);

  const otherIncome = income_other
    .filter((i) => inRange(i.date))
    .reduce((s, i) => s + (Number(i.amount) || 0), 0);

  const marketProfits = (market_profits || [])
    .filter((p) => inRange(p.date))
    .reduce((s, p) => s + (Number(p.amount) || 0), 0);

  const totalRevenue = Math.round((totalCommRevenue + basePayTotal + retainerTotal + additionalIncomeTotal + otherIncome + marketProfits) * 100) / 100;

  console.log('[dashboard] revenue breakdown:', { totalCommRevenue, basePayTotal, retainerTotal, additionalIncomeTotal, otherIncome, marketProfits, totalRevenue });

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

  const monthlyData = buildMonthlyData(commissions, expenses, market_profits || [], streamKeys);

  return NextResponse.json({
    range,
    rangeLabel,
    rangeStart,
    rangeEnd,
    commRevenue: totalCommRevenue,
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
    streams,
    activePolicies: policies.filter((p) => p.status === 'active').length,
  });
}

function buildMonthlyData(commissions, expenses, marketProfits, streamKeys) {
  const months = {};
  function emptyMonth(m) {
    const obj = { month: m, market: 0, revenue: 0, expenses: 0 };
    streamKeys.forEach((k) => { obj[k] = 0; });
    return obj;
  }
  commissions.forEach((c) => {
    if (!c.date) return;
    const m = c.date.substring(0, 7);
    if (!months[m]) months[m] = emptyMonth(m);
    if (c.status === 'paid') {
      const earned = (Number(c.amount) || 0) * (Number(c.rate) || 0);
      if (months[m][c.stream] !== undefined) months[m][c.stream] += earned;
      months[m].revenue += earned;
    }
  });
  expenses.forEach((e) => {
    if (!e.date) return;
    const m = e.date.substring(0, 7);
    if (!months[m]) months[m] = emptyMonth(m);
    months[m].expenses += Number(e.amount) || 0;
  });
  marketProfits.forEach((p) => {
    if (!p.date) return;
    const m = p.date.substring(0, 7);
    if (!months[m]) months[m] = emptyMonth(m);
    months[m].market += Number(p.amount) || 0;
    months[m].revenue += Number(p.amount) || 0;
  });
  return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
}
