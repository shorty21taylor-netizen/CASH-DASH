'use client';

export default function EmptyState({ icon = '—', message = 'Nothing here yet.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-3xl mb-3" style={{ color: 'var(--crm-text-muted)' }}>{icon}</span>
      <p className="text-sm" style={{ color: 'var(--crm-text-muted)' }}>{message}</p>
      {action}
    </div>
  );
}
