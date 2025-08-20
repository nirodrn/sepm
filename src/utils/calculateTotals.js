export const calculateTotals = (items, field = 'amount') => {
  if (!items || !Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    const value = typeof item === 'object' ? item[field] : item;
    return total + (parseFloat(value) || 0);
  }, 0);
};

export const calculateAverage = (items, field = 'value') => {
  if (!items || !Array.isArray(items) || items.length === 0) return 0;
  
  const total = calculateTotals(items, field);
  return total / items.length;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};