'use client';

import { useState, useEffect } from 'react';
import CommissionForm from '../../../components/CommissionForm.js';
import { STATUSES, DEFAULT_RATES } from '../../../lib/constants.js';

export default function LifeInsurancePage() {
  const [commissions, setCommissions] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [totals, setTotals] = useState({ earned: 0, pending: 0, renewals: 0, count: 0 });

  useEffect(() => { load(); }, []);

  function load() {
    Promise.all([
      fetch('/api/commissions?stream=life').then((r) => r.json()),
      fetch('/api/policies').then((r) => r.json()),
    ]).then(([commData, polData]) => {
      const list = commData.commissions || [];
      const pols = polData.policies || [];
      setCommissions(list);
      setPolicies(pols);
      setTotals({
        earned: list.filter((c) => c.status === 'paid').reduce((s, c) => s + c.amount * c.rate, 0),
        pending: list.filter((c) => c.status !== 'paid').reduce((s, c) => s + c.amount * c.rate, 0),
        renewals: pols.filter((p) => p.status === 'active').reduce((s, p) => s + p.premium * p.renewal_rate, 0),
        count: list.length,
      });
    });
  }

  async function handleSubmit(data) {
    await fetch('/api/commissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, stream: 'life' }),
    });
    setShowForm(false);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Life Insurance</h1>
          <p className="text-dark-400 text-sm">Configurable: flat %, policy-based, renewals/residuals</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-summit-600 hover:bg-summit-700 text-white rounded-lg font-medium transition-colors">
          + Add Commission
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
          <p className="text-dark-400 text-sm">Earned</p>
          <p className="text-xl font-bold text-green-400">${totals.earned.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
          <p className="text-dark-400 text-sm">Pending</p>
          <p className="text-xl font-bold text-yellow-400">${totals.pending.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
          <p className="text-dark-400 text-sm">Annual Renewals</p>
          <p className="text-xl font-bold text-summit-400">${totals.renewals.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
          <p className="text-dark-400 text-sm">Active Policies</p>
          <p className="text-xl font-bold text-white">{policies.filter((p) => p.status === 'active').length}</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <CommissionForm
            initial={{ stream: 'life', client_name: '', amount: '', rate: DEFAULT_RATES.life, status: 'pending', date: new Date().toISOString().split('T')[0] }}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <h3 className="px-4 py-3 font-semibold text-white border-b border-dark-700">Commissions</h3>
        <table className="w-full">
          <thead className="bg-dark-900">
            <tr>
              <th className="text-left px-4 py-3 text-dark-300 text-sm">Client</th>
              <th className="text-left px-4 py-3 text-dark-300 text-sm">Amount</th>
              <th className="text-left px-4 py-3 text-dark-300 text-sm">Commission</th>
              <th className="text-left px-4 py-3 text-dark-300 text-sm">Status</th>
              <th className="text-left px-4 py-3 text-dark-300 text-sm">Date</th>
            </tr>
          </thead>
          <tbody>
            {commissions.map((c) => (
              <tr key={c.id} className="border-t border-dark-700">
                <td className="px-4 py-3 text-white">{c.client_name}</td>
                <td className="px-4 py-3 text-white">${(c.amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-summit-400">${((c.amount || 0) * (c.rate || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: STATUSES[c.status]?.color + '22', color: STATUSES[c.status]?.color }}>
                    {STATUSES[c.status]?.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-dark-300">{c.date}</td>
              </tr>
            ))}
            {commissions.length === 0 && (
              <tr><td colSpan="5" className="px-4 py-8 text-center text-dark-400">No life insurance commissions yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
