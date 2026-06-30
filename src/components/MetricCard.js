'use client';

export default function MetricCard({ title, value, subtitle, positive, className = '' }) {
  const isNumber = typeof value === 'number';
  const absVal = isNumber ? Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value;
  const prefix = isNumber && value < 0 ? '-' : '';
  const color = positive === true ? 'var(--crm-positive)' : positive === false ? 'var(--crm-negative)' : 'var(--crm-text)';

  return (
    <div className={`glass-card-solid p-6 ${className}`}>
      <p className="text-[14px] mb-3 font-medium" style={{ color: 'var(--crm-text-secondary)' }}>{title}</p>
      <p className="metric-number" style={{ color }}>
        {isNumber && <span className="accent-dollar">$</span>}
        {prefix}{isNumber ? absVal : value}
      </p>
      {subtitle && <p className="text-[14px] mt-3" style={{ color: 'var(--crm-text-muted)' }}>{subtitle}</p>}
    </div>
  );
}
