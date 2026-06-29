'use client';

import { useState } from 'react';
import { STREAMS, STATUSES, DEFAULT_RATES } from '../lib/constants.js';

export default function CommissionForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(initial || {
    stream: 'htA',
    client_name: '',
    amount: '',
    rate: DEFAULT_RATES.htA,
    status: 'pending',
    date: new Date().toISOString().split('T')[0],
  });

  function handleChange(e) {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    if (name === 'stream' && !initial) {
      updated.rate = DEFAULT_RATES[value] || 0.10;
    }
    setForm(updated);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...form,
      amount: parseFloat(form.amount) || 0,
      rate: parseFloat(form.rate) || 0,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-dark-300 mb-1">Stream</label>
          <select name="stream" value={form.stream} onChange={handleChange} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white">
            {Object.values(STREAMS).map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-dark-300 mb-1">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white">
            {Object.values(STATUSES).map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm text-dark-300 mb-1">Client Name</label>
        <input name="client_name" value={form.client_name} onChange={handleChange} required className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-dark-300 mb-1">Amount ($)</label>
          <input name="amount" type="number" step="0.01" value={form.amount} onChange={handleChange} required className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
        </div>
        <div>
          <label className="block text-sm text-dark-300 mb-1">Rate (%)</label>
          <input name="rate" type="number" step="0.01" value={form.rate} onChange={handleChange} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
        </div>
      </div>
      <div>
        <label className="block text-sm text-dark-300 mb-1">Date</label>
        <input name="date" type="date" value={form.date} onChange={handleChange} className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-white" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="submit" className="px-4 py-2 bg-summit-600 hover:bg-summit-700 text-white rounded-lg font-medium transition-colors">
          {initial ? 'Update' : 'Add'} Commission
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
