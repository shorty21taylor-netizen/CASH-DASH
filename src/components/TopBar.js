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
    <div className="flex items-center justify-between px-8 lg:px-10 h-16 border-b flex-shrink-0" style={{ background: 'var(--crm-bg)', borderColor: 'var(--crm-border)' }}>
      <div className="flex items-center gap-2">
        <span className="text-[15px]" style={{ color: 'var(--crm-text-muted)' }}>Shorty War Room</span>
        <span style={{ color: 'var(--crm-text-muted)' }}>/</span>
        <span className="text-[15px] font-semibold" style={{ color: 'var(--crm-text)' }}>{pageLabel}</span>
      </div>
      <div className="flex items-center gap-5">
        <div className="relative">
          <input
            type="text"
            placeholder="Search your report..."
            className="input-field pl-10 pr-5 py-2 text-sm"
            style={{ width: '260px', borderRadius: '24px', background: 'var(--crm-surface)', fontSize: '14px' }}
          />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--crm-text-muted)" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
          style={{ background: 'rgba(30, 144, 255, 0.14)', color: 'var(--crm-accent)' }}>
          S
        </div>
      </div>
    </div>
  );
}
