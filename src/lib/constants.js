export const STREAMS = {
  htA: { key: 'htA', label: 'High Ticket Offer A', color: '#5c7cfa' },
  htB: { key: 'htB', label: 'High Ticket Offer B', color: '#748ffc' },
  life: { key: 'life', label: 'Life Insurance', color: '#91a7ff' },
};

export const STATUSES = {
  pending: { key: 'pending', label: 'Pending', color: '#f59e0b' },
  approved: { key: 'approved', label: 'Approved', color: '#3b82f6' },
  paid: { key: 'paid', label: 'Paid', color: '#10b981' },
};

export const POLICY_STATUSES = {
  active: { key: 'active', label: 'Active', color: '#10b981' },
  lapsed: { key: 'lapsed', label: 'Lapsed', color: '#ef4444' },
  pending: { key: 'pending', label: 'Pending', color: '#f59e0b' },
};

export const DEFAULT_RATES = {
  htA: 0.10,
  htB: 0.15,
  life: 0.50,
};

export const RENEWAL_SCHEDULES = ['monthly', 'quarterly', 'semi-annual', 'annual'];

export const LIFE_OS_TYPES = ['goal', 'task', 'note'];
