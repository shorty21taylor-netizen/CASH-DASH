'use client';

import { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings').then((r) => r.json()).then((d) => setSettings(d.settings));
  }, []);

  async function handleSave() {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function updateRate(stream, value) {
    setSettings({
      ...settings,
      rates: { ...settings.rates, [stream]: parseFloat(value) || 0 },
    });
  }

  if (!settings) return <div className="text-neutral-500">Loading...</div>;

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="glass-card-solid p-6 space-y-6">
        <div>
          <h2 className="font-semibold mb-4">Commission Rates</h2>
          <div className="space-y-3">
            {[
              { key: 'htA', label: 'I2I Offer' },
              { key: 'htB', label: 'BNB Offer' },
              { key: 'life', label: 'Life Insurance (Default)' },
            ].map((s) => (
              <div key={s.key} className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">{s.label}</span>
                <div className="flex items-center gap-2">
                  <input type="number" step="0.01" value={settings.rates?.[s.key] || 0} onChange={(e) => updateRate(s.key, e.target.value)}
                    className="w-24 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm text-right" />
                  <span className="text-xs text-neutral-500">({((settings.rates?.[s.key] || 0) * 100).toFixed(0)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-6" style={{ borderColor: 'var(--crm-border)' }}>
          <h2 className="font-semibold mb-4">Theme</h2>
          <div className="flex gap-2">
            {['dark', 'light'].map((t) => (
              <button key={t} onClick={() => setSettings({ ...settings, theme: t })}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${settings.theme === t ? 'bg-red-600 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t pt-6" style={{ borderColor: 'var(--crm-border)' }}>
          <h2 className="font-semibold mb-4">Data Export</h2>
          <p className="text-sm text-neutral-500 mb-3">Export all data as JSON for backup.</p>
          <button onClick={async () => {
            const res = await fetch('/api/dashboard?range=ytd');
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `summit-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
          }} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm">
            Export Dashboard Data
          </button>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <button onClick={handleSave} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">
            Save Settings
          </button>
          {saved && <span className="text-green-400 text-sm">Saved!</span>}
        </div>
      </div>
    </div>
  );
}
