// Constantes do sistema
export const STORAGE_KEYS = {
  USER_SESSION: 'financial_user_session',
  USER_DATA: 'financial_user_data',
  PORTFOLIO_DATA: 'financial_portfolio',
  TRANSACTIONS: 'financial_transactions',
  SETTINGS: 'financial_settings',
  THEME: 'financial_theme'
};

export const ASSET_TYPES = {
  STOCK_BR: 'stock_br',
  STOCK_US: 'stock_us',
  CRYPTO: 'crypto',
  CURRENCY: 'currency',
  FUND: 'fund',
  FIXED_INCOME: 'fixed_income',
  REAL_ESTATE: 'real_estate'
};

export const OPERATION_TYPES = {
  BUY: 'buy',
  SELL: 'sell',
  DIVIDEND: 'dividend',
  SPLIT: 'split',
  BONUS: 'bonus',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal'
};

export const CURRENCIES = {
  BRL: 'BRL',
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY'
};

export const API_ENDPOINTS = {
  QUOTES_BR: 'https://api.hgbrasil.com/finance/quotations',
  QUOTES_US: 'https://api.twelvedata.com/quote',
  CRYPTO: 'https://api.coingecko.com/api/v3',
  CURRENCY: 'https://api.exchangerate-api.com/v4/latest'
};

export const CHART_COLORS = {
  profit: '#10b981',
  loss: '#ef4444',
  neutral: '#6b7280',
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  warning: '#f59e0b'
};

export const PORTFOLIO_LIMITS = {
  MAX_CONCENTRATION: 0.3, // 30% máximo por ativo
  MIN_DIVERSIFICATION: 5, // Mínimo 5 ativos diferentes
  MAX_VOLATILITY: 0.25 // 25% máximo de volatilidade
};