'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'War Room', icon: '/' },
  { href: '/commissions', label: 'Commissions', icon: 'C' },
  { href: '/life-insurance', label: 'Life Insurance', icon: 'L' },
  { href: '/market', label: 'Market', icon: 'M' },
  { href: '/pnl', label: 'P&L', icon: 'P' },
  { href: '/networth', label: 'Net Worth', icon: 'N' },
  { type: 'divider' },
  { href: '/goals', label: 'Goals', icon: 'G' },
  { href: '/habits', label: 'Habits', icon: 'H' },
  { href: '/health', label: 'Health', icon: '+' },
  { href: '/time', label: 'Time', icon: 'T' },
  { type: 'divider' },
  { href: '/settings', label: 'Settings', icon: 'S' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav className={`flex flex-col border-r transition-all duration-200 ${collapsed ? 'w-14' : 'w-52'}`}
      style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)' }}>
      <div className="px-3 py-3 border-b flex items-center" style={{ borderColor: 'var(--crm-border)' }}>
        {!collapsed && (
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em]" style={{ color: 'var(--crm-accent)' }}>WAR ROOM</span>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-[11px] font-mono p-1 transition-colors" style={{ color: 'var(--crm-text-muted)' }}>
          {collapsed ? '>' : '<'}
        </button>
      </div>
      <div className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item, i) => {
          if (item.type === 'divider') {
            return <div key={i} className="my-2 mx-3 h-px" style={{ background: 'var(--crm-border)' }} />;
          }
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 mx-1.5 rounded text-[12px] font-mono uppercase tracking-[0.08em] transition-colors ${
                active
                  ? 'text-[#1E90FF]'
                  : 'hover:text-[#f5f5f5]'
              }`}
              style={{
                color: active ? '#1E90FF' : 'var(--crm-text-muted)',
                background: active ? 'rgba(30, 144, 255, 0.08)' : 'transparent',
              }}>
              <span className="w-5 text-center text-[11px] flex-shrink-0 font-semibold">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>
      {!collapsed && (
        <div className="px-3 py-2 border-t" style={{ borderColor: 'var(--crm-border)' }}>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: 'var(--crm-text-muted)' }}>SUMMIT v1.0</span>
        </div>
      )}
    </nav>
  );
}
