'use client';

import { useState, useEffect } from 'react';
import PolicyForm from '../../components/PolicyForm.js';
import { POLICY_STATUSES, RENEWAL_SCHEDULES } from '../../lib/constants.js';

export default function PoliciesPage() {
  const [policies, setPolicies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => { load(); }, []);

  function load() {
    fetch('/api/policies')
      .then((r) => r.json())
      .then((d) => setPolicies(d.policies || []));
  }

  async function handleSubmit(data) {
    await fetch('/api/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setShowForm(false);
    setEditing(null);
    load();
  }

  async function handleDelete(id) {
    await fetch('/api/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _action: 'delete', id }),
    });
    load();
  }

  const totalPremium = policies.filter((p) => p.status === 'active').reduce((s, p) => s + (p.premium || 0), 0);
  const totalRenewals = policies.filter((p) => p.status === 'active').reduce((s, p) => s + (p.premium || 0) * (p.renewal_rate || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Life Insurance Policies</h1>
          <p className="text-dark-400 text-sm">Manage policies with renewal schedules</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-summit-600 hover:bg-summit-700 text-white rounded-lg font-medium transition-colors">
          + New Policy
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
          <p className="text-dark-400 text-sm">Active Policies</p>
          <p className="text-xl font-bold text-white">{policies.filter((p) => p.status === 'active').length}</p>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
          <p className="text-dark-400 text-sm">Total Premium (Annual)</p>
          <p className="text-xl font-bold text-summit-400">${totalPremium.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4">
          <p className="text-dark-400 text-sm">Renewal Income (Annual)</p>
          <p className="text-xl font-bold text-green-400">${totalRenewals.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {(showForm || editing) && (
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{editing ? 'Edit' : 'New'} Policy</h2>
          <PolicyForm
            initial={editing}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-dark-900">
            <tr>
              <th className="text-left px-4 py-3 text-dark-300 text-sm">Client</th>
              <th className="text-left px-4 py-3 text-dark-300 text-sm">Premium</th>
              <th className="text-left px-4 py-3 text-dark-300 text-sm">Commission Rate</th>
              <th className="text-left px-4 py-3 text-dark-300 text-sm">First Year</th>
              <th className="text-left px-4 py-3 text-dark-300 text-sm">Renewal Rate</th>
              <th className="text-left px-4 py-3 text-dark-300 text-sm">Schedule</th>
              <th className="text-left px-4 py-3 text-dark-300 text-sm">Status</th>
              <th className="text-left px-4 py-3 text-dark-300 text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id} className="border-t border-dark-700">
                <td className="px-4 py-3 text-white">{p.client_name}</td>
                <td className="px-4 py-3 text-white">${(p.premium || 0).toLocaleString()}/yr</td>
                <td className="px-4 py-3 text-summit-400">{((p.commission_rate || 0) * 100).toFixed(0)}%</td>
                <td className="px-4 py-3 text-white">${(p.first_year_amount || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-dark-300">{((p.renewal_rate || 0) * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-dark-300 capitalize">{p.renewal_schedule}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded text-xs" style={{ backgroundColor: POLICY_STATUSES[p.status]?.color + '22', color: POLICY_STATUSES[p.status]?.color }}>
                    {POLICY_STATUSES[p.status]?.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setEditing(p)} className="text-summit-400 hover:text-summit-300 text-sm mr-2">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                </td>
              </tr>
            ))}
            {policies.length === 0 && (
              <tr><td colSpan="8" className="px-4 py-8 text-center text-dark-400">No policies yet. Add your first one!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
