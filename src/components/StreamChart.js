'use client';

import ClientOnly from './ClientOnly.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function StreamChart({ data, title = 'REVENUE BY STREAM' }) {
  return (
    <ClientOnly>
      <div className="glass-card-solid p-5">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.12em] mb-4" style={{ color: 'var(--crm-text-muted)' }}>{title}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="none" />
              <XAxis dataKey="month" stroke="#6a6a70" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
              <YAxis stroke="#6a6a70" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} tickFormatter={(v) => `$${v.toLocaleString()}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1c1c20', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: '#f5f5f5', fontFamily: 'JetBrains Mono', fontSize: '11px' }}
                labelStyle={{ color: '#8a8a90' }}
              />
              <Legend wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: '10px' }} />
              <Bar dataKey="htA" name="I2I Offer" fill="#1E90FF" radius={[2, 2, 0, 0]} />
              <Bar dataKey="htB" name="BNB Offer" fill="#4a4a50" radius={[2, 2, 0, 0]} />
              <Bar dataKey="life" name="Life Insurance" fill="#3a3a40" radius={[2, 2, 0, 0]} />
              <Bar dataKey="summit" name="Summit Placement" fill="#2a2a30" radius={[2, 2, 0, 0]} />
              <Bar dataKey="market" name="Market Profits" fill="#343438" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ClientOnly>
  );
}
