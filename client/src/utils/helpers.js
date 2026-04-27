export const getDaysUntilExpiry = (expiryDate) => {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getExpiryStatus = (expiryDate) => {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return 'expired';
  if (days <= 2) return 'danger';
  if (days <= 5) return 'warning';
  return 'fresh';
};

export const getExpiryLabel = (expiryDate) => {
  const days = getDaysUntilExpiry(expiryDate);
  if (days < 0) return `Expired ${Math.abs(days)}d ago`;
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  return `${days} days left`;
};

export const getExpiryClass = (expiryDate) => {
  const status = getExpiryStatus(expiryDate);
  if (status === 'expired' || status === 'danger') return 'expiry-danger';
  if (status === 'warning') return 'expiry-warning';
  return 'expiry-fresh';
};

export const getExpiryBorderClass = (expiryDate) => {
  const status = getExpiryStatus(expiryDate);
  if (status === 'expired' || status === 'danger') return 'border-danger';
  if (status === 'warning') return 'border-warning';
  return 'border-fresh';
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num?.toString() || '0';
};

export const CATEGORY_COLORS = {
  fruits: '#F59E0B',
  vegetables: '#10B981',
  dairy: '#3B82F6',
  meat: '#EF4444',
  grains: '#F97316',
  beverages: '#8B5CF6',
  snacks: '#EC4899',
  condiments: '#14B8A6',
  frozen: '#06B6D4',
  bakery: '#D97706',
  canned: '#6B7280',
  other: '#94A3B8',
};

export const CATEGORY_ICONS = {
  fruits: '🍎',
  vegetables: '🥦',
  dairy: '🥛',
  meat: '🥩',
  grains: '🌾',
  beverages: '🥤',
  snacks: '🍿',
  condiments: '🫙',
  frozen: '🧊',
  bakery: '🍞',
  canned: '🥫',
  other: '📦',
};

export const truncate = (str, len = 50) =>
  str && str.length > len ? str.slice(0, len) + '...' : str;
