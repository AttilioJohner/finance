// Serviço de Cotações em Tempo Real
class QuotesService {
    constructor() {
        this.apiKeys = {
            // APIs gratuitas - sem necessidade de chave
            brapi: null, // API brasileira gratuita
            coinGecko: null, // Crypto gratuita
            exchangeRate: null // Moedas gratuita
        };
        this.cache = new Map();
        this.cacheTimeout = 60000; // 1 minuto
        this.retryAttempts = 3;
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
            console.error(`Erro ao buscar cotação para ${symbol}:`, error);
            // Retornar dados mock em caso de erro
            return this.getFallbackQuote(symbol, type);
        }
    }

    // Buscar múltiplas cotações em paralelo
    async getMultipleQuotes(assets) {
        const promises = assets.map(asset =>
            this.getQuote(asset.symbol, asset.type).then(quote => ({
                symbol: asset.symbol,
                ...quote
            }))
        );

        try {
            const results = await Promise.allSettled(promises);
            return results.map((result, index) => ({
                symbol: assets[index].symbol,
                success: result.status === 'fulfilled',
                data: result.status === 'fulfilled' ? result.value : null,
                error: result.status === 'rejected' ? result.reason.message : null
            }));
        } catch (error) {
            console.error('Erro ao buscar cotações múltiplas:', error);
            return [];
        }
    }

    // Ações brasileiras via BRAPI (gratuita)
    async getBrazilianStock(symbol) {
        const url = `https://brapi.dev/api/quote/${symbol}?token=demo`;

        const response = await this.fetchWithRetry(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const stock = data.results[0];
            return {
                symbol: stock.symbol,
                price: stock.regularMarketPrice,
                change: stock.regularMarketChange,
                changePercent: stock.regularMarketChangePercent,
                currency: 'BRL',
                lastUpdate: new Date().toISOString(),
                source: 'BRAPI'
            };
        }

        throw new Error('Dados não encontrados');
    }

    // Ações americanas via Yahoo Finance (alternativa gratuita)
    async getUSStock(symbol) {
        // Usando uma API proxy gratuita para Yahoo Finance
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;

        try {
            const response = await this.fetchWithRetry(url);
            const data = await response.json();

            if (data.chart && data.chart.result && data.chart.result.length > 0) {
                const result = data.chart.result[0];
                const meta = result.meta;
                const currentPrice = meta.regularMarketPrice;
                const previousClose = meta.previousClose;
                const change = currentPrice - previousClose;
                const changePercent = (change / previousClose) * 100;

                // Converter para BRL (aproximadamente)
                const usdToBrl = 5.52; // Valor aproximado

                return {
                    symbol: symbol,
                    price: currentPrice * usdToBrl,
                    change: change * usdToBrl,
                    changePercent: changePercent,
                    currency: 'BRL',
                    originalPrice: currentPrice,
                    originalCurrency: 'USD',
                    lastUpdate: new Date().toISOString(),
                    source: 'Yahoo Finance'
                };
            }
        } catch (error) {
            // Se falhar, usar API alternativa ou dados mock
            console.warn(`Erro ao buscar ${symbol} via Yahoo:`, error);
        }

        throw new Error('Dados não encontrados');
    }

    // Criptomoedas via CoinGecko (gratuita)
    async getCrypto(symbol) {
        const cryptoMap = {
            'BTC': 'bitcoin',
            'ETH': 'ethereum',
            'BNB': 'binancecoin',
            'ADA': 'cardano',
            'SOL': 'solana',
            'XRP': 'ripple'
        };

        const coinId = cryptoMap[symbol.toUpperCase()];
        if (!coinId) {
            throw new Error('Criptomoeda não suportada');
        }

        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=brl&include_24hr_change=true&include_last_updated_at=true`;

        const response = await this.fetchWithRetry(url);
        const data = await response.json();

        if (data[coinId]) {
            const crypto = data[coinId];
            return {
                symbol: symbol.toUpperCase(),
                price: crypto.brl,
                change: crypto.brl * (crypto.brl_24h_change / 100),
                changePercent: crypto.brl_24h_change,
                currency: 'BRL',
                lastUpdate: new Date(crypto.last_updated_at * 1000).toISOString(),
                source: 'CoinGecko'
            };
        }

        throw new Error('Dados não encontrados');
    }

    // Moedas via ExchangeRate API (gratuita)
    async getCurrency(symbol) {
        const currencyMap = {
            'USD': 'USD',
            'EUR': 'EUR',
            'GBP': 'GBP',
            'JPY': 'JPY'
        };

        const currency = currencyMap[symbol.toUpperCase()];
        if (!currency) {
            throw new Error('Moeda não suportada');
        }

        const url = `https://api.exchangerate-api.com/v4/latest/BRL`;

        const response = await this.fetchWithRetry(url);
        const data = await response.json();

        if (data.rates && data.rates[currency]) {
            const rate = 1 / data.rates[currency]; // Inverter para ter BRL por unidade da moeda

            return {
                symbol: symbol.toUpperCase(),
                price: rate,
                change: 0, // API não fornece mudança histórica
                changePercent: 0,
                currency: 'BRL',
                lastUpdate: new Date().toISOString(),
                source: 'ExchangeRate API'
            };
        }

        throw new Error('Dados não encontrados');
    }

    // Dados de fallback em caso de erro nas APIs
    getFallbackQuote(symbol, type) {
        const fallbackPrices = {
            // Ações BR
            'PETR4': { price: 38.45, change: 1.25, changePercent: 3.36 },
            'VALE3': { price: 62.15, change: 3.25, changePercent: 5.52 },
            'ITUB4': { price: 33.25, change: 1.45, changePercent: 4.56 },
            'BBAS3': { price: 26.80, change: 2.30, changePercent: 9.40 },
            'BBDC4': { price: 13.85, change: -0.15, changePercent: -1.07 },
            'WEGE3': { price: 45.75, change: 3.45, changePercent: 8.15 },

            // Ações US (em BRL)
            'AAPL': { price: 962.50, change: 82.50, changePercent: 9.38 },
            'MSFT': { price: 2475.00, change: 165.00, changePercent: 7.14 },
            'GOOGL': { price: 907.50, change: 82.50, changePercent: 10.00 },

            // Crypto (em BRL)
            'BTC': { price: 525000, change: 45000, changePercent: 9.38 },
            'ETH': { price: 20350, change: 1650, changePercent: 8.82 },
            'BNB': { price: 4015, change: 215, changePercent: 5.66 },

            // Moedas
            'USD': { price: 5.52, change: -0.28, changePercent: -4.83 },
            'EUR': { price: 5.75, change: -0.45, changePercent: -7.26 },
            'GBP': { price: 6.82, change: -0.23, changePercent: -3.26 },

            // FIIs
            'HGLG11': { price: 108.90, change: 6.40, changePercent: 6.24 },
            'XPML11': { price: 98.75, change: 3.55, changePercent: 3.73 },
            'KNRI11': { price: 92.15, change: 3.75, changePercent: 4.24 }
        };

        const fallback = fallbackPrices[symbol] || {
            price: 100,
            change: 0,
            changePercent: 0
        };

        return {
            symbol: symbol,
            price: fallback.price,
            change: fallback.change,
            changePercent: fallback.changePercent,
            currency: 'BRL',
            lastUpdate: new Date().toISOString(),
            source: 'Fallback Data',
            isFallback: true
        };
    }

    // Fetch com retry para APIs instáveis
    async fetchWithRetry(url, attempts = this.retryAttempts) {
        for (let i = 0; i < attempts; i++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

                const response = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Financial Control App',
                        'Accept': 'application/json'
                    }
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response;
            } catch (error) {
                console.warn(`Tentativa ${i + 1} falhou para ${url}:`, error.message);

                if (i === attempts - 1) {
                    throw error;
                }

                // Aguardar antes de tentar novamente
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }

    // Limpar cache
    clearCache() {
        this.cache.clear();
    }

    // Verificar status das APIs
    async checkAPIStatus() {
        const apis = [
            { name: 'BRAPI', url: 'https://brapi.dev/api/quote/PETR4' },
            { name: 'CoinGecko', url: 'https://api.coingecko.com/api/v3/ping' },
            { name: 'ExchangeRate', url: 'https://api.exchangerate-api.com/v4/latest/USD' }
        ];

        const results = [];

        for (const api of apis) {
            try {
                const start = Date.now();
                await this.fetchWithRetry(api.url, 1);
                const responseTime = Date.now() - start;

                results.push({
                    name: api.name,
                    status: 'online',
                    responseTime: responseTime
                });
            } catch (error) {
                results.push({
                    name: api.name,
                    status: 'offline',
                    error: error.message
                });
            }
        }

        return results;
    }
}

// Instância global do serviço
window.quotesService = new QuotesService();

// Export para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuotesService;
}