'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Command Center', icon: '⚡' },
  { href: '/commissions', label: 'Commissions', icon: '💰' },
  { href: '/life-insurance', label: 'Life Insurance', icon: '🛡️' },
  { href: '/market', label: 'Market Profits', icon: '📈' },
  { href: '/pnl', label: 'P&L Statement', icon: '📊' },
  { href: '/networth', label: 'Net Worth', icon: '🏦' },
  { type: 'divider' },
  { href: '/goals', label: 'Goals', icon: '🎯' },
  { href: '/habits', label: 'Habits', icon: '🔥' },
  { href: '/health', label: 'Health', icon: '💪' },
  { href: '/time', label: 'Time Log', icon: '⏱️' },
  { type: 'divider' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav className={`flex flex-col border-r transition-all duration-200 ${collapsed ? 'w-16' : 'w-60'}`}
      style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)' }}>
      <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--crm-border)' }}>
        {!collapsed && (
          <>
            <img src="/summit-logo.png" alt="Summit" className="w-8 h-8" onError={(e) => { e.target.style.display = 'none'; }} />
            <span className="font-bold text-lg pnl-gradient-text">Summit</span>
          </>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-neutral-500 hover:text-white text-sm p-1">
          {collapsed ? '▸' : '◂'}
        </button>
      </div>
      <div className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item, i) => {
          if (item.type === 'divider') {
            return <div key={i} className="my-2 mx-3 border-t" style={{ borderColor: 'var(--crm-border)' }} />;
          }
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2 mx-2 rounded-lg text-sm transition-all ${
                active
                  ? 'bg-red-500/10 text-red-400 font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
