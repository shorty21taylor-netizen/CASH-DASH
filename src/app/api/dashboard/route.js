import { NextResponse } from 'next/server';
import { initStore, getCache, getIncomePaySettings, expandBasePaysByStream } from '../../../lib/store.js';

export async function GET(request) {
  await initStore();
  const { searchParams } = new URL(request.url);
  const range = searchParams.get('range') || 'mtd';
  const cache = getCache();
  const { commissions, policies, expenses, income_other, accounts, market_profits } = cache;

  const ips = getIncomePaySettings();
  console.log('[dashboard] income_pay_settings loaded, base_pays:', JSON.stringify(ips.base_pays));

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const rangeStart = range === 'ytd'
    ? `${year}-01-01`
    : `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const retainerMonths = range === 'ytd' ? month + 1 : 1;

  function inRange(dateStr) {
    if (!dateStr) return false;
    return dateStr >= rangeStart;
  }

  const paidComm = commissions.filter((c) => c.status === 'paid' && inRange(c.date));
  const commRevenue = paidComm.reduce((s, c) => s + (Number(c.amount) || 0) * (Number(c.rate) || 0), 0);

  const i2iRetainer = ips.retainers?.i2i?.enabled ? (Number(ips.retainers.i2i.amount) || 0) * retainerMonths : 0;
  const bnbRetainer = ips.retainers?.bnb?.enabled ? (Number(ips.retainers.bnb.amount) || 0) * retainerMonths : 0;
  const retainerTotal = i2iRetainer + bnbRetainer;

  const bpByStream = expandBasePaysByStream(ips, rangeStart, now);
  const basePayTotal = (Number(bpByStream.htA) || 0) + (Number(bpByStream.htB) || 0)
    + (Number(bpByStream.life) || 0) + (Number(bpByStream.summit) || 0) + (Number(bpByStream.general) || 0);
  console.log('[dashboard] base pay by stream:', JSON.stringify(bpByStream), 'total:', basePayTotal);

  function calcFreqAmount(amount, freq, months) {
    const amt = Number(amount) || 0;
    const perMonth = freq === 'weekly' ? amt * 52 / 12
      : freq === 'bi-weekly' ? amt * 26 / 12
      : freq === 'semi-monthly' ? amt * 2
      : freq === 'monthly' ? amt
      : freq === 'annually' ? amt / 12
      : freq === 'yearly' ? amt / 12
      : amt;
    return perMonth * months;
  }

  const additionalIncomeTotal = (ips.additional_income || []).reduce((s, inc) => {
    return s + calcFreqAmount(inc.amount, inc.frequency || 'monthly', retainerMonths);
  }, 0);

  const byStream = {
    htA: paidComm.filter((c) => c.stream === 'htA').reduce((s, c) => s + (Number(c.amount) || 0) * (Number(c.rate) || 0), 0)
      + i2iRetainer + (Number(bpByStream.htA) || 0),
    htB: paidComm.filter((c) => c.stream === 'htB').reduce((s, c) => s + (Number(c.amount) || 0) * (Number(c.rate) || 0), 0)
      + bnbRetainer + (Number(bpByStream.htB) || 0),
    life: paidComm.filter((c) => c.stream === 'life').reduce((s, c) => s + (Number(c.amount) || 0) * (Number(c.rate) || 0), 0)
      + (Number(bpByStream.life) || 0),
    summit: paidComm.filter((c) => c.stream === 'summit').reduce((s, c) => s + (Number(c.amount) || 0) * (Number(c.rate) || 0), 0)
      + (Number(bpByStream.summit) || 0),
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

  const totalRevenue = commRevenue + basePayTotal + retainerTotal + additionalIncomeTotal + otherIncome + marketProfits;

  const rangeExpenses = expenses.filter((e) => {
    if (e.recurring && e.frequency === 'monthly') return true;
    if (e.recurring && e.frequency === 'yearly') return range === 'ytd';
    return inRange(e.date);
  });
  const totalExpenses = rangeExpenses.reduce((s, e) => {
    if (e.recurring && e.frequency === 'monthly') {
      const months = range === 'ytd' ? month + 1 : 1;
      return s + ((Number(e.amount) || 0) * months);
    }
    return s + (Number(e.amount) || 0);
  }, 0);

  const bizExpenses = rangeExpenses.filter((e) => e.category === 'business')
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const personalExpenses = rangeExpenses.filter((e) => e.category === 'personal')
    .reduce((s, e) => s + (Number(e.amount) || 0), 0);

  const netPnl = totalRevenue - totalExpenses;

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
    commRevenue,
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
