
const LS_INV = 'fc_investments';
const LS_TX  = 'fc_transactions';
const LS_SET = 'fc_settings';

const read = (key, def) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? def; }
  catch { return def; }
};
const write = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export const storage = {
  get investments() { return read(LS_INV, []); },
  set investments(v) { write(LS_INV, v); },

  get transactions() { return read(LS_TX, []); },
  set transactions(v) { write(LS_TX, v); },

  get settings() {
    // Provedores default
    const def = {
      refreshMinutes: 5,
      equityProvider: "yahoo",  // yahoo | alpha | manual
      alphaKey: "",             // se escolher alpha
      cryptoProvider: "coingecko",
      newsFeeds: [
        "https://www.infomoney.com.br/ultimas-noticias/feed/",
        "https://valor.globo.com/rss/financas/",
        "https://feeds.bbci.co.uk/news/business/rss.xml"
      ]
    };
    return { ...def, ...read(LS_SET, {}) };
  },
  set settings(v) { write(LS_SET, v); },

  resetAll() {
    localStorage.removeItem(LS_INV);
    localStorage.removeItem(LS_TX);
    // não apagamos settings
  }
};
