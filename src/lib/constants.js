export const STREAMS = {
  htA: { key: 'htA', label: 'High Ticket A', color: '#dc2626' },
  htB: { key: 'htB', label: 'High Ticket B', color: '#f97316' },
  life: { key: 'life', label: 'Life Insurance', color: '#eab308' },
};

export const STATUSES = {
  pending: { key: 'pending', label: 'Pending', color: '#f59e0b' },
  approved: { key: 'approved', label: 'Approved', color: '#3b82f6' },
  paid: { key: 'paid', label: 'Paid', color: '#22c55e' },
};

export const POLICY_STATUSES = {
  active: { key: 'active', label: 'Active', color: '#22c55e' },
  lapsed: { key: 'lapsed', label: 'Lapsed', color: '#ef4444' },
  pending: { key: 'pending', label: 'Pending', color: '#f59e0b' },
};

export const DEFAULT_RATES = {
  htA: 0.10,
  htB: 0.15,
  life: 0.50,
};

export const EXPENSE_CATEGORIES = ['business', 'personal'];
export const EXPENSE_FREQUENCIES = ['once', 'monthly', 'yearly'];
export const ACCOUNT_TYPES = ['cash', 'investment', 'debt'];
export const HABIT_CADENCES = ['daily', 'weekly'];
export const TIME_CATEGORIES = ['deep_work', 'meetings', 'admin', 'learning', 'health', 'personal', 'other'];

export const TABLES = [
  'commissions', 'policies', 'expenses', 'income_other',
  'accounts', 'goals', 'habits', 'health_logs', 'time_logs',
  'market_profits'
];
