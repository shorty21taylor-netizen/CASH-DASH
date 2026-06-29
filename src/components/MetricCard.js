'use client';

export default function MetricCard({ title, value, subtitle, positive, className = '' }) {
  const isNumber = typeof value === 'number';
  const absVal = isNumber ? Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value;
  const prefix = isNumber && value < 0 ? '-' : '';
  const color = positive === true ? 'var(--crm-positive)' : positive === false ? 'var(--crm-negative)' : 'var(--crm-text)';

  return (
    <div className={`glass-card-solid p-5 ${className}`}>
      <p className="text-[13px] mb-3" style={{ color: 'var(--crm-text-secondary)' }}>{title}</p>
      <p className="metric-number" style={{ color }}>
        {isNumber && <span className="green-dollar">$</span>}
        {prefix}{isNumber ? absVal : value}
      </p>
      {subtitle && <p className="text-[13px] mt-2" style={{ color: 'var(--crm-text-muted)' }}>{subtitle}</p>}
    </div>
  );
}
