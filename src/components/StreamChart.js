'use client';

import ClientOnly from './ClientOnly.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function StreamChart({ data, title = 'Revenue by Stream' }) {
  return (
    <ClientOnly>
      <div className="glass-card-solid p-6">
        <h3 className="text-sm font-medium mb-5" style={{ color: 'var(--crm-text-secondary)' }}>{title}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="none" vertical={false} />
              <XAxis dataKey="month" stroke="#6a706a" fontSize={12} fontFamily="Inter" tickLine={false} axisLine={false} />
              <YAxis stroke="#6a706a" fontSize={12} fontFamily="Inter" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#161916', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', color: '#f4f6f4', fontFamily: 'Inter', fontSize: '13px', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}
                labelStyle={{ color: '#9aa09a' }}
                cursor={{ fill: 'rgba(74, 222, 128, 0.04)' }}
              />
              <Legend wrapperStyle={{ fontFamily: 'Inter', fontSize: '12px' }} />
              <Bar dataKey="htA" name="I2I Offer" fill="#4ade80" radius={[6, 6, 0, 0]} />
              <Bar dataKey="htB" name="BNB Offer" fill="rgba(74, 222, 128, 0.5)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="life" name="Life Insurance" fill="rgba(74, 222, 128, 0.3)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="summit" name="Summit Placement" fill="rgba(74, 222, 128, 0.18)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="market" name="Market Profits" fill="rgba(74, 222, 128, 0.10)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ClientOnly>
  );
}
