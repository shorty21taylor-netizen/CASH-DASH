'use client';

import { useState } from 'react';
import { POLICY_STATUSES, RENEWAL_SCHEDULES } from '../lib/constants.js';

export default function PolicyForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || {
    client_name: '',
    premium: '',
    commission_rate: 0.50,
    first_year_amount: '',
    renewal_rate: 0.05,
    renewal_schedule: 'annual',
    status: 'active',
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      premium: parseFloat(form.premium) || 0,
      commission_rate: parseFloat(form.commission_rate) || 0,
      first_year_amount: parseFloat(form.first_year_amount) || 0,
      renewal_rate: parseFloat(form.renewal_rate) || 0,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-dark-300 mb-1">Client Name</label>
        <input name="client_name" value={form.client_name} onChange={handleChange} required className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-dark-300 mb-1">Annual Premium ($)</label>
          <input name="premium" type="number" step="0.01" value={form.premium} onChange={handleChange} required className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
        </div>
        <div>
          <label className="block text-sm text-dark-300 mb-1">Commission Rate (%)</label>
          <input name="commission_rate" type="number" step="0.01" value={form.commission_rate} onChange={handleChange} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-dark-300 mb-1">First Year Amount ($)</label>
          <input name="first_year_amount" type="number" step="0.01" value={form.first_year_amount} onChange={handleChange} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
        </div>
        <div>
          <label className="block text-sm text-dark-300 mb-1">Renewal Rate (%)</label>
          <input name="renewal_rate" type="number" step="0.01" value={form.renewal_rate} onChange={handleChange} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-dark-300 mb-1">Renewal Schedule</label>
          <select name="renewal_schedule" value={form.renewal_schedule} onChange={handleChange} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white">
            {RENEWAL_SCHEDULES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-dark-300 mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white">
            {Object.values(POLICY_STATUSES).map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="px-4 py-2 bg-summit-600 hover:bg-summit-700 text-white rounded-lg font-medium transition-colors">
          {initial ? 'Update' : 'Add'} Policy
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg font-medium transition-colors">
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
