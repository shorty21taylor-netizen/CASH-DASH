export const STREAMS = {
  htA: { key: 'htA', label: 'I2I Offer', color: '#dc2626' },
  htB: { key: 'htB', label: 'BNB Offer', color: '#f97316' },
  life: { key: 'life', label: 'Life Insurance', color: '#eab308' },
  summit: { key: 'summit', label: 'Summit Placement', color: '#8b5cf6' },
};

export const DEFAULT_STREAMS = [
  { key: 'htA', label: 'I2I Offer', color: '#dc2626', defaultRate: 0.10 },
  { key: 'htB', label: 'BNB Offer', color: '#f97316', defaultRate: 0.15 },
  { key: 'life', label: 'Life Insurance', color: '#eab308', defaultRate: 0.50 },
  { key: 'summit', label: 'Summit Placement', color: '#8b5cf6', defaultRate: 0.10 },
];

export const STREAM_COLORS = ['#dc2626', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#6366f1'];

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
  summit: 0.10,
};

export const EXPENSE_CATEGORIES = ['business', 'personal'];
export const EXPENSE_FREQUENCIES = ['once', 'monthly', 'yearly'];
export const ACCOUNT_TYPES = ['cash', 'investment', 'debt'];
export const HABIT_CADENCES = ['daily', 'weekly'];
export const TIME_CATEGORIES = ['deep_work', 'meetings', 'admin', 'learning', 'health', 'personal', 'other'];

export const PAY_FREQUENCIES = ['weekly', 'bi-weekly', 'semi-monthly', 'monthly', 'annually'];
export const REP_STATUSES = ['active', 'inactive', 'onboarding'];

export function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const TABLES = [
  'commissions', 'policies', 'expenses', 'income_other',
  'accounts', 'goals', 'habits', 'health_logs', 'time_logs',
  'market_profits', 'reps'
];
