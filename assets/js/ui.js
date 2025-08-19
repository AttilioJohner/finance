
import { currency, numberPt, pct } from './utils.js';

export const toast = (msg) => {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), 2500);
};

export function renderSummary(target, portfolio, currencyCode='BRL') {
  target.innerHTML = `
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card">
        <div class="text-xs text-slate-500">Valor Investido</div>
        <div class="text-2xl font-semibold">${currency(portfolio.invested, currencyCode)}</div>
      </div>
      <div class="card">
        <div class="text-xs text-slate-500">Valor Atual</div>
        <div class="text-2xl font-semibold">${currency(portfolio.current, currencyCode)}</div>
      </div>
      <div class="card">
        <div class="text-xs text-slate-500">Resultado</div>
        <div class="text-2xl font-semibold">${currency(portfolio.current - portfolio.invested, currencyCode)}</div>
      </div>
      <div class="card">
        <div class="text-xs text-slate-500">% Variação</div>
        <div class="text-2xl font-semibold">${numberPt(pct(portfolio.current, portfolio.invested))}%</div>
      </div>
    </div>
  `;
}

export function pieChart(canvasId, labels, values) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  // Destroy previous chart if exists
  if (ctx._chart) { ctx._chart.destroy(); }
  ctx._chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{ data: values }]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
  });
}
