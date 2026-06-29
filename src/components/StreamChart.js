'use client';

import ClientOnly from './ClientOnly.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function StreamChart({ data, title = 'Revenue by Stream' }) {
  return (
    <ClientOnly>
      <div className="glass-card-solid p-6">
        <h3 className="text-white font-semibold mb-4">{title}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis dataKey="month" stroke="#737373" fontSize={12} />
              <YAxis stroke="#737373" fontSize={12} tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '12px', color: '#fafafa' }}
                labelStyle={{ color: '#fafafa' }}
              />
              <Legend />
              <Bar dataKey="htA" name="I2I Offer" fill="#dc2626" radius={[4, 4, 0, 0]} />
              <Bar dataKey="htB" name="BNB Offer" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="life" name="Life Insurance" fill="#eab308" radius={[4, 4, 0, 0]} />
              <Bar dataKey="market" name="Market Profits" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ClientOnly>
  );
}
