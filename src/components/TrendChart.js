'use client';

import ClientOnly from './ClientOnly.js';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLOR_MAP = {
  '#22c55e': '#1E90FF',
  '#ef4444': '#6a7080',
  '#dc2626': '#1E90FF',
  '#8b5cf6': '#9aa0aa',
  '#1E90FF': '#1E90FF',
  '#4a4a50': '#9aa0aa',
  '#4ade80': '#1E90FF',
};

export default function TrendChart({ data, lines, title, height = 280 }) {
  return (
    <ClientOnly>
      <div className="glass-card-solid p-7">
        {title && <h3 className="text-[15px] font-semibold mb-6" style={{ color: 'var(--crm-text-secondary)' }}>{title}</h3>}
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                {lines.map((l) => {
                  const color = COLOR_MAP[l.color] || l.color;
                  return (
                    <linearGradient key={`grad-${l.key}`} id={`grad-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="none" vertical={false} />
              <XAxis dataKey="label" stroke="#6a7080" fontSize={13} fontFamily="Inter" tickLine={false} axisLine={false} />
              <YAxis stroke="#6a7080" fontSize={13} fontFamily="Inter" tickLine={false} axisLine={false} tickFormatter={(v) => typeof v === 'number' ? `$${v.toLocaleString()}` : v} />
              <Tooltip
                contentStyle={{ backgroundColor: '#12141a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', color: '#f4f6f8', fontFamily: 'Inter', fontSize: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                labelStyle={{ color: '#9aa0aa' }}
              />
              <Legend wrapperStyle={{ fontFamily: 'Inter', fontSize: '13px' }} />
              {lines.map((l) => {
                const color = COLOR_MAP[l.color] || l.color;
                return (
                  <Area key={l.key} type="monotone" dataKey={l.key} name={l.name}
                    stroke={color} strokeWidth={3} fill={`url(#grad-${l.key})`}
                    dot={{ r: 4, fill: color, stroke: color, strokeWidth: 1.5 }}
                    activeDot={{ r: 7, fill: color, stroke: '#000', strokeWidth: 2, filter: 'drop-shadow(0 0 8px rgba(30, 144, 255, 0.6))' }}
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
