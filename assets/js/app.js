
import { storage } from './storage.js';
import { refreshQuotes, refreshUsdInHeader } from './quotes.js';
import { loadNews } from './news.js';
import { currency, uid, pct } from './utils.js';
import { toast, renderSummary, pieChart } from './ui.js';

// Seed inicial (apenas se vazio)
(function seed() {
  if (storage.investments.length) return;
  storage.investments = [
    { id: uid(), type: 'Ações',  symbol: 'AAPL', name: 'Apple Inc.', quantity: 5,  avgPrice: 170, currency: 'USD', broker: 'XP', tags: ['tech'] },
    { id: uid(), type: 'FII',    symbol: 'HGLG11.SA', name: 'CSHG Logística', quantity: 10, avgPrice: 160, currency: 'BRL', broker: 'Nubank', tags: ['imobiliário'] },
    { id: uid(), type: 'Cripto', symbol: 'BTC', providerSymbol: 'bitcoin', name: 'Bitcoin', quantity: 0.02, avgPrice: 300000, currency: 'BRL', broker: 'Binance', tags: ['crypto'] },
    { id: uid(), type: 'Tesouro', symbol: 'LTN-2027', name: 'Tesouro Prefixado 2027', quantity: 1000, avgPrice: 1000, currency: 'BRL', broker: 'Tesouro Direto', manualPrice: 1008, tags: ['renda fixa'] }
  ];
})();

// Helpers de portfólio
function computePortfolio() {
  const invs = storage.investments;
  let invested = 0, current = 0;
  const byType = {};
  for (const it of invs) {
    const inv = (it.avgPrice || 0) * (it.quantity || 0);
    invested += inv;
    const px = it.lastQuote?.price ?? it.manualPrice ?? it.avgPrice ?? 0;
    const cur = px * (it.quantity || 0);
    current += cur;
    byType[it.type] = (byType[it.type] || 0) + cur;
  }
  return { invested, current, byType };
}

// -------------- Páginas --------------
export async function initDashboard() {
  // atualizar USD header
  refreshUsdInHeader();
  // atualizar cotações e render
  await refreshQuotes();
  renderDash();
}

function renderDash() {
  const wrap = document.getElementById('dash-summary');
  const { invested, current, byType } = computePortfolio();
  renderSummary(wrap, { invested, current }, 'BRL');

  // Gráfico de alocação
  const labels = Object.keys(byType);
  const values = Object.values(byType);
  pieChart('alloc-chart', labels, values);

  // Top posições
  const tbody = document.getElementById('dash-top');
  tbody.innerHTML = "";
  const list = storage.investments.slice().sort((a,b) => {
    const aVal = (a.lastQuote?.price ?? 0) * (a.quantity || 0);
    const bVal = (b.lastQuote?.price ?? 0) * (b.quantity || 0);
    return bVal - aVal;
  }).slice(0,8);
  for (const it of list) {
    const px = it.lastQuote?.price ?? it.manualPrice ?? it.avgPrice ?? 0;
    const cur = px * (it.quantity || 0);
    const inv = (it.avgPrice || 0) * (it.quantity || 0);
    const change = pct(cur, inv);
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="py-2">${it.symbol}</td>
      <td>${it.name || '-'}</td>
      <td>${it.quantity}</td>
      <td>${currency(px, it.currency || 'BRL')}</td>
      <td>${currency(cur, 'BRL')}</td>
      <td class="${change>=0?'text-green-700':'text-red-700'}">${change?change.toFixed(2):'0.00'}%</td>
    `;
    tbody.appendChild(tr);
  }
}

export async function initPortfolio() {
  refreshUsdInHeader();
  await refreshQuotes();
  renderPortfolioTable();
}

function renderPortfolioTable() {
  const tbody = document.getElementById('portfolio-tbody');
  const list = storage.investments;
  tbody.innerHTML = "";
  for (const it of list) {
    const px = it.lastQuote?.price ?? it.manualPrice ?? it.avgPrice ?? 0;
    const cur = px * (it.quantity || 0);
    const inv = (it.avgPrice || 0) * (it.quantity || 0);
    const change = ((cur - inv) / (inv || 1)) * 100;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span class="badge">${it.type}</span></td>
      <td class="font-medium">${it.symbol}</td>
      <td class="opacity-80">${it.name || '-'}</td>
      <td>${it.quantity}</td>
      <td>${currency(it.avgPrice, it.currency || 'BRL')}</td>
      <td>${currency(px, it.currency || 'BRL')}</td>
      <td>${currency(cur, 'BRL')}</td>
      <td class="${change>=0?'text-green-700':'text-red-700'}">${isFinite(change)?change.toFixed(2):'0.00'}%</td>
      <td class="text-right">
        <button class="btn-secondary text-xs" data-edit="${it.id}">Editar</button>
        <button class="btn-secondary text-xs" data-del="${it.id}">Excluir</button>
      </td>
    `;
    tbody.appendChild(tr);
  }

  tbody.addEventListener('click', (e) => {
    const id = e.target.dataset.del;
    const eid = e.target.dataset.edit;
    if (id) {
      storage.investments = storage.investments.filter(x => x.id !== id);
      renderPortfolioTable();
      toast('Item removido.');
    } else if (eid) {
      location.hash = `#/add?id=${eid}`;
    }
  });
}

export async function initAdd() {
  refreshUsdInHeader();
  const params = new URLSearchParams(location.hash.split('?')[1] || "");
  const editId = params.get('id');
  const form = document.getElementById('inv-form');
  const title = document.getElementById('add-title');

  if (editId) {
    const it = storage.investments.find(x => x.id === editId);
    if (it) {
      title.textContent = "Editar Investimento";
      form.type.value = it.type;
      form.symbol.value = it.symbol || "";
      form.providerSymbol.value = it.providerSymbol || "";
      form.name.value = it.name || "";
      form.currency.value = it.currency || "BRL";
      form.quantity.value = it.quantity || 0;
      form.avgPrice.value = it.avgPrice || 0;
      form.manualPrice.value = it.manualPrice || "";
      form.broker.value = it.broker || "";
      form.tags.value = (it.tags || []).join(',');
      form.notes.value = it.notes || "";
      form.dataset.editId = it.id;
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    const obj = {
      id: form.dataset.editId || crypto.randomUUID?.() || Math.random().toString(36).slice(2),
      type: d.type,
      symbol: d.symbol.trim(),
      providerSymbol: d.providerSymbol.trim() || undefined,
      name: d.name.trim(),
      currency: d.currency || 'BRL',
      quantity: parseFloat(d.quantity || '0'),
      avgPrice: parseFloat(d.avgPrice || '0'),
      manualPrice: d.manualPrice ? parseFloat(d.manualPrice) : undefined,
      broker: d.broker.trim(),
      tags: d.tags ? d.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
      notes: d.notes.trim()
    };

    const arr = storage.investments;
    const idx = arr.findIndex(x => x.id === obj.id);
    if (idx >= 0) arr[idx] = { ...arr[idx], ...obj };
    else arr.push(obj);
    storage.investments = arr;
    toast('Salvo com sucesso!');
    location.hash = '#/portfolio';
  });
}

export async function initNews() {
  refreshUsdInHeader();
  await loadNews();
}

export async function initSettings() {
  refreshUsdInHeader();
  const f = document.getElementById('settings-form');
  const s = storage.settings;
  f.refreshMinutes.value = s.refreshMinutes;
  f.equityProvider.value = s.equityProvider;
  f.alphaKey.value = s.alphaKey;
  f.cryptoProvider.value = s.cryptoProvider;
  f.newsFeeds.value = (s.newsFeeds || []).join('\n');

  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f).entries());
    storage.settings = {
      refreshMinutes: parseInt(d.refreshMinutes, 10) || 5,
      equityProvider: d.equityProvider,
      alphaKey: d.alphaKey.trim(),
      cryptoProvider: d.cryptoProvider,
      newsFeeds: d.newsFeeds.split('\n').map(l => l.trim()).filter(Boolean)
    };
    toast('Configurações salvas.');
  });

  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Tem certeza que deseja limpar a carteira (mantendo configurações)?')) {
      storage.resetAll();
      toast('Dados da carteira apagados.');
    }
  });
}

// -------------- Agendamento de atualização --------------
async function scheduleRefreshLoop() {
  await refreshUsdInHeader();
  await refreshQuotes();
  // re-render se a página atual depende de dados
  const route = location.hash.split('?')[0];
  if (route === '#/dashboard' || route === '' || route === '#/portfolio') {
    if (route === '#/dashboard' || route === '') renderDash();
    if (route === '#/portfolio') renderPortfolioTable();
  }

  const mins = storage.settings.refreshMinutes || 5;
  setTimeout(scheduleRefreshLoop, Math.max(1, mins) * 60 * 1000);
}

scheduleRefreshLoop();
