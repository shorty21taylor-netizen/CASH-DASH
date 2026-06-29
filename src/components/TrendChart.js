'use client';

import ClientOnly from './ClientOnly.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function TrendChart({ data, lines, title, height = 256 }) {
  return (
    <ClientOnly>
      <div className="glass-card-solid p-6">
        {title && <h3 className="text-white font-semibold mb-4">{title}</h3>}
        <div style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="label" stroke="#737373" fontSize={12} />
              <YAxis stroke="#737373" fontSize={12} tickFormatter={(v) => typeof v === 'number' ? `$${v.toLocaleString()}` : v} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px', color: '#fafafa' }}
                labelStyle={{ color: '#fafafa' }}
              />
              <Legend />
              {lines.map((l) => (
                <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color}
                  strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ClientOnly>
  );
}
