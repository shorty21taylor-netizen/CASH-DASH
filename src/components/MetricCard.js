'use client';

export default function MetricCard({ title, value, subtitle, positive, className = '' }) {
  const formatted = typeof value === 'number'
    ? `$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : value;
  const prefix = typeof value === 'number' && value < 0 ? '-' : '';
  const color = positive === true ? '#22c55e' : positive === false ? '#ef4444' : 'var(--crm-text)';

  return (
    <div className={`glass-card-solid p-5 ${className}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] mb-3" style={{ color: 'var(--crm-text-muted)' }}>{title}</p>
      <p className="metric-number" style={{ color }}>{prefix}{formatted}</p>
      {subtitle && <p className="font-mono text-[11px] mt-2" style={{ color: 'var(--crm-text-muted)' }}>{subtitle}</p>}
    </div>
  );
}
