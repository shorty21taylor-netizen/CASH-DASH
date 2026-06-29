'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '⛰' },
  { href: '/commissions', label: 'All Commissions', icon: '💰' },
  { href: '/streams/ht-a', label: 'High Ticket A', icon: '🎯' },
  { href: '/streams/ht-b', label: 'High Ticket B', icon: '🚀' },
  { href: '/streams/life', label: 'Life Insurance', icon: '🛡' },
  { href: '/policies', label: 'Policies', icon: '📋' },
  { href: '/life-os', label: 'Life OS', icon: '🧭' },
];

export default function Nav() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav className={`bg-dark-900 border-r border-dark-700 flex flex-col transition-all ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 border-b border-dark-700 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">⛰</span>
            <span className="font-bold text-summit-400 text-lg">Summit</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-dark-400 hover:text-white p-1"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      <div className="flex-1 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-colors ${
                active
                  ? 'bg-summit-900/50 text-summit-400 border border-summit-700/50'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
