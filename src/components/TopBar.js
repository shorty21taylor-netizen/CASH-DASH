'use client';

import { useState, useEffect } from 'react';

export default function TopBar() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/api/dashboard?range=mtd').then((r) => r.json()).then(setData);
  }, []);

  const stats = [
    { label: 'TOTAL EARNED', value: data?.commRevenue },
    { label: 'MTD NET', value: data?.netPnl },
    { label: 'PIPELINE', value: data?.pendingComm },
    { label: 'NET WORTH', value: data?.netWorth },
  ];

  return (
    <div className="flex items-center justify-between px-6 h-11 border-b flex-shrink-0" style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)' }}>
      <div className="flex items-center gap-3">
        <img src="/summit-logo.png" alt="" className="w-5 h-5 opacity-50 grayscale" onError={(e) => { e.target.style.display = 'none'; }} />
        <span className="font-mono text-[11px] uppercase tracking-[0.15em]" style={{ color: 'var(--crm-text-muted)' }}>SWR</span>
      </div>
      <div className="flex items-center gap-8">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.12em]" style={{ color: 'var(--crm-text-muted)' }}>{s.label}</span>
            <span className="font-mono text-[13px] tabular-nums" style={{ color: 'var(--crm-text)' }}>
              {s.value != null ? `$${s.value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—'}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full flex items-center justify-center font-mono text-[10px]" style={{ background: 'var(--crm-surface2)', color: 'var(--crm-text-secondary)' }}>S</div>
        <span className="font-mono text-[11px]" style={{ color: 'var(--crm-text-secondary)' }}>SHORTY</span>
      </div>
    </div>
  );
}
