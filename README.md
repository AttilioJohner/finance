# Finance Control (HTML + JS + Tailwind)

App simples para controle de investimentos (ações, renda fixa, tesouro, cripto etc.), com cotações automáticas, USD/BRL no topo e aba de notícias econômicas.

## 🚀 Recursos
- Cadastro de ativos por classe, com quantidade, preço médio, corretora, tags e notas.
- Cotações automáticas a cada *X* minutos (padrão 5). Ajuste em **Configurações**.
- USD/BRL sempre visível no header (via exchangerate.host).
- Notícias via RSS (Infomoney, Valor, BBC Business por padrão).
- Dashboard com resumo e gráfico de alocação (Chart.js).
- Persistência local (localStorage). Nenhum backend necessário.

## 📦 Estrutura
```
finance-control/
  index.html
  manifest.json
  sw.js
  assets/
    css/styles.css
    js/
      app.js
      router.js
      storage.js
      quotes.js
      news.js
      ui.js
      utils.js
  components/
    templates/
      dashboard.html
      portfolio.html
      add-investment.html
      news.html
      settings.html
```

## ▶️ Como rodar
1. **Recomendado**: sirva localmente (arquivos locais podem bloquear `fetch()`).
   - Com Node: `npx serve .` ou `npx http-server .`
   - Com Python 3: `python -m http.server 8080`
2. Abra `http://localhost:8080/` (ou a porta indicada).
3. Adicione seus ativos em **Adicionar**.
4. Em **Configurações**, ajuste o intervalo de atualização, provedor (Yahoo ou Alpha Vantage) e feeds.

> **Dicas:**  
> • Para ações da B3 use sufixo `.SA` (ex.: `PETR4.SA`, `VALE3.SA`).  
> • Para cripto use o **ID do Coingecko** em "ID provedor" (ex.: `bitcoin`, `ethereum`).  
> • Para ativos sem provedor (Tesouro, RF) use **Preço Manual**.

## 🔒 Limitações & Notas
- Alguns provedores podem ter limitações de **CORS** e/ou **rate limit**. Em caso de erro, defina um preço manual temporário ou use Alpha Vantage com sua chave.
- As cotações e feeds são apenas para **fins informativos**. Verifique sempre com sua corretora/provedor.
- O app salva dados apenas no **seu navegador** (localStorage).

---
Criado automaticamente em 2025-08-19 19:04:05.
