'use client';

import { useState, useEffect } from 'react';
import { STREAMS, PAY_FREQUENCIES, REP_STATUSES } from '../../lib/constants.js';

const TABS = [
  { key: 'income', label: 'Income & Pay' },
  { key: 'commissions', label: 'Commissions' },
  { key: 'reps', label: 'Reps & Team' },
  { key: 'profile', label: 'Profile & Business' },
  { key: 'tax', label: 'Tax & Planning' },
  { key: 'display', label: 'Display & Data' },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [incomePay, setIncomePay] = useState(null);
  const [reps, setReps] = useState([]);
  const [tab, setTab] = useState('income');
  const [saved, setSaved] = useState(false);
  const [showRepForm, setShowRepForm] = useState(false);
  const [editingRep, setEditingRep] = useState(null);
  const [repForm, setRepForm] = useState(blankRep());

  function blankRep() {
    return { name: '', email: '', phone: '', role: '', status: 'active', streams: [], base_pay: '', pay_frequency: 'bi-weekly', commission_split: '', override_rates: {}, start_date: '', notes: '' };
  }

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((d) => {
      const s = d.settings;
      if (!s.retainers) s.retainers = {};
      if (!s.retainers.htA) s.retainers.htA = { enabled: false, amount: 0 };
      if (!s.retainers.htB) s.retainers.htB = { enabled: false, amount: 0 };
      setSettings(s);
    });
    fetch('/api/income-pay-settings').then((r) => r.json()).then((d) => {
      setIncomePay(d.settings);
    });
    fetch('/api/reps').then((r) => r.json()).then((d) => setReps(d.reps || []));
  }, []);

  async function handleSave() {
    await Promise.all([
      fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      }),
      fetch('/api/income-pay-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incomePay),
      }),
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function update(path, value) {
    const keys = path.split('.');
    const updated = { ...settings };
    let obj = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      obj[keys[i]] = { ...obj[keys[i]] };
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    setSettings(updated);
  }

  async function saveRep(e) {
    e.preventDefault();
    await fetch('/api/reps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingRep ? { ...repForm, id: editingRep } : repForm),
    });
    setShowRepForm(false);
    setEditingRep(null);
    setRepForm(blankRep());
    fetch('/api/reps').then((r) => r.json()).then((d) => setReps(d.reps || []));
  }

  async function deleteRep(id) {
    await fetch('/api/reps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ _action: 'delete', id }),
    });
    fetch('/api/reps').then((r) => r.json()).then((d) => setReps(d.reps || []));
  }

  function ipUpdate(path, value) {
    setIncomePay((prev) => {
      const keys = path.split('.');
      const updated = { ...prev };
      let obj = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...(obj[keys[i]] || {}) };
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  }

  function addFixedIncome() {
    setIncomePay((prev) => ({
      ...prev,
      additional_income: [...(prev.additional_income || []), { label: '', amount: 0, frequency: 'monthly' }],
    }));
  }

  function updateFixedIncome(idx, field, value) {
    setIncomePay((prev) => {
      const list = [...(prev.additional_income || [])];
      list[idx] = { ...list[idx], [field]: field === 'amount' ? parseFloat(value) || 0 : value };
      return { ...prev, additional_income: list };
    });
  }

  function removeFixedIncome(idx) {
    setIncomePay((prev) => {
      const list = [...(prev.additional_income || [])];
      list.splice(idx, 1);
      return { ...prev, additional_income: list };
    });
  }

  function addBonusTier() {
    setIncomePay((prev) => ({
      ...prev,
      bonus_tiers: {
        ...(prev.bonus_tiers || {}),
        tiers: [...(prev.bonus_tiers?.tiers || []), { threshold: 0, bonus: 0, label: '' }],
      },
    }));
  }

  function updateBonusTier(idx, field, value) {
    setIncomePay((prev) => {
      const tiers = [...(prev.bonus_tiers?.tiers || [])];
      tiers[idx] = { ...tiers[idx], [field]: field === 'label' ? value : parseFloat(value) || 0 };
      return { ...prev, bonus_tiers: { ...(prev.bonus_tiers || {}), tiers } };
    });
  }

  function removeBonusTier(idx) {
    setIncomePay((prev) => {
      const tiers = [...(prev.bonus_tiers?.tiers || [])];
      tiers.splice(idx, 1);
      return { ...prev, bonus_tiers: { ...(prev.bonus_tiers || {}), tiers } };
    });
  }

  function toggleRepStream(stream) {
    const streams = [...(repForm.streams || [])];
    const idx = streams.indexOf(stream);
    if (idx >= 0) streams.splice(idx, 1);
    else streams.push(stream);
    setRepForm({ ...repForm, streams });
  }

  if (!settings || !incomePay) return <div className="text-sm p-8" style={{ color: 'var(--crm-text-muted)' }}>Loading settings...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Settings</h1>
          <p className="text-[14px] mt-1" style={{ color: 'var(--crm-text-muted)' }}>Configure your command center</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-[13px]" style={{ color: 'var(--crm-positive)' }}>Saved!</span>}
          <button onClick={handleSave} className="px-6 py-2 rounded-xl text-[13px] font-medium" style={{ background: 'var(--crm-accent)', color: '#fff' }}>
            Save All Settings
          </button>
        </div>
      </div>

      <div className="flex gap-px rounded-xl overflow-x-auto" style={{ background: 'var(--crm-surface)', border: '1px solid var(--crm-border)' }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="px-4 py-2 text-[13px] whitespace-nowrap transition-colors"
            style={{
              background: tab === t.key ? 'var(--crm-accent)' : 'transparent',
              color: tab === t.key ? '#fff' : 'var(--crm-text-muted)',
              fontWeight: tab === t.key ? 600 : 400,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'income' && (
        <div className="space-y-5">
          <Section title="Base Pay / Salary">
            <div className="flex items-center gap-3 mb-4">
              <Toggle checked={!!incomePay.base_pay?.enabled} onChange={(v) => {
                setIncomePay((prev) => ({ ...prev, base_pay: { ...(prev.base_pay || {}), enabled: v } }));
              }} />
              <span className="text-[13px]" style={{ color: 'var(--crm-text-secondary)' }}>I receive a base pay / salary</span>
            </div>
            {incomePay.base_pay?.enabled && (
              <div className="grid grid-cols-3 gap-4">
                <Field label="Base pay amount ($)">
                  <input type="number" step="0.01" value={incomePay.base_pay?.amount || ''} onChange={(e) => ipUpdate('base_pay.amount', parseFloat(e.target.value) || 0)}
                    className="input-field" placeholder="0.00" />
                </Field>
                <Field label="Pay frequency">
                  <select value={incomePay.base_pay?.frequency || 'bi-weekly'} onChange={(e) => ipUpdate('base_pay.frequency', e.target.value)} className="input-field">
                    {PAY_FREQUENCIES.map((f) => <option key={f} value={f}>{f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')}</option>)}
                  </select>
                </Field>
                <Field label="Start date">
                  <input type="date" value={incomePay.base_pay?.start_date || ''} onChange={(e) => ipUpdate('base_pay.start_date', e.target.value)} className="input-field" />
                </Field>
              </div>
            )}
          </Section>

          <Section title="Monthly Retainers" subtitle="Recurring monthly retainer income for high-ticket offers">
            <div className="space-y-4">
              <RetainerRow
                label="I2I Offer"
                desc="Monthly retainer added to I2I stream revenue"
                enabled={!!incomePay.retainers?.i2i?.enabled}
                amount={incomePay.retainers?.i2i?.amount || ''}
                onToggle={(v) => setIncomePay((prev) => ({
                  ...prev,
                  retainers: { ...prev.retainers, i2i: { ...(prev.retainers?.i2i || {}), enabled: v } },
                }))}
                onAmount={(v) => setIncomePay((prev) => ({
                  ...prev,
                  retainers: { ...prev.retainers, i2i: { ...(prev.retainers?.i2i || {}), amount: v } },
                }))}
              />
              <RetainerRow
                label="BNB Offer"
                desc="Monthly retainer added to BNB stream revenue"
                enabled={!!incomePay.retainers?.bnb?.enabled}
                amount={incomePay.retainers?.bnb?.amount || ''}
                onToggle={(v) => setIncomePay((prev) => ({
                  ...prev,
                  retainers: { ...prev.retainers, bnb: { ...(prev.retainers?.bnb || {}), enabled: v } },
                }))}
                onAmount={(v) => setIncomePay((prev) => ({
                  ...prev,
                  retainers: { ...prev.retainers, bnb: { ...(prev.retainers?.bnb || {}), amount: v } },
                }))}
              />
            </div>
          </Section>

          <Section title="Additional Fixed Income" subtitle="Retainers, side contracts, recurring payments outside of commissions">
            <div className="space-y-3">
              {(incomePay.additional_income || []).map((inc, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5">
                    {i === 0 && <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Source / label</label>}
                    <input value={inc.label} onChange={(e) => updateFixedIncome(i, 'label', e.target.value)} placeholder="e.g. Retainer, Consulting" className="input-field" />
                  </div>
                  <div className="col-span-3">
                    {i === 0 && <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Amount ($)</label>}
                    <input type="number" step="0.01" value={inc.amount || ''} onChange={(e) => updateFixedIncome(i, 'amount', e.target.value)} className="input-field" />
                  </div>
                  <div className="col-span-3">
                    {i === 0 && <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Frequency</label>}
                    <select value={inc.frequency} onChange={(e) => updateFixedIncome(i, 'frequency', e.target.value)} className="input-field">
                      {PAY_FREQUENCIES.map((f) => <option key={f} value={f}>{f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button onClick={() => removeFixedIncome(i)} className="text-[16px]" style={{ color: 'var(--crm-negative)' }}>×</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addFixedIncome} className="mt-3 text-[13px]" style={{ color: 'var(--crm-accent)' }}>+ Add income source</button>
          </Section>

          <Section title="Bonus Tiers" subtitle="Performance bonuses based on revenue or deal count">
            <div className="flex items-center gap-3 mb-4">
              <Toggle checked={!!incomePay.bonus_tiers?.enabled} onChange={(v) => {
                setIncomePay((prev) => ({ ...prev, bonus_tiers: { ...(prev.bonus_tiers || {}), enabled: v } }));
              }} />
              <span className="text-[13px]" style={{ color: 'var(--crm-text-secondary)' }}>Enable bonus structure</span>
            </div>
            {incomePay.bonus_tiers?.enabled && (
              <>
                <div className="mb-4">
                  <Field label="Threshold type">
                    <select value={incomePay.bonus_tiers?.threshold_type || 'revenue'} onChange={(e) => ipUpdate('bonus_tiers.threshold_type', e.target.value)} className="input-field" style={{ width: '12rem' }}>
                      <option value="revenue">Revenue ($)</option>
                      <option value="deals">Deal Count</option>
                    </select>
                  </Field>
                </div>
                <div className="space-y-2">
                  {(incomePay.bonus_tiers?.tiers || []).map((tier, i) => (
                    <div key={i} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-4">
                        {i === 0 && <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Label</label>}
                        <input value={tier.label} onChange={(e) => updateBonusTier(i, 'label', e.target.value)} placeholder="e.g. Gold Tier" className="input-field" />
                      </div>
                      <div className="col-span-3">
                        {i === 0 && <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Threshold</label>}
                        <input type="number" value={tier.threshold || ''} onChange={(e) => updateBonusTier(i, 'threshold', e.target.value)} className="input-field" />
                      </div>
                      <div className="col-span-4">
                        {i === 0 && <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Bonus ($)</label>}
                        <input type="number" step="0.01" value={tier.bonus || ''} onChange={(e) => updateBonusTier(i, 'bonus', e.target.value)} className="input-field" />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button onClick={() => removeBonusTier(i)} className="text-[16px]" style={{ color: 'var(--crm-negative)' }}>×</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={addBonusTier} className="mt-3 text-[13px]" style={{ color: 'var(--crm-accent)' }}>+ Add tier</button>
              </>
            )}
          </Section>
        </div>
      )}

      {tab === 'commissions' && (
        <div className="space-y-5">
          <Section title="Default Commission Rates" subtitle="Per-stream rates applied to new commissions">
            <div className="space-y-3">
              {Object.values(STREAMS).map((s) => (
                <div key={s.key} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--crm-surface2)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-[13px]">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="number" step="0.01" value={settings.rates?.[s.key] ?? ''} onChange={(e) => {
                      const rates = { ...settings.rates, [s.key]: parseFloat(e.target.value) || 0 };
                      update('rates', rates);
                    }} className="w-24 input-field text-right" />
                    <span className="text-[12px]" style={{ color: 'var(--crm-text-muted)', width: '3rem' }}>({((settings.rates?.[s.key] || 0) * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Rate Overrides">
            <div className="flex items-center gap-3">
              <Toggle checked={settings.allow_rate_overrides} onChange={(v) => update('allow_rate_overrides', v)} />
              <span className="text-[13px]" style={{ color: 'var(--crm-text-secondary)' }}>Allow per-deal rate overrides when entering commissions</span>
            </div>
          </Section>
        </div>
      )}

      {tab === 'reps' && (
        <div className="space-y-5">
          <Section title="Reps Under Management" subtitle="Manage your team members, their pay, and commission splits">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-[13px]" style={{ color: 'var(--crm-text-secondary)' }}>{reps.filter((r) => r.status === 'active').length} active reps</span>
                <span className="text-[13px]" style={{ color: 'var(--crm-text-muted)' }}>·</span>
                <span className="text-[13px]" style={{ color: 'var(--crm-text-secondary)' }}>{reps.length} total</span>
              </div>
              <button onClick={() => { setRepForm(blankRep()); setEditingRep(null); setShowRepForm(true); }}
                className="px-4 py-2 rounded-xl text-[13px] font-medium" style={{ background: 'var(--crm-accent)', color: '#fff' }}>
                + Add Rep
              </button>
            </div>

            {showRepForm && (
              <form onSubmit={saveRep} className="p-5 rounded-xl space-y-4 mb-4" style={{ background: 'var(--crm-surface2)', border: '1px solid var(--crm-border)' }}>
                <h3 className="text-sm font-semibold">{editingRep ? 'Edit' : 'Add'} Rep</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Full name">
                    <input value={repForm.name} onChange={(e) => setRepForm({ ...repForm, name: e.target.value })} required className="input-field" />
                  </Field>
                  <Field label="Email">
                    <input type="email" value={repForm.email} onChange={(e) => setRepForm({ ...repForm, email: e.target.value })} className="input-field" />
                  </Field>
                  <Field label="Phone">
                    <input value={repForm.phone} onChange={(e) => setRepForm({ ...repForm, phone: e.target.value })} className="input-field" />
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Role / title">
                    <input value={repForm.role} onChange={(e) => setRepForm({ ...repForm, role: e.target.value })} placeholder="e.g. Sales Rep, Closer" className="input-field" />
                  </Field>
                  <Field label="Status">
                    <select value={repForm.status} onChange={(e) => setRepForm({ ...repForm, status: e.target.value })} className="input-field">
                      {REP_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </Field>
                  <Field label="Start date">
                    <input type="date" value={repForm.start_date} onChange={(e) => setRepForm({ ...repForm, start_date: e.target.value })} className="input-field" />
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Base pay ($)">
                    <input type="number" step="0.01" value={repForm.base_pay} onChange={(e) => setRepForm({ ...repForm, base_pay: e.target.value })} placeholder="0.00" className="input-field" />
                  </Field>
                  <Field label="Pay frequency">
                    <select value={repForm.pay_frequency} onChange={(e) => setRepForm({ ...repForm, pay_frequency: e.target.value })} className="input-field">
                      {PAY_FREQUENCIES.map((f) => <option key={f} value={f}>{f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')}</option>)}
                    </select>
                  </Field>
                  <Field label="Commission split (%)">
                    <input type="number" step="0.01" value={repForm.commission_split} onChange={(e) => setRepForm({ ...repForm, commission_split: e.target.value })} placeholder="e.g. 0.50 = 50%" className="input-field" />
                  </Field>
                </div>
                <div>
                  <label className="block text-[13px] mb-2" style={{ color: 'var(--crm-text-secondary)' }}>Assigned streams</label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.values(STREAMS).map((s) => (
                      <button key={s.key} type="button" onClick={() => toggleRepStream(s.key)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] transition-colors"
                        style={{
                          background: (repForm.streams || []).includes(s.key) ? 'rgba(30,144,255,0.12)' : 'var(--crm-surface)',
                          color: (repForm.streams || []).includes(s.key) ? 'var(--crm-accent)' : 'var(--crm-text-muted)',
                          border: (repForm.streams || []).includes(s.key) ? '1px solid rgba(30,144,255,0.35)' : '1px solid var(--crm-border)',
                        }}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] mb-2" style={{ color: 'var(--crm-text-secondary)' }}>Rate overrides (leave blank to use defaults)</label>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.values(STREAMS).map((s) => (
                      <div key={s.key}>
                        <label className="block text-[12px] mb-1" style={{ color: 'var(--crm-text-muted)' }}>{s.label}</label>
                        <input type="number" step="0.01"
                          value={repForm.override_rates?.[s.key] ?? ''}
                          onChange={(e) => {
                            const overrides = { ...repForm.override_rates };
                            if (e.target.value === '') delete overrides[s.key];
                            else overrides[s.key] = parseFloat(e.target.value) || 0;
                            setRepForm({ ...repForm, override_rates: overrides });
                          }}
                          placeholder={`${((settings.rates?.[s.key] || 0) * 100).toFixed(0)}%`}
                          className="input-field" />
                      </div>
                    ))}
                  </div>
                </div>
                <Field label="Notes">
                  <textarea value={repForm.notes} onChange={(e) => setRepForm({ ...repForm, notes: e.target.value })} rows={2} className="input-field" placeholder="Internal notes about this rep..." />
                </Field>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="px-4 py-2 rounded-xl text-[13px] font-medium" style={{ background: 'var(--crm-accent)', color: '#fff' }}>{editingRep ? 'Update' : 'Add'} Rep</button>
                  <button type="button" onClick={() => { setShowRepForm(false); setEditingRep(null); }} className="px-4 py-2 rounded-xl text-[13px]" style={{ background: 'var(--crm-surface)', color: 'var(--crm-text-secondary)' }}>Cancel</button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {reps.map((rep) => (
                <div key={rep.id} className="p-4 rounded-xl transition-colors" style={{ border: '1px solid var(--crm-border)', background: 'var(--crm-surface)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-semibold" style={{ background: 'var(--crm-surface2)', color: 'var(--crm-text-muted)' }}>
                        {(rep.name || '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-semibold">{rep.name}</span>
                          <span className="text-[12px] px-2 py-0.5 rounded-lg" style={{
                            background: rep.status === 'active' ? 'rgba(30,144,255,0.12)' : rep.status === 'onboarding' ? 'rgba(30,144,255,0.07)' : 'rgba(255,255,255,0.05)',
                            color: rep.status === 'active' ? 'var(--crm-accent)' : rep.status === 'onboarding' ? 'var(--crm-accent)' : 'var(--crm-text-muted)',
                          }}>{rep.status}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {rep.role && <span className="text-[12px]" style={{ color: 'var(--crm-text-muted)' }}>{rep.role}</span>}
                          {rep.email && <span className="text-[12px]" style={{ color: 'var(--crm-text-muted)' }}>{rep.email}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-[12px]" style={{ color: 'var(--crm-text-muted)' }}>Base pay</p>
                        <p className="text-[13px]">${(rep.base_pay || 0).toLocaleString()}/{(rep.pay_frequency || 'bi-weekly').replace('-', '')}</p>
                      </div>
                      {rep.commission_split > 0 && (
                        <div className="text-right">
                          <p className="text-[12px]" style={{ color: 'var(--crm-text-muted)' }}>Split</p>
                          <p className="text-[13px]">{(rep.commission_split * 100).toFixed(0)}%</p>
                        </div>
                      )}
                      <div className="flex gap-1">
                        {(rep.streams || []).map((s) => (
                          <div key={s} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STREAMS[s]?.color }} title={STREAMS[s]?.label} />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setRepForm({ ...rep }); setEditingRep(rep.id); setShowRepForm(true); }} className="text-[12px]" style={{ color: 'var(--crm-text-muted)' }}>Edit</button>
                        <button onClick={() => deleteRep(rep.id)} className="text-[12px]" style={{ color: 'var(--crm-negative)' }}>Del</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {reps.length === 0 && (
                <div className="text-center py-12 text-[13px]" style={{ color: 'var(--crm-text-muted)' }}>No reps yet. Add your first team member above.</div>
              )}
            </div>
          </Section>
        </div>
      )}

      {tab === 'profile' && (
        <div className="space-y-5">
          <Section title="Personal Profile">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full name">
                <input value={settings.profile?.name || ''} onChange={(e) => update('profile.name', e.target.value)} className="input-field" />
              </Field>
              <Field label="Title">
                <input value={settings.profile?.title || ''} onChange={(e) => update('profile.title', e.target.value)} placeholder="e.g. Sales Director" className="input-field" />
              </Field>
              <Field label="Company">
                <input value={settings.profile?.company || ''} onChange={(e) => update('profile.company', e.target.value)} className="input-field" />
              </Field>
              <Field label="Email">
                <input type="email" value={settings.profile?.email || ''} onChange={(e) => update('profile.email', e.target.value)} className="input-field" />
              </Field>
              <Field label="Phone">
                <input value={settings.profile?.phone || ''} onChange={(e) => update('profile.phone', e.target.value)} className="input-field" />
              </Field>
            </div>
          </Section>

          <Section title="Business Entity">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Entity name">
                <input value={settings.business?.entity_name || ''} onChange={(e) => update('business.entity_name', e.target.value)} className="input-field" />
              </Field>
              <Field label="Entity type">
                <select value={settings.business?.entity_type || ''} onChange={(e) => update('business.entity_type', e.target.value)} className="input-field">
                  <option value="">Select...</option>
                  <option value="sole_prop">Sole Proprietorship</option>
                  <option value="llc">LLC</option>
                  <option value="s_corp">S-Corp</option>
                  <option value="c_corp">C-Corp</option>
                  <option value="partnership">Partnership</option>
                  <option value="w2">W-2 Employee</option>
                </select>
              </Field>
              <Field label="EIN">
                <input value={settings.business?.ein || ''} onChange={(e) => update('business.ein', e.target.value)} placeholder="XX-XXXXXXX" className="input-field" />
              </Field>
              <Field label="Fiscal year start">
                <select value={settings.business?.fiscal_year_start || 'january'} onChange={(e) => update('business.fiscal_year_start', e.target.value)} className="input-field">
                  {MONTHS.map((m) => <option key={m} value={m.toLowerCase()}>{m}</option>)}
                </select>
              </Field>
            </div>
          </Section>
        </div>
      )}

      {tab === 'tax' && (
        <div className="space-y-5">
          <Section title="Tax Settings" subtitle="Used to estimate tax liability on the P&L">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Estimated tax rate">
                <div className="flex items-center gap-2">
                  <input type="number" step="0.01" value={settings.tax?.estimated_rate || ''} onChange={(e) => update('tax.estimated_rate', parseFloat(e.target.value) || 0)}
                    className="input-field w-32 text-right" />
                  <span className="text-[12px]" style={{ color: 'var(--crm-text-muted)' }}>({((settings.tax?.estimated_rate || 0) * 100).toFixed(0)}%)</span>
                </div>
              </Field>
              <div>
                <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>Auto set-aside</label>
                <div className="flex items-center gap-3 mt-2">
                  <Toggle checked={settings.tax?.set_aside} onChange={(v) => update('tax.set_aside', v)} />
                  <span className="text-[13px]" style={{ color: 'var(--crm-text-secondary)' }}>Show tax set-aside amounts on dashboard</span>
                </div>
              </div>
            </div>
          </Section>
        </div>
      )}

      {tab === 'display' && (
        <div className="space-y-5">
          <Section title="Display Preferences">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] mb-2" style={{ color: 'var(--crm-text-secondary)' }}>Theme</label>
                <div className="flex gap-2">
                  {['dark', 'light'].map((t) => (
                    <button key={t} onClick={() => update('theme', t)}
                      className="px-4 py-2 rounded-xl text-[13px] capitalize"
                      style={{
                        background: settings.theme === t ? 'var(--crm-accent)' : 'var(--crm-surface2)',
                        color: settings.theme === t ? '#fff' : 'var(--crm-text-muted)',
                        fontWeight: settings.theme === t ? 600 : 400,
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Currency">
                <select value={settings.currency || 'USD'} onChange={(e) => update('currency', e.target.value)} className="input-field" style={{ width: '10rem' }}>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Data Export">
            <p className="text-[13px] mb-3" style={{ color: 'var(--crm-text-muted)' }}>Export all dashboard data as JSON for backup or migration.</p>
            <button onClick={async () => {
              const res = await fetch('/api/dashboard?range=ytd');
              const data = await res.json();
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `summit-export-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }} className="px-4 py-2 rounded-xl text-[13px]" style={{ background: 'var(--crm-surface2)', color: 'var(--crm-text-secondary)' }}>
              Export Dashboard Data
            </button>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, subtitle, children }) {
  return (
    <div className="glass-card-solid p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        {subtitle && <p className="text-[13px] mt-0.5" style={{ color: 'var(--crm-text-muted)' }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[13px] mb-1" style={{ color: 'var(--crm-text-secondary)' }}>{label}</label>
      {children}
    </div>
  );
}

function RetainerRow({ label, desc, enabled, amount, onToggle, onAmount }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--crm-surface2)' }}>
      <div className="flex items-center gap-3">
        <Toggle checked={enabled} onChange={onToggle} />
        <div>
          <span className="text-[14px] font-medium">{label}</span>
          <p className="text-[12px]" style={{ color: 'var(--crm-text-muted)' }}>{desc}</p>
        </div>
      </div>
      {enabled && (
        <div className="flex items-center gap-2">
          <span className="text-[13px]" style={{ color: 'var(--crm-text-muted)' }}>$/mo</span>
          <input type="number" step="0.01" value={amount} onChange={(e) => onAmount(parseFloat(e.target.value) || 0)}
            className="input-field w-32 text-right" placeholder="0.00" />
        </div>
      )}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="relative w-10 h-5 rounded-full transition-colors"
      style={{ background: checked ? 'var(--crm-accent)' : 'var(--crm-surface2)' }}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}
