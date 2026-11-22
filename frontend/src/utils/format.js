export const formatCurrency = (value = 0, currency = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const categoryIcon = (category = '') => {
  const map = {
    Food: '🍽️',
    Travel: '✈️',
    Shopping: '🛍️',
    Bills: '🧾',
    Rent: '🏠',
    Entertainment: '🎬',
    Health: '💊',
    Education: '📚',
    Subscription: '🔁',
    Other: '🏷️',
    Salary: '💼',
    Freelance: '💻',
    Business: '🏢',
    Investment: '📈',
    Gift: '🎁',
  };
  return map[category] || '🏷️';
};
