'use client';

export default function MetricCard({ title, value, subtitle, positive, className = '' }) {
  const formatted = typeof value === 'number'
    ? `$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : value;
  const prefix = typeof value === 'number' && value < 0 ? '-' : '';
  const color = positive === true ? 'text-green-400' : positive === false ? 'text-red-400' : 'text-white';

  return (
    <div className={`glass-card-solid p-5 ${className}`}>
      <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 mb-2">{title}</p>
      <p className={`metric-number ${color}`}>{prefix}{formatted}</p>
      {subtitle && <p className="text-xs text-neutral-500 mt-2">{subtitle}</p>}
    </div>
  );
}
