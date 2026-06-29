'use client';

export default function MetricCard({ title, value, subtitle, positive, className = '' }) {
  const formatted = typeof value === 'number'
    ? `$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : value;
  const prefix = typeof value === 'number' && value < 0 ? '-' : '';
  const color = positive === true ? 'text-green-400' : positive === false ? 'text-red-400' : 'text-white';

  return (
    <div className={`glass-card-solid p-5 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.15em] mb-2" style={{ color: 'var(--crm-text-muted)' }}>{title}</p>
      <p className={`metric-number ${color}`}>{prefix}{formatted}</p>
      {subtitle && <p className="text-xs mt-2" style={{ color: 'var(--crm-text-muted)' }}>{subtitle}</p>}
    </div>
  );
}
