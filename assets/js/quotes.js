
import { storage } from './storage.js';
import { currency } from './utils.js';

const ALLORIGINS = "https://api.allorigins.win/raw?url=";

// USD/BRL via exchangerate.host (sem chave)
export async function fetchUsdBrl() {
  const url = "https://api.exchangerate.host/latest?base=USD&symbols=BRL";
  const r = await fetch(url);
  const j = await r.json();
  const v = j?.rates?.BRL;
  if (!v) throw new Error("Sem dado USD/BRL");
  return v;
}

// Yahoo Finance (pode funcionar sem CORS em muitos navegadores; fallback via allorigins)
async function yahooQuote(symbol) {
  const u1 = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`;
  try {
    const r = await fetch(u1);
    const j = await r.json();
    const q = j?.quoteResponse?.result?.[0];
    if (q) return {
      price: q.regularMarketPrice,
      currency: q.currency || 'USD',
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent
    };
  } catch {}
  // Fallback via allorigins (não é garantido sempre)
  const u2 = ALLORIGINS + encodeURIComponent(u1);
  const r2 = await fetch(u2);
  const j2 = await r2.json();
  const q2 = j2?.quoteResponse?.result?.[0];
  if (q2) return {
    price: q2.regularMarketPrice,
    currency: q2.currency || 'USD',
    change: q2.regularMarketChange,
    changePercent: q2.regularMarketChangePercent
  };
  throw new Error("Falha Yahoo for " + symbol);
}

// Alpha Vantage (requer chave)
async function alphaQuote(symbol, key) {
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(symbol)}&apikey=${key}`;
  const r = await fetch(url);
  const j = await r.json();
  const g = j?.["Global Quote"];
  if (!g) throw new Error("Falha Alpha");
  return {
    price: parseFloat(g["05. price"]),
    currency: 'USD',
    change: parseFloat(g["09. change"]),
    changePercent: parseFloat(g["10. change percent"]?.replace('%',''))
  };
}

// Coingecko
async function coingeckoQuote(id) {
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd,brl&include_24hr_change=true`;
  const r = await fetch(url);
  const j = await r.json();
  const obj = j?.[id];
  if (!obj) throw new Error("Cripto não encontrada no Coingecko: " + id);
  return {
    price: obj.brl ?? obj.usd,
    currency: obj.brl ? 'BRL' : 'USD',
    change: null,
    changePercent: obj.brl_24h_change ?? obj.usd_24h_change
  };
}

// Decide provedor e busca
export async function quoteFor(investment) {
  const type = investment.type;
  const s = storage.settings;
  if (type === 'Cripto') {
    const id = investment.providerSymbol || investment.symbol?.toLowerCase(); // ex: bitcoin, ethereum
    return await coingeckoQuote(id);
  } else if (['Ações','ETF','FII'].includes(type)) {
    if (s.equityProvider === 'alpha') return await alphaQuote(investment.symbol, s.alphaKey);
    return await yahooQuote(investment.symbol);
  } else if (['Renda Fixa','Tesouro','Fundo','Outros'].includes(type)) {
    // Sem cotação pública padrão — usa manual ou ignora
    return { price: investment.manualPrice ?? investment.avgPrice ?? 0, currency: investment.currency || 'BRL', change: null, changePercent: null };
  } else {
    return { price: 0, currency: 'BRL', change: null, changePercent: null };
  }
}

// Atualiza cotações de toda a carteira
export async function refreshQuotes() {
  const list = storage.investments;
  const results = [];
  for (const inv of list) {
    try {
      const q = await quoteFor(inv);
      inv.lastQuote = { ...q, at: Date.now() };
      results.push({ id: inv.id, ok: true });
      await new Promise(r => setTimeout(r, 150)); // pequena pausa para evitar rate limits
    } catch (e) {
      results.push({ id: inv.id, ok: false, error: String(e) });
    }
  }
  storage.investments = list;
  return results;
}

export async function refreshUsdInHeader() {
  const el = document.getElementById('header-usdbrl');
  const time = document.getElementById('header-last-update');
  try {
    const usdbrl = await fetchUsdBrl();
    el.textContent = `USD/BRL — ${currency(usdbrl, 'BRL')}`;
    time.textContent = `atualizado: ${new Date().toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}`;
  } catch {
    el.textContent = `USD/BRL — indisponível`;
  }
}
