
export const currency = (value, code='BRL') => {
  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: code }).format(value ?? 0);
  } catch {
    return `R$ ${(value ?? 0).toFixed(2)}`;
  }
};

export const numberPt = (n, digits=2) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n ?? 0);

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export const nowHHMM = () => {
  const d = new Date();
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

export const pct = (a, b) => {
  if (!b) return 0;
  return ( (a - b) / b ) * 100;
};

export const by = (prop) => (a,b) => (a[prop] ?? 0) < (b[prop] ?? 0) ? -1 : 1;
