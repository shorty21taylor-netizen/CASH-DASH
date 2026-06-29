'use client';

import ClientOnly from './ClientOnly.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const FLAT_COLORS = {
  '#22c55e': '#1E90FF',
  '#ef4444': '#6a6a70',
  '#dc2626': '#1E90FF',
  '#8b5cf6': '#8a8a90',
};

export default function TrendChart({ data, lines, title, height = 256 }) {
  return (
    <ClientOnly>
      <div className="glass-card-solid p-5">
        {title && <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--crm-text-muted)' }}>{title}</h3>}
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="none" />
              <XAxis dataKey="label" stroke="#6a6a70" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
              <YAxis stroke="#6a6a70" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} tickFormatter={(v) => typeof v === 'number' ? `$${v.toLocaleString()}` : v} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1c1c20', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: '#f5f5f5', fontFamily: 'JetBrains Mono', fontSize: '11px' }}
                labelStyle={{ color: '#8a8a90' }}
              />
              <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '10px' }} />
              {lines.map((l) => (
                <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={FLAT_COLORS[l.color] || l.color}
                  strokeWidth={1.5} dot={{ r: 2 }} activeDot={{ r: 4 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ClientOnly>
  );
}
