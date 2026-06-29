'use client';

export default function EmptyState({ icon = '—', message = 'Nothing here yet.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="font-mono text-2xl mb-3" style={{ color: 'var(--crm-text-muted)' }}>{icon}</span>
      <p className="font-mono text-[12px] uppercase tracking-[0.1em]" style={{ color: 'var(--crm-text-muted)' }}>{message}</p>
      {action}
    </div>
  );
}
