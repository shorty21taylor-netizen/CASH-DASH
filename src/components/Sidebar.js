'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'War Room', icon: '⚡' },
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
    <nav className={`flex flex-col border-r transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}
      style={{ background: 'var(--crm-surface)', borderColor: 'var(--crm-border)' }}>
      <div className="p-4 border-b flex items-center gap-3 glow-line" style={{ borderColor: 'var(--crm-border)' }}>
        {!collapsed && (
          <span className="font-black text-sm tracking-[0.15em] pnl-gradient-text">SHORTY WAR ROOM</span>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-neutral-600 hover:text-red-400 text-sm p-1 transition-colors">
          {collapsed ? '▸' : '◂'}
        </button>
      </div>
      <div className="flex-1 py-3 overflow-y-auto">
        {navItems.map((item, i) => {
          if (item.type === 'divider') {
            return <div key={i} className="my-2 mx-4" style={{ height: '1px', background: 'linear-gradient(90deg, transparent, var(--crm-border), transparent)' }} />;
          }
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-sm transition-all duration-200 ${
                active
                  ? 'bg-red-500/10 text-red-400 font-semibold'
                  : 'text-neutral-500 hover:text-white hover:bg-white/[0.03]'
              }`}
              style={active ? { boxShadow: 'inset 0 0 20px rgba(220, 38, 38, 0.05)' } : {}}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {!collapsed && <span className="tracking-wide">{item.label}</span>}
            </Link>
          );
        })}
      </div>
      {!collapsed && (
        <div className="p-4 border-t text-center" style={{ borderColor: 'var(--crm-border)' }}>
          <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--crm-text-muted)' }}>Summit Branded</span>
        </div>
      )}
    </nav>
  );
}
