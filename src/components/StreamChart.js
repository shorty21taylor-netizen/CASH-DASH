'use client';

import ClientOnly from './ClientOnly.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function StreamChart({ data }) {
  return (
    <ClientOnly>
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4">Revenue by Stream</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#f8fafc' }}
              />
              <Legend />
              <Bar dataKey="htA" name="High Ticket A" fill="#5c7cfa" radius={[4, 4, 0, 0]} />
              <Bar dataKey="htB" name="High Ticket B" fill="#748ffc" radius={[4, 4, 0, 0]} />
              <Bar dataKey="life" name="Life Insurance" fill="#91a7ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ClientOnly>
  );
}
