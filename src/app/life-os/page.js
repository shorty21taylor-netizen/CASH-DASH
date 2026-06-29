'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LifeOSPage() {
  const [stats, setStats] = useState({ goals: 0, tasks: 0, notes: 0 });

  useEffect(() => {
    fetch('/api/life-os')
      .then((r) => r.json())
      .then((d) => {
        const items = d.items || [];
        setStats({
          goals: items.filter((i) => i.type === 'goal').length,
          tasks: items.filter((i) => i.type === 'task').length,
          notes: items.filter((i) => i.type === 'note').length,
        });
      });
  }, []);

  const sections = [
    { href: '/life-os/goals', label: 'Goals', icon: '🎯', count: stats.goals, desc: 'Track your long-term objectives' },
    { href: '/life-os/tasks', label: 'Tasks', icon: '✅', count: stats.tasks, desc: 'Daily actions & to-dos' },
    { href: '/life-os/notes', label: 'Notes', icon: '📝', count: stats.notes, desc: 'Ideas, journal & reflections' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Life OS</h1>
        <p className="text-dark-400 text-sm">Your personal operating system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="bg-dark-800 border border-dark-700 rounded-xl p-6 hover:border-summit-600 transition-colors group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{s.icon}</span>
              <span className="text-2xl font-bold text-white">{s.count}</span>
            </div>
            <h3 className="text-white font-semibold group-hover:text-summit-400 transition-colors">{s.label}</h3>
            <p className="text-dark-400 text-sm mt-1">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
