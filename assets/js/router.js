
import { initDashboard, initPortfolio, initAdd, initNews, initSettings } from './app.js';

const routes = {
  '/dashboard': { file: 'components/templates/dashboard.html', init: initDashboard },
  '/portfolio': { file: 'components/templates/portfolio.html', init: initPortfolio },
  '/add':       { file: 'components/templates/add-investment.html', init: initAdd },
  '/news':      { file: 'components/templates/news.html', init: initNews },
  '/settings':  { file: 'components/templates/settings.html', init: initSettings },
};

async function loadRoute(path) {
  const r = routes[path] || routes['/dashboard'];
  const res = await fetch(r.file);
  const html = await res.text();
  const app = document.getElementById('app');
  app.innerHTML = html;
  await r.init?.();
}

export function startRouter() {
  window.addEventListener('hashchange', () => loadRoute(location.hash.slice(1) || '/dashboard'));
  loadRoute(location.hash.slice(1) || '/dashboard');
}

startRouter();
