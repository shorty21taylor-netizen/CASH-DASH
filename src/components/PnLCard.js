'use client';

export default function PnLCard({ title, value, subtitle, trend }) {
  const trendColor = trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-dark-400';
  const trendIcon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
      <p className="text-dark-400 text-sm font-medium mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">
        {typeof value === 'number' ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : value}
      </p>
      {subtitle && (
        <p className={`text-sm mt-1 ${trendColor}`}>
          {trendIcon} {subtitle}
        </p>
      )}
    </div>
  );
}
