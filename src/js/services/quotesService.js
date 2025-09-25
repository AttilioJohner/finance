// Serviço de Cotações em Tempo Real - Versão Atualizada
class QuotesService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 60000; // 1 minuto
        this.retryAttempts = 3;
        this.currentUsdBrlRate = 5.20; // Taxa inicial, será atualizada
        this.init();
    }

    async init() {
        // Atualizar taxa USD/BRL na inicialização
        await this.updateUsdBrlRate();

        // Atualizar taxa a cada 5 minutos
        setInterval(() => this.updateUsdBrlRate(), 5 * 60 * 1000);
    }

    // Atualizar taxa USD/BRL em tempo real
    async updateUsdBrlRate() {
        try {
            // Usando API do Banco Central do Brasil (mais confiável para BRL)
            const bcbResponse = await fetch('https://api.bcb.gov.br/dados/serie/bcdata.sgs.10813/dados/ultimos/1?formato=json');

            if (bcbResponse.ok) {
                const bcbData = await bcbResponse.json();
                if (bcbData && bcbData.length > 0) {
                    this.currentUsdBrlRate = parseFloat(bcbData[0].valor);
                    console.log(`Taxa USD/BRL atualizada: ${this.currentUsdBrlRate}`);
                    return;
                }
            }

            // Fallback para ExchangeRate-API
            const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
            if (response.ok) {
                const data = await response.json();
                this.currentUsdBrlRate = data.rates.BRL || 5.20;
                console.log(`Taxa USD/BRL (fallback): ${this.currentUsdBrlRate}`);
            }
        } catch (error) {
            console.warn('Erro ao atualizar taxa USD/BRL:', error);
        }
    }

    // API principal para buscar cotações
    async getQuote(symbol, type) {
        const cacheKey = `${symbol}_${type}`;

        // Verificar cache primeiro
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            let quote;

            switch (type) {
                case 'stock_br':
                    quote = await this.getBrazilianStock(symbol);
                    break;
                case 'stock_us':
                    quote = await this.getUSStock(symbol);
                    break;
                case 'crypto':
                    quote = await this.getCrypto(symbol);
                    break;
                case 'currency':
                    quote = await this.getCurrency(symbol);
                    break;
                case 'real_estate':
                    quote = await this.getBrazilianStock(symbol);
                    break;
                default:
                    throw new Error('Tipo de ativo não suportado');
            }

            // Cachear resultado
            this.cache.set(cacheKey, {
                data: quote,
                timestamp: Date.now()
            });

            return quote;
        } catch (error) {
            console.error(`Erro ao buscar cotação ${symbol}:`, error);
            return this.getFallbackData(symbol, type);
        }
    }

    // Buscar múltiplas cotações
    async getMultipleQuotes(assets) {
        try {
            const promises = assets.map(asset =>
                this.getQuote(asset.symbol, asset.type).catch(error => ({
                    symbol: asset.symbol,
                    error: error.message
                }))
            );

            const results = await Promise.allSettled(promises);

            return results.map((result, index) => ({
                symbol: assets[index].symbol,
                data: result.status === 'fulfilled' ? result.value : null,
                error: result.status === 'rejected' ? result.reason.message : null
            }));
        } catch (error) {
            console.error('Erro ao buscar cotações múltiplas:', error);
            return [];
        }
    }

    // Ações brasileiras via BRAPI e Yahoo Finance
    async getBrazilianStock(symbol) {
        // Primeiro tentar BRAPI
        try {
            const brapiResponse = await fetch(`https://brapi.dev/api/quote/${symbol}?range=1d&interval=1d&fundamental=false&dividends=false`);

            if (brapiResponse.ok) {
                const data = await brapiResponse.json();

                if (data.results && data.results.length > 0) {
                    const stock = data.results[0];
                    return {
                        symbol: stock.symbol,
                        price: stock.regularMarketPrice,
                        change: stock.regularMarketChange,
                        changePercent: stock.regularMarketChangePercent,
                        currency: 'BRL',
                        volume: stock.regularMarketVolume,
                        marketCap: stock.marketCap,
                        timestamp: Date.now(),
                        source: 'BRAPI'
                    };
                }
            }
        } catch (error) {
            console.warn('BRAPI falhou, tentando Yahoo Finance:', error);
        }

        // Fallback para Yahoo Finance
        try {
            const yahooResponse = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.SA?interval=1d&range=1d`);

            if (yahooResponse.ok) {
                const data = await yahooResponse.json();

                if (data.chart && data.chart.result && data.chart.result.length > 0) {
                    const result = data.chart.result[0];
                    const meta = result.meta;

                    return {
                        symbol: symbol,
                        price: meta.regularMarketPrice,
                        change: meta.regularMarketPrice - meta.previousClose,
                        changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
                        currency: 'BRL',
                        volume: meta.regularMarketVolume,
                        timestamp: Date.now(),
                        source: 'Yahoo Finance'
                    };
                }
            }
        } catch (error) {
            console.warn('Yahoo Finance falhou:', error);
        }

        throw new Error('Todas as fontes falharam');
    }

    // Ações americanas via Yahoo Finance e Alpha Vantage
    async getUSStock(symbol) {
        // Primeiro tentar Yahoo Finance
        try {
            const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`);

            if (response.ok) {
                const data = await response.json();

                if (data.chart && data.chart.result && data.chart.result.length > 0) {
                    const result = data.chart.result[0];
                    const meta = result.meta;
                    const currentPrice = meta.regularMarketPrice;
                    const previousClose = meta.previousClose;
                    const change = currentPrice - previousClose;
                    const changePercent = (change / previousClose) * 100;

                    return {
                        symbol: symbol,
                        price: currentPrice * this.currentUsdBrlRate,
                        change: change * this.currentUsdBrlRate,
                        changePercent: changePercent,
                        currency: 'BRL',
                        originalPrice: currentPrice,
                        originalCurrency: 'USD',
                        volume: meta.regularMarketVolume,
                        timestamp: Date.now(),
                        source: 'Yahoo Finance'
                    };
                }
            }
        } catch (error) {
            console.warn('Yahoo Finance US falhou:', error);
        }

        // Fallback para FinnHub (API gratuita alternativa)
        try {
            const response = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=demo`);

            if (response.ok) {
                const data = await response.json();

                if (data.c && data.pc) { // current price e previous close
                    const currentPrice = data.c;
                    const previousClose = data.pc;
                    const change = currentPrice - previousClose;
                    const changePercent = (change / previousClose) * 100;

                    return {
                        symbol: symbol,
                        price: currentPrice * this.currentUsdBrlRate,
                        change: change * this.currentUsdBrlRate,
                        changePercent: changePercent,
                        currency: 'BRL',
                        originalPrice: currentPrice,
                        originalCurrency: 'USD',
                        timestamp: Date.now(),
                        source: 'FinnHub'
                    };
                }
            }
        } catch (error) {
            console.warn('FinnHub falhou:', error);
        }

        throw new Error('Todas as fontes falharam');
    }

    // Criptomoedas via múltiplas APIs confiáveis
    async getCrypto(symbol) {
        const cryptoMaps = {
            binance: {
                'BTC-USD': 'BTCUSDT',
                'ETH-USD': 'ETHUSDT',
                'ADA-USD': 'ADAUSDT',
                'DOT-USD': 'DOTUSDT',
                'SOL-USD': 'SOLUSDT',
                'BNB-USD': 'BNBUSDT',
                'XRP-USD': 'XRPUSDT',
                'DOGE-USD': 'DOGEUSDT',
                'AVAX-USD': 'AVAXUSDT',
                'MATIC-USD': 'MATICUSDT'
            },
            coingecko: {
                'BTC-USD': 'bitcoin',
                'ETH-USD': 'ethereum',
                'ADA-USD': 'cardano',
                'DOT-USD': 'polkadot',
                'SOL-USD': 'solana',
                'BNB-USD': 'binancecoin',
                'XRP-USD': 'ripple',
                'DOGE-USD': 'dogecoin',
                'AVAX-USD': 'avalanche-2',
                'MATIC-USD': 'matic-network'
            }
        };

        // Primeiro tentar Binance (mais rápida e precisa)
        try {
            const binanceSymbol = cryptoMaps.binance[symbol];
            if (binanceSymbol) {
                const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${binanceSymbol}`);

                if (response.ok) {
                    const data = await response.json();
                    const priceUSD = parseFloat(data.lastPrice);
                    const changePercent = parseFloat(data.priceChangePercent);

                    return {
                        symbol: symbol,
                        price: priceUSD * this.currentUsdBrlRate,
                        change: parseFloat(data.priceChange) * this.currentUsdBrlRate,
                        changePercent: changePercent,
                        currency: 'BRL',
                        originalPrice: priceUSD,
                        originalCurrency: 'USD',
                        volume: parseFloat(data.volume),
                        timestamp: Date.now(),
                        source: 'Binance'
                    };
                }
            }
        } catch (error) {
            console.warn('Binance API falhou:', error);
        }

        // Fallback para CoinGecko
        try {
            const geckoId = cryptoMaps.coingecko[symbol];
            if (geckoId) {
                const response = await fetch(
                    `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd,brl&include_24hr_change=true&include_24hr_vol=true`
                );

                if (response.ok) {
                    const data = await response.json();
                    const coinData = data[geckoId];

                    if (coinData) {
                        return {
                            symbol: symbol,
                            price: coinData.brl || (coinData.usd * this.currentUsdBrlRate),
                            changePercent: coinData.usd_24h_change || 0,
                            currency: 'BRL',
                            originalPrice: coinData.usd,
                            originalCurrency: 'USD',
                            volume: coinData.usd_24h_vol,
                            timestamp: Date.now(),
                            source: 'CoinGecko'
                        };
                    }
                }
            }
        } catch (error) {
            console.warn('CoinGecko API falhou:', error);
        }

        // Fallback para CoinCap
        try {
            const coinCapMap = {
                'BTC-USD': 'bitcoin',
                'ETH-USD': 'ethereum',
                'ADA-USD': 'cardano',
                'DOT-USD': 'polkadot',
                'SOL-USD': 'solana'
            };

            const coinCapId = coinCapMap[symbol];
            if (coinCapId) {
                const response = await fetch(`https://api.coincap.io/v2/assets/${coinCapId}`);

                if (response.ok) {
                    const result = await response.json();
                    const data = result.data;

                    if (data) {
                        const priceUSD = parseFloat(data.priceUsd);
                        const changePercent = parseFloat(data.changePercent24Hr);

                        return {
                            symbol: symbol,
                            price: priceUSD * this.currentUsdBrlRate,
                            changePercent: changePercent,
                            currency: 'BRL',
                            originalPrice: priceUSD,
                            originalCurrency: 'USD',
                            volume: parseFloat(data.volumeUsd24Hr),
                            timestamp: Date.now(),
                            source: 'CoinCap'
                        };
                    }
                }
            }
        } catch (error) {
            console.warn('CoinCap API falhou:', error);
        }

        throw new Error('Todas as fontes de crypto falharam');
    }

    // Moedas via APIs confiáveis
    async getCurrency(symbol) {
        const currencyPairs = {
            'USD-BRL': { from: 'USD', to: 'BRL' },
            'EUR-BRL': { from: 'EUR', to: 'BRL' },
            'GBP-BRL': { from: 'GBP', to: 'BRL' }
        };

        const pair = currencyPairs[symbol];
        if (!pair) {
            throw new Error('Par de moedas não suportado');
        }

        // Primeiro tentar API do Banco Central (para BRL)
        if (pair.to === 'BRL') {
            try {
                let bcbSeriesId;
                switch (pair.from) {
                    case 'USD': bcbSeriesId = 10813; break;
                    case 'EUR': bcbSeriesId = 21619; break;
                    case 'GBP': bcbSeriesId = 21620; break;
                }

                if (bcbSeriesId) {
                    const response = await fetch(
                        `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${bcbSeriesId}/dados/ultimos/2?formato=json`
                    );

                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.length >= 2) {
                            const current = parseFloat(data[1].valor);
                            const previous = parseFloat(data[0].valor);
                            const change = current - previous;
                            const changePercent = (change / previous) * 100;

                            return {
                                symbol: symbol,
                                price: current,
                                change: change,
                                changePercent: changePercent,
                                currency: 'BRL',
                                timestamp: Date.now(),
                                source: 'Banco Central do Brasil'
                            };
                        }
                    }
                }
            } catch (error) {
                console.warn('BCB API falhou:', error);
            }
        }

        // Fallback para ExchangeRate-API
        try {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${pair.from}`);

            if (response.ok) {
                const data = await response.json();
                const rate = data.rates[pair.to];

                if (rate) {
                    return {
                        symbol: symbol,
                        price: rate,
                        change: 0, // API não fornece variação
                        changePercent: 0,
                        currency: pair.to,
                        timestamp: Date.now(),
                        source: 'ExchangeRate-API'
                    };
                }
            }
        } catch (error) {
            console.warn('ExchangeRate-API falhou:', error);
        }

        throw new Error('Todas as fontes de moeda falharam');
    }

    // Dados de fallback com preços mais próximos do real (janeiro 2025)
    getFallbackData(symbol, type) {
        const fallbackPrices = {
            // Ações brasileiras
            'PETR4': { price: 38.45, change: 0.12, changePercent: 0.31 },
            'VALE3': { price: 62.15, change: -0.85, changePercent: -1.35 },
            'ITUB4': { price: 31.25, change: 0.45, changePercent: 1.46 },
            'BBDC4': { price: 14.85, change: -0.15, changePercent: -1.0 },
            'ABEV3': { price: 11.20, change: 0.08, changePercent: 0.72 },
            'BBAS3': { price: 26.80, change: 0.32, changePercent: 1.21 },
            'WEGE3': { price: 47.90, change: -0.25, changePercent: -0.52 },
            'MGLU3': { price: 5.45, change: -0.12, changePercent: -2.16 },

            // Criptomoedas (preços atuais aproximados em BRL)
            'BTC-USD': { price: 600000, change: 15000, changePercent: 2.56 },
            'ETH-USD': { price: 17680, change: 420, changePercent: 2.43 },
            'ADA-USD': { price: 4.42, change: 0.08, changePercent: 1.84 },
            'DOT-USD': { price: 37.44, change: -0.52, changePercent: -1.37 },
            'SOL-USD': { price: 936, change: 18.2, changePercent: 1.98 },
            'BNB-USD': { price: 3432, change: 45.6, changePercent: 1.35 },
            'XRP-USD': { price: 15.6, change: 0.28, changePercent: 1.82 },

            // Moedas
            'USD-BRL': { price: this.currentUsdBrlRate, change: 0.02, changePercent: 0.38 },
            'EUR-BRL': { price: this.currentUsdBrlRate * 1.09, change: 0.03, changePercent: 0.52 }
        };

        const fallback = fallbackPrices[symbol];
        if (fallback) {
            return {
                symbol: symbol,
                price: fallback.price,
                change: fallback.change,
                changePercent: fallback.changePercent,
                currency: 'BRL',
                timestamp: Date.now(),
                source: 'Fallback Data'
            };
        }

        // Dados genéricos se não encontrar específico
        return {
            symbol: symbol,
            price: 100 + Math.random() * 50,
            change: (Math.random() - 0.5) * 5,
            changePercent: (Math.random() - 0.5) * 5,
            currency: 'BRL',
            timestamp: Date.now(),
            source: 'Generic Fallback'
        };
    }

    // Utilitário para retry com backoff
    async fetchWithRetry(url, options = {}, attempts = 3) {
        for (let i = 0; i < attempts; i++) {
            try {
                const response = await fetch(url, {
                    ...options,
                    headers: {
                        'User-Agent': 'FinancialControl/1.0',
                        'Accept': 'application/json',
                        ...options.headers
                    }
                });

                if (response.ok) {
                    return response;
                }

                if (response.status === 429) { // Rate limit
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
                    continue;
                }

                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            } catch (error) {
                if (i === attempts - 1) throw error;
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 500));
            }
        }
    }

    // Limpar cache
    clearCache() {
        this.cache.clear();
        console.log('Cache de cotações limpo');
    }

    // Obter status do serviço
    getServiceStatus() {
        return {
            cacheSize: this.cache.size,
            usdBrlRate: this.currentUsdBrlRate,
            lastUpdate: new Date().toISOString()
        };
    }
}

// Criar instância global
window.quotesService = new QuotesService();

// Export para uso em módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuotesService;
}