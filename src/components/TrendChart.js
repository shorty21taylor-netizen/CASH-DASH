'use client';

import ClientOnly from './ClientOnly.js';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLOR_MAP = {
  '#22c55e': '#4ade80',
  '#ef4444': '#6a706a',
  '#dc2626': '#4ade80',
  '#8b5cf6': '#9aa09a',
  '#1E90FF': '#4ade80',
  '#4a4a50': '#9aa09a',
};

export default function TrendChart({ data, lines, title, height = 256 }) {
  return (
    <ClientOnly>
      <div className="glass-card-solid p-6">
        {title && <h3 className="text-sm font-medium mb-5" style={{ color: 'var(--crm-text-secondary)' }}>{title}</h3>}
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                {lines.map((l) => {
                  const color = COLOR_MAP[l.color] || l.color;
                  return (
                    <linearGradient key={`grad-${l.key}`} id={`grad-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="none" vertical={false} />
              <XAxis dataKey="label" stroke="#6a706a" fontSize={12} fontFamily="Inter" tickLine={false} axisLine={false} />
              <YAxis stroke="#6a706a" fontSize={12} fontFamily="Inter" tickLine={false} axisLine={false} tickFormatter={(v) => typeof v === 'number' ? `$${v.toLocaleString()}` : v} />
              <Tooltip
                contentStyle={{ backgroundColor: '#161916', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', color: '#f4f6f4', fontFamily: 'Inter', fontSize: '13px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
                labelStyle={{ color: '#9aa09a' }}
              />
              <Legend wrapperStyle={{ fontFamily: 'Inter', fontSize: '12px' }} />
              {lines.map((l) => {
                const color = COLOR_MAP[l.color] || l.color;
                return (
                  <Area key={l.key} type="monotone" dataKey={l.key} name={l.name}
                    stroke={color} strokeWidth={2} fill={`url(#grad-${l.key})`}
                    dot={{ r: 3, fill: color, stroke: color, strokeWidth: 1 }}
                    activeDot={{ r: 6, fill: color, stroke: '#0a0c0a', strokeWidth: 2, filter: 'drop-shadow(0 0 6px rgba(74, 222, 128, 0.5))' }}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ClientOnly>
  );
}
