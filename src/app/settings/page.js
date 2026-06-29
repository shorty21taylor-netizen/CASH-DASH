'use client';

import { useState, useEffect } from 'react';
import { STREAMS, PAY_FREQUENCIES, REP_STATUSES } from '../../lib/constants.js';

const TABS = [
  { key: 'income', label: 'Income & Pay', icon: '💵' },
  { key: 'commissions', label: 'Commissions', icon: '💰' },
  { key: 'reps', label: 'Reps & Team', icon: '👥' },
  { key: 'profile', label: 'Profile & Business', icon: '🏢' },
  { key: 'tax', label: 'Tax & Planning', icon: '📋' },
  { key: 'display', label: 'Display & Data', icon: '🎨' },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
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
    fetch('/api/settings').then((r) => r.json()).then((d) => setSettings(d.settings));
    fetch('/api/reps').then((r) => r.json()).then((d) => setReps(d.reps || []));
  }, []);

  async function handleSave() {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
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

  function addFixedIncome() {
    const list = [...(settings.fixed_income || []), { label: '', amount: 0, frequency: 'monthly' }];
    update('fixed_income', list);
  }

  function updateFixedIncome(idx, field, value) {
    const list = [...(settings.fixed_income || [])];
    list[idx] = { ...list[idx], [field]: field === 'amount' ? parseFloat(value) || 0 : value };
    update('fixed_income', list);
  }

  function removeFixedIncome(idx) {
    const list = [...(settings.fixed_income || [])];
    list.splice(idx, 1);
    update('fixed_income', list);
  }

  function addBonusTier() {
    const tiers = [...(settings.bonuses?.tiers || []), { threshold: 0, bonus: 0, label: '' }];
    update('bonuses.tiers', tiers);
  }

  function updateBonusTier(idx, field, value) {
    const tiers = [...(settings.bonuses?.tiers || [])];
    tiers[idx] = { ...tiers[idx], [field]: field === 'label' ? value : parseFloat(value) || 0 };
    update('bonuses.tiers', tiers);
  }

  function removeBonusTier(idx) {
    const tiers = [...(settings.bonuses?.tiers || [])];
    tiers.splice(idx, 1);
    update('bonuses.tiers', tiers);
  }

  function toggleRepStream(stream) {
    const streams = [...(repForm.streams || [])];
    const idx = streams.indexOf(stream);
    if (idx >= 0) streams.splice(idx, 1);
    else streams.push(stream);
    setRepForm({ ...repForm, streams });
  }

  if (!settings) return <div className="text-neutral-500 p-8">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-neutral-500 text-sm">Configure your command center</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-green-400 text-sm font-medium animate-pulse">Saved!</span>}
          <button onClick={handleSave} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
            Save All Settings
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl overflow-x-auto" style={{ background: 'var(--crm-surface)' }}>
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              tab === t.key ? 'bg-red-600 text-white' : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}>
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Income & Pay */}
      {tab === 'income' && (
        <div className="space-y-6">
          {/* Base Pay */}
          <Section title="Base Pay / Salary">
            <div className="flex items-center gap-3 mb-4">
              <Toggle checked={settings.base_pay?.enabled} onChange={(v) => update('base_pay.enabled', v)} />
              <span className="text-sm text-neutral-400">I receive a base pay / salary</span>
            </div>
            {settings.base_pay?.enabled && (
              <div className="grid grid-cols-3 gap-4">
                <Field label="Base Pay Amount ($)">
                  <input type="number" step="0.01" value={settings.base_pay?.amount || ''} onChange={(e) => update('base_pay.amount', parseFloat(e.target.value) || 0)}
                    className="input-field" placeholder="0.00" />
                </Field>
                <Field label="Pay Frequency">
                  <select value={settings.base_pay?.frequency || 'bi-weekly'} onChange={(e) => update('base_pay.frequency', e.target.value)} className="input-field">
                    {PAY_FREQUENCIES.map((f) => <option key={f} value={f}>{f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')}</option>)}
                  </select>
                </Field>
                <Field label="Start Date">
                  <input type="date" value={settings.base_pay?.start_date || ''} onChange={(e) => update('base_pay.start_date', e.target.value)} className="input-field" />
                </Field>
              </div>
            )}
          </Section>

          {/* Fixed Income Sources */}
          <Section title="Additional Fixed Income" subtitle="Retainers, side contracts, recurring payments outside of commissions">
            <div className="space-y-3">
              {(settings.fixed_income || []).map((inc, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-5">
                    {i === 0 && <label className="block text-xs text-neutral-500 mb-1">Source / Label</label>}
                    <input value={inc.label} onChange={(e) => updateFixedIncome(i, 'label', e.target.value)} placeholder="e.g. Retainer, Consulting" className="input-field" />
                  </div>
                  <div className="col-span-3">
                    {i === 0 && <label className="block text-xs text-neutral-500 mb-1">Amount ($)</label>}
                    <input type="number" step="0.01" value={inc.amount || ''} onChange={(e) => updateFixedIncome(i, 'amount', e.target.value)} className="input-field" />
                  </div>
                  <div className="col-span-3">
                    {i === 0 && <label className="block text-xs text-neutral-500 mb-1">Frequency</label>}
                    <select value={inc.frequency} onChange={(e) => updateFixedIncome(i, 'frequency', e.target.value)} className="input-field">
                      {PAY_FREQUENCIES.map((f) => <option key={f} value={f}>{f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')}</option>)}
                    </select>
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button onClick={() => removeFixedIncome(i)} className="text-red-400 hover:text-red-300 text-lg">×</button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addFixedIncome} className="mt-3 text-sm text-red-400 hover:text-red-300 font-medium">+ Add Income Source</button>
          </Section>

          {/* Bonus Structure */}
          <Section title="Bonus Tiers" subtitle="Performance bonuses based on revenue or deal count">
            <div className="flex items-center gap-3 mb-4">
              <Toggle checked={settings.bonuses?.enabled} onChange={(v) => update('bonuses.enabled', v)} />
              <span className="text-sm text-neutral-400">Enable bonus structure</span>
            </div>
            {settings.bonuses?.enabled && (
              <>
                <div className="mb-4">
                  <Field label="Threshold Type">
                    <select value={settings.bonuses?.threshold_type || 'revenue'} onChange={(e) => update('bonuses.threshold_type', e.target.value)} className="input-field w-48">
                      <option value="revenue">Revenue ($)</option>
                      <option value="deals">Deal Count</option>
                    </select>
                  </Field>
                </div>
                <div className="space-y-2">
                  {(settings.bonuses?.tiers || []).map((tier, i) => (
                    <div key={i} className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-4">
                        {i === 0 && <label className="block text-xs text-neutral-500 mb-1">Label</label>}
                        <input value={tier.label} onChange={(e) => updateBonusTier(i, 'label', e.target.value)} placeholder="e.g. Gold Tier" className="input-field" />
                      </div>
                      <div className="col-span-3">
                        {i === 0 && <label className="block text-xs text-neutral-500 mb-1">Threshold</label>}
                        <input type="number" value={tier.threshold || ''} onChange={(e) => updateBonusTier(i, 'threshold', e.target.value)} className="input-field" />
                      </div>
                      <div className="col-span-4">
                        {i === 0 && <label className="block text-xs text-neutral-500 mb-1">Bonus ($)</label>}
                        <input type="number" step="0.01" value={tier.bonus || ''} onChange={(e) => updateBonusTier(i, 'bonus', e.target.value)} className="input-field" />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button onClick={() => removeBonusTier(i)} className="text-red-400 hover:text-red-300 text-lg">×</button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={addBonusTier} className="mt-3 text-sm text-red-400 hover:text-red-300 font-medium">+ Add Tier</button>
              </>
            )}
          </Section>
        </div>
      )}

      {/* Commissions */}
      {tab === 'commissions' && (
        <div className="space-y-6">
          <Section title="Default Commission Rates" subtitle="Per-stream rates applied to new commissions">
            <div className="space-y-3">
              {Object.values(STREAMS).map((s) => (
                <div key={s.key} className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="number" step="0.01" value={settings.rates?.[s.key] ?? ''} onChange={(e) => {
                      const rates = { ...settings.rates, [s.key]: parseFloat(e.target.value) || 0 };
                      update('rates', rates);
                    }} className="w-24 input-field text-right" />
                    <span className="text-xs text-neutral-500 w-12">({((settings.rates?.[s.key] || 0) * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Rate Overrides">
            <div className="flex items-center gap-3">
              <Toggle checked={settings.allow_rate_overrides} onChange={(v) => update('allow_rate_overrides', v)} />
              <span className="text-sm text-neutral-400">Allow per-deal rate overrides when entering commissions</span>
            </div>
          </Section>
        </div>
      )}

      {/* Reps & Team */}
      {tab === 'reps' && (
        <div className="space-y-6">
          <Section title="Reps Under Management" subtitle="Manage your team members, their pay, and commission splits">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-neutral-400">{reps.filter((r) => r.status === 'active').length} active reps</span>
                <span className="text-sm text-neutral-500">·</span>
                <span className="text-sm text-neutral-400">{reps.length} total</span>
              </div>
              <button onClick={() => { setRepForm(blankRep()); setEditingRep(null); setShowRepForm(true); }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">
                + Add Rep
              </button>
            </div>

            {showRepForm && (
              <form onSubmit={saveRep} className="p-5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-4 mb-4">
                <h3 className="font-semibold">{editingRep ? 'Edit' : 'Add'} Rep</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Full Name">
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
                  <Field label="Role / Title">
                    <input value={repForm.role} onChange={(e) => setRepForm({ ...repForm, role: e.target.value })} placeholder="e.g. Sales Rep, Closer" className="input-field" />
                  </Field>
                  <Field label="Status">
                    <select value={repForm.status} onChange={(e) => setRepForm({ ...repForm, status: e.target.value })} className="input-field">
                      {REP_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </Field>
                  <Field label="Start Date">
                    <input type="date" value={repForm.start_date} onChange={(e) => setRepForm({ ...repForm, start_date: e.target.value })} className="input-field" />
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Base Pay ($)">
                    <input type="number" step="0.01" value={repForm.base_pay} onChange={(e) => setRepForm({ ...repForm, base_pay: e.target.value })} placeholder="0.00" className="input-field" />
                  </Field>
                  <Field label="Pay Frequency">
                    <select value={repForm.pay_frequency} onChange={(e) => setRepForm({ ...repForm, pay_frequency: e.target.value })} className="input-field">
                      {PAY_FREQUENCIES.map((f) => <option key={f} value={f}>{f.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')}</option>)}
                    </select>
                  </Field>
                  <Field label="Commission Split (%)">
                    <input type="number" step="0.01" value={repForm.commission_split} onChange={(e) => setRepForm({ ...repForm, commission_split: e.target.value })} placeholder="e.g. 0.50 = 50%" className="input-field" />
                  </Field>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-2">Assigned Streams</label>
                  <div className="flex gap-2 flex-wrap">
                    {Object.values(STREAMS).map((s) => (
                      <button key={s.key} type="button" onClick={() => toggleRepStream(s.key)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          (repForm.streams || []).includes(s.key) ? 'text-white' : 'bg-neutral-800 text-neutral-400'
                        }`}
                        style={(repForm.streams || []).includes(s.key) ? { backgroundColor: s.color + '30', color: s.color, border: `1px solid ${s.color}50` } : {}}>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 mb-2">Rate Overrides (leave blank to use defaults)</label>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.values(STREAMS).map((s) => (
                      <div key={s.key}>
                        <label className="block text-xs text-neutral-600 mb-1">{s.label}</label>
                        <input type="number" step="0.01"
                          value={repForm.override_rates?.[s.key] ?? ''}
                          onChange={(e) => {
                            const overrides = { ...repForm.override_rates };
                            if (e.target.value === '') delete overrides[s.key];
                            else overrides[s.key] = parseFloat(e.target.value) || 0;
                            setRepForm({ ...repForm, override_rates: overrides });
                          }}
                          placeholder={`${((settings.rates?.[s.key] || 0) * 100).toFixed(0)}%`}
                          className="input-field text-sm" />
                      </div>
                    ))}
                  </div>
                </div>
                <Field label="Notes">
                  <textarea value={repForm.notes} onChange={(e) => setRepForm({ ...repForm, notes: e.target.value })} rows={2} className="input-field" placeholder="Internal notes about this rep..." />
                </Field>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">{editingRep ? 'Update' : 'Add'} Rep</button>
                  <button type="button" onClick={() => { setShowRepForm(false); setEditingRep(null); }} className="px-4 py-2 bg-neutral-800 text-white rounded-lg text-sm">Cancel</button>
                </div>
              </form>
            )}

            {/* Rep list */}
            <div className="space-y-2">
              {reps.map((rep) => (
                <div key={rep.id} className="p-4 rounded-xl border hover:border-neutral-600 transition-colors" style={{ borderColor: 'var(--crm-border)', background: 'var(--crm-surface)' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-bold text-neutral-400">
                        {(rep.name || '?').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{rep.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            rep.status === 'active' ? 'bg-green-500/10 text-green-400' :
                            rep.status === 'onboarding' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-neutral-500/10 text-neutral-400'
                          }`}>{rep.status}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {rep.role && <span className="text-xs text-neutral-500">{rep.role}</span>}
                          {rep.email && <span className="text-xs text-neutral-600">{rep.email}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-neutral-500">Base Pay</p>
                        <p className="text-sm font-mono">${(rep.base_pay || 0).toLocaleString()}/{(rep.pay_frequency || 'bi-weekly').replace('-', '')}</p>
                      </div>
                      {rep.commission_split > 0 && (
                        <div className="text-right">
                          <p className="text-xs text-neutral-500">Split</p>
                          <p className="text-sm font-mono">{(rep.commission_split * 100).toFixed(0)}%</p>
                        </div>
                      )}
                      <div className="flex gap-1">
                        {(rep.streams || []).map((s) => (
                          <div key={s} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STREAMS[s]?.color }} title={STREAMS[s]?.label} />
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setRepForm({ ...rep }); setEditingRep(rep.id); setShowRepForm(true); }} className="text-xs text-neutral-400 hover:text-white">Edit</button>
                        <button onClick={() => deleteRep(rep.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {reps.length === 0 && (
                <div className="text-center py-12 text-neutral-500 text-sm">No reps yet. Add your first team member above.</div>
              )}
            </div>
          </Section>
        </div>
      )}

      {/* Profile & Business */}
      {tab === 'profile' && (
        <div className="space-y-6">
          <Section title="Personal Profile">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name">
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
              <Field label="Entity Name">
                <input value={settings.business?.entity_name || ''} onChange={(e) => update('business.entity_name', e.target.value)} className="input-field" />
              </Field>
              <Field label="Entity Type">
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
              <Field label="Fiscal Year Start">
                <select value={settings.business?.fiscal_year_start || 'january'} onChange={(e) => update('business.fiscal_year_start', e.target.value)} className="input-field">
                  {MONTHS.map((m) => <option key={m} value={m.toLowerCase()}>{m}</option>)}
                </select>
              </Field>
            </div>
          </Section>
        </div>
      )}

      {/* Tax & Planning */}
      {tab === 'tax' && (
        <div className="space-y-6">
          <Section title="Tax Settings" subtitle="Used to estimate tax liability on the P&L">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Estimated Tax Rate">
                <div className="flex items-center gap-2">
                  <input type="number" step="0.01" value={settings.tax?.estimated_rate || ''} onChange={(e) => update('tax.estimated_rate', parseFloat(e.target.value) || 0)}
                    className="input-field w-32 text-right" />
                  <span className="text-xs text-neutral-500">({((settings.tax?.estimated_rate || 0) * 100).toFixed(0)}%)</span>
                </div>
              </Field>
              <div>
                <label className="block text-xs text-neutral-500 mb-1">Auto Set-Aside</label>
                <div className="flex items-center gap-3 mt-2">
                  <Toggle checked={settings.tax?.set_aside} onChange={(v) => update('tax.set_aside', v)} />
                  <span className="text-sm text-neutral-400">Show tax set-aside amounts on dashboard</span>
                </div>
              </div>
            </div>
          </Section>
        </div>
      )}

      {/* Display & Data */}
      {tab === 'display' && (
        <div className="space-y-6">
          <Section title="Display Preferences">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-neutral-500 mb-2">Theme</label>
                <div className="flex gap-2">
                  {['dark', 'light'].map((t) => (
                    <button key={t} onClick={() => update('theme', t)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${settings.theme === t ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <Field label="Currency">
                <select value={settings.currency || 'USD'} onChange={(e) => update('currency', e.target.value)} className="input-field w-40">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </Field>
            </div>
          </Section>

          <Section title="Data Export">
            <p className="text-sm text-neutral-500 mb-3">Export all dashboard data as JSON for backup or migration.</p>
            <button onClick={async () => {
              const res = await fetch('/api/dashboard?range=ytd');
              const data = await res.json();
              const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `summit-export-${new Date().toISOString().split('T')[0]}.json`;
              a.click();
            }} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm font-medium">
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
    <div className="glass-card-solid p-6">
      <div className="mb-4">
        <h2 className="font-semibold text-lg">{title}</h2>
        {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs text-neutral-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-red-600' : 'bg-neutral-700'}`}>
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}
