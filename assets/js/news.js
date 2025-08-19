
import { storage } from './storage.js';

const ALLORIGINS = "https://api.allorigins.win/get?url=";

function parseRSS(xmlText) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "text/xml");
  const items = [...xml.querySelectorAll("item")].slice(0, 25);
  return items.map(it => ({
    title: it.querySelector("title")?.textContent?.trim(),
    link: it.querySelector("link")?.textContent?.trim(),
    pubDate: it.querySelector("pubDate")?.textContent?.trim(),
    source: xml.querySelector("title")?.textContent?.trim()
  }));
}

export async function loadNews() {
  const feeds = storage.settings.newsFeeds;
  const container = document.getElementById('news-list');
  container.innerHTML = `<div class="text-sm opacity-70">Carregando notícias...</div>`;

  const all = [];
  for (const f of feeds) {
    try {
      const url = ALLORIGINS + encodeURIComponent(f);
      const r = await fetch(url);
      const j = await r.json();
      const items = parseRSS(j.contents);
      all.push(...items);
    } catch (e) {
      console.warn("Falha ao carregar feed", f, e);
    }
  }
  // sort by pubDate desc when possible
  all.sort((a,b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));

  container.innerHTML = "";
  if (!all.length) {
    container.innerHTML = `<div class="text-sm opacity-70">Não foi possível carregar as notícias agora.</div>`;
    return;
  }

  for (const n of all.slice(0,50)) {
    const card = document.createElement('a');
    card.href = n.link;
    card.target = "_blank";
    card.rel = "noopener noreferrer";
    card.className = "card block hover:ring-2 hover:ring-indigo-200 transition";
    card.innerHTML = `
      <div class="text-xs text-slate-500 mb-1">${n.source ?? 'Fonte'}</div>
      <div class="font-medium">${n.title}</div>
      <div class="text-xs mt-1 opacity-75">${n.pubDate ? new Date(n.pubDate).toLocaleString('pt-BR') : ''}</div>
    `;
    container.appendChild(card);
  }
}
