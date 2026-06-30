'use client';

import ClientOnly from './ClientOnly.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function StreamChart({ data, title = 'Revenue by Stream' }) {
  return (
    <ClientOnly>
      <div className="glass-card-solid p-7">
        <h3 className="text-[15px] font-semibold mb-6" style={{ color: 'var(--crm-text-secondary)' }}>{title}</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="none" vertical={false} />
              <XAxis dataKey="month" stroke="#6a7080" fontSize={13} fontFamily="Inter" tickLine={false} axisLine={false} />
              <YAxis stroke="#6a7080" fontSize={13} fontFamily="Inter" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#12141a', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', color: '#f4f6f8', fontFamily: 'Inter', fontSize: '14px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                labelStyle={{ color: '#9aa0aa' }}
                cursor={{ fill: 'rgba(30, 144, 255, 0.05)' }}
              />
              <Legend wrapperStyle={{ fontFamily: 'Inter', fontSize: '13px' }} />
              <Bar dataKey="htA" name="I2I Offer" fill="#1E90FF" radius={[8, 8, 0, 0]} />
              <Bar dataKey="htB" name="BNB Offer" fill="rgba(30, 144, 255, 0.55)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="life" name="Life Insurance" fill="rgba(30, 144, 255, 0.35)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="summit" name="Summit Placement" fill="rgba(30, 144, 255, 0.2)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="market" name="Market Profits" fill="rgba(30, 144, 255, 0.12)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ClientOnly>
  );
}
