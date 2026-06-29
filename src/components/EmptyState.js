'use client';

export default function EmptyState({ icon = '📭', message = 'Nothing here yet.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-neutral-500 text-sm">{message}</p>
      {action}
    </div>
  );
}
