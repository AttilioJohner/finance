// Funções utilitárias
export const formatCurrency = (value, currency = 'BRL', locale = 'pt-BR') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const formatPercentage = (value, decimals = 2) => {
  return (value * 100).toFixed(decimals) + '%';
};

export const formatNumber = (value, decimals = 0) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const formatDate = (date, format = 'dd/MM/yyyy') => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  switch (format) {
    case 'dd/MM/yyyy':
      return `${day}/${month}/${year}`;
    case 'MM/yyyy':
      return `${month}/${year}`;
    case 'yyyy-MM-dd':
      return `${year}-${month}-${day}`;
    default:
      return d.toLocaleDateString('pt-BR');
  }
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const calculatePercentageChange = (oldValue, newValue) => {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
};

export const calculateAveragePrice = (transactions) => {
  let totalShares = 0;
  let totalValue = 0;

  transactions.filter(t => t.type === 'buy').forEach(transaction => {
    totalShares += transaction.quantity;
    totalValue += transaction.quantity * transaction.price;
  });

  return totalShares > 0 ? totalValue / totalShares : 0;
};

export const calculatePortfolioValue = (positions) => {
  return positions.reduce((total, position) => {
    return total + (position.quantity * position.currentPrice);
  }, 0);
};

export const getAssetTypeLabel = (type) => {
  const labels = {
    stock_br: 'Ações BR',
    stock_us: 'Ações US',
    crypto: 'Cripto',
    currency: 'Moeda',
    fund: 'Fundos',
    fixed_income: 'Renda Fixa',
    real_estate: 'Imobiliário'
  };
  return labels[type] || type;
};

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};