'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const PAGE_LABELS = {
  '/': 'Dashboard',
  '/commissions': 'Commissions',
  '/life-insurance': 'Life Insurance',
  '/market': 'Market Profits',
  '/pnl': 'P&L Statement',
  '/networth': 'Net Worth',
  '/goals': 'Goals',
  '/habits': 'Habits',
  '/health': 'Health Log',
  '/time': 'Time Log',
  '/settings': 'Settings',
};

export default function TopBar() {
  const pathname = usePathname();
  const pageLabel = PAGE_LABELS[pathname] || 'Dashboard';

  return (
    <div className="flex items-center justify-between px-6 lg:px-8 h-14 border-b flex-shrink-0" style={{ background: 'var(--crm-bg)', borderColor: 'var(--crm-border)' }}>
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--crm-text-muted)' }}>Shorty War Room</span>
        <span style={{ color: 'var(--crm-text-muted)' }}>/</span>
        <span className="text-sm font-medium" style={{ color: 'var(--crm-text)' }}>{pageLabel}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search your report..."
            className="input-field pl-9 pr-4 py-1.5 text-sm"
            style={{ width: '220px', borderRadius: '20px', background: 'var(--crm-surface)', fontSize: '13px' }}
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--crm-text-muted)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{ background: 'rgba(74, 222, 128, 0.12)', color: 'var(--crm-accent)' }}>
          S
        </div>
      </div>
    </div>
  );
}
