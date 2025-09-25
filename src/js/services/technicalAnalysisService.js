class TechnicalAnalysisService {
    constructor() {
        this.cache = new Map();
        this.cacheDuration = 5 * 60 * 1000;
    }

    calculateSMA(prices, period) {
        if (prices.length < period) return null;

        const sma = [];
        for (let i = period - 1; i < prices.length; i++) {
            const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            sma.push(sum / period);
        }
        return sma;
    }

    calculateEMA(prices, period) {
        if (prices.length < period) return null;

        const multiplier = 2 / (period + 1);
        const ema = [prices[0]];

        for (let i = 1; i < prices.length; i++) {
            const value = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier));
            ema.push(value);
        }

        return ema;
    }

    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return null;

        const changes = [];
        for (let i = 1; i < prices.length; i++) {
            changes.push(prices[i] - prices[i - 1]);
        }

        const gains = changes.map(change => change > 0 ? change : 0);
        const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);

        const avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
        const avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;

        const rsi = [100 - (100 / (1 + (avgGain / avgLoss)))];

        for (let i = period; i < changes.length; i++) {
            const currentGain = gains[i];
            const currentLoss = losses[i];

            const newAvgGain = ((avgGain * (period - 1)) + currentGain) / period;
            const newAvgLoss = ((avgLoss * (period - 1)) + currentLoss) / period;

            const rs = newAvgGain / newAvgLoss;
            rsi.push(100 - (100 / (1 + rs)));
        }

        return rsi;
    }

    calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        const fastEMA = this.calculateEMA(prices, fastPeriod);
        const slowEMA = this.calculateEMA(prices, slowPeriod);

        if (!fastEMA || !slowEMA) return null;

        const macdLine = [];
        const startIndex = slowPeriod - fastPeriod;

        for (let i = startIndex; i < fastEMA.length; i++) {
            macdLine.push(fastEMA[i] - slowEMA[i - startIndex]);
        }

        const signalLine = this.calculateEMA(macdLine, signalPeriod);
        const histogram = [];

        if (signalLine) {
            const signalStartIndex = signalPeriod - 1;
            for (let i = signalStartIndex; i < macdLine.length; i++) {
                histogram.push(macdLine[i] - signalLine[i - signalStartIndex]);
            }
        }

        return {
            macd: macdLine,
            signal: signalLine || [],
            histogram: histogram
        };
    }

    calculateBollingerBands(prices, period = 20, multiplier = 2) {
        const sma = this.calculateSMA(prices, period);
        if (!sma) return null;

        const upperBand = [];
        const lowerBand = [];

        for (let i = period - 1; i < prices.length; i++) {
            const slice = prices.slice(i - period + 1, i + 1);
            const mean = sma[i - period + 1];
            const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
            const stdDev = Math.sqrt(variance);

            upperBand.push(mean + (stdDev * multiplier));
            lowerBand.push(mean - (stdDev * multiplier));
        }

        return {
            middle: sma,
            upper: upperBand,
            lower: lowerBand
        };
    }

    async getHistoricalPrices(symbol, days = 90) {
        const cacheKey = `historical_${symbol}_${days}`;
        const cached = this.cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }

        try {
            const response = await fetch(`https://brapi.dev/api/quote/${symbol}?range=${days}d&interval=1d`);
            const data = await response.json();

            if (data.results && data.results[0] && data.results[0].historicalDataPrice) {
                const prices = data.results[0].historicalDataPrice.map(item => item.close);

                this.cache.set(cacheKey, {
                    data: prices,
                    timestamp: Date.now()
                });

                return prices;
            }
        } catch (error) {
            console.error('Error fetching historical data:', error);
        }

        return this.generateMockPrices(symbol, days);
    }

    generateMockPrices(symbol, days) {
        const basePrice = this.getBasePrice(symbol);
        const prices = [];
        let currentPrice = basePrice;

        for (let i = 0; i < days; i++) {
            const change = (Math.random() - 0.5) * 0.05;
            currentPrice *= (1 + change);
            prices.push(parseFloat(currentPrice.toFixed(2)));
        }

        return prices;
    }

    getBasePrice(symbol) {
        const basePrices = {
            'PETR4': 38.45,
            'VALE3': 62.15,
            'ITUB4': 31.25,
            'BBDC4': 14.85,
            'ABEV3': 11.20,
            'BBAS3': 26.80,
            'WEGE3': 47.90,
            'MGLU3': 5.45,
            'BTOW3': 8.75,
            'LREN3': 17.20,
            'BTC-USD': 95000,
            'ETH-USD': 3400,
            'ADA-USD': 0.85,
            'DOT-USD': 7.20,
            'SOL-USD': 180
        };

        return basePrices[symbol] || 50;
    }

    async getAnalysis(symbol) {
        const prices = await this.getHistoricalPrices(symbol);

        if (!prices || prices.length < 30) {
            return null;
        }

        const sma20 = this.calculateSMA(prices, 20);
        const sma50 = this.calculateSMA(prices, 50);
        const ema12 = this.calculateEMA(prices, 12);
        const rsi = this.calculateRSI(prices, 14);
        const macd = this.calculateMACD(prices);
        const bollinger = this.calculateBollingerBands(prices);

        const currentPrice = prices[prices.length - 1];
        const analysis = this.generateSignals(currentPrice, sma20, sma50, ema12, rsi, macd, bollinger);

        return {
            symbol,
            currentPrice,
            indicators: {
                sma20: sma20 ? sma20[sma20.length - 1] : null,
                sma50: sma50 ? sma50[sma50.length - 1] : null,
                ema12: ema12 ? ema12[ema12.length - 1] : null,
                rsi: rsi ? rsi[rsi.length - 1] : null,
                macd: macd ? {
                    macd: macd.macd[macd.macd.length - 1],
                    signal: macd.signal[macd.signal.length - 1] || null,
                    histogram: macd.histogram[macd.histogram.length - 1] || null
                } : null,
                bollinger: bollinger ? {
                    upper: bollinger.upper[bollinger.upper.length - 1],
                    middle: bollinger.middle[bollinger.middle.length - 1],
                    lower: bollinger.lower[bollinger.lower.length - 1]
                } : null
            },
            signals: analysis.signals,
            trend: analysis.trend,
            score: analysis.score
        };
    }

    generateSignals(currentPrice, sma20, sma50, ema12, rsi, macd, bollinger) {
        const signals = [];
        let bullishSignals = 0;
        let bearishSignals = 0;

        if (sma20 && sma50) {
            const currentSMA20 = sma20[sma20.length - 1];
            const currentSMA50 = sma50[sma50.length - 1];

            if (currentPrice > currentSMA20 && currentSMA20 > currentSMA50) {
                signals.push({ type: 'bullish', indicator: 'SMA', message: 'Preço acima das médias móveis (tendência de alta)' });
                bullishSignals++;
            } else if (currentPrice < currentSMA20 && currentSMA20 < currentSMA50) {
                signals.push({ type: 'bearish', indicator: 'SMA', message: 'Preço abaixo das médias móveis (tendência de baixa)' });
                bearishSignals++;
            }
        }

        if (rsi) {
            const currentRSI = rsi[rsi.length - 1];

            if (currentRSI > 70) {
                signals.push({ type: 'bearish', indicator: 'RSI', message: `RSI sobrecomprado (${currentRSI.toFixed(1)})` });
                bearishSignals++;
            } else if (currentRSI < 30) {
                signals.push({ type: 'bullish', indicator: 'RSI', message: `RSI sobrevendido (${currentRSI.toFixed(1)})` });
                bullishSignals++;
            }
        }

        if (macd && macd.macd.length > 1 && macd.signal.length > 1) {
            const currentMACD = macd.macd[macd.macd.length - 1];
            const previousMACD = macd.macd[macd.macd.length - 2];
            const currentSignal = macd.signal[macd.signal.length - 1];
            const previousSignal = macd.signal[macd.signal.length - 2];

            if (previousMACD < previousSignal && currentMACD > currentSignal) {
                signals.push({ type: 'bullish', indicator: 'MACD', message: 'MACD cruzou acima da linha de sinal' });
                bullishSignals++;
            } else if (previousMACD > previousSignal && currentMACD < currentSignal) {
                signals.push({ type: 'bearish', indicator: 'MACD', message: 'MACD cruzou abaixo da linha de sinal' });
                bearishSignals++;
            }
        }

        if (bollinger) {
            const upper = bollinger.upper[bollinger.upper.length - 1];
            const lower = bollinger.lower[bollinger.lower.length - 1];

            if (currentPrice > upper) {
                signals.push({ type: 'bearish', indicator: 'Bollinger', message: 'Preço acima da banda superior (possível reversão)' });
                bearishSignals++;
            } else if (currentPrice < lower) {
                signals.push({ type: 'bullish', indicator: 'Bollinger', message: 'Preço abaixo da banda inferior (possível reversão)' });
                bullishSignals++;
            }
        }

        const totalSignals = bullishSignals + bearishSignals;
        const score = totalSignals > 0 ? ((bullishSignals - bearishSignals) / totalSignals) : 0;

        let trend = 'neutro';
        if (score > 0.3) trend = 'alta';
        else if (score < -0.3) trend = 'baixa';

        return {
            signals,
            trend,
            score: Math.round(score * 100)
        };
    }

    formatAnalysisForDisplay(analysis) {
        if (!analysis) return null;

        const { indicators, signals, trend, score } = analysis;

        return {
            summary: {
                trend: trend,
                score: score,
                recommendation: this.getRecommendation(score)
            },
            indicators: {
                rsi: indicators.rsi ? {
                    value: indicators.rsi.toFixed(1),
                    status: indicators.rsi > 70 ? 'sobrecomprado' : indicators.rsi < 30 ? 'sobrevendido' : 'normal'
                } : null,
                sma: {
                    sma20: indicators.sma20 ? indicators.sma20.toFixed(2) : null,
                    sma50: indicators.sma50 ? indicators.sma50.toFixed(2) : null
                },
                macd: indicators.macd ? {
                    value: indicators.macd.macd?.toFixed(4),
                    signal: indicators.macd.signal?.toFixed(4),
                    histogram: indicators.macd.histogram?.toFixed(4)
                } : null
            },
            signals: signals.map(signal => ({
                ...signal,
                color: signal.type === 'bullish' ? 'text-green-600' : 'text-red-600',
                icon: signal.type === 'bullish' ? '📈' : '📉'
            }))
        };
    }

    getRecommendation(score) {
        if (score > 50) return 'Compra Forte';
        if (score > 20) return 'Compra';
        if (score > -20) return 'Neutro';
        if (score > -50) return 'Venda';
        return 'Venda Forte';
    }
}

window.technicalAnalysisService = new TechnicalAnalysisService();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TechnicalAnalysisService;
}