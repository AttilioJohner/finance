class TechnicalAnalysisComponent {
    constructor() {
        this.analyses = new Map();
        this.selectedAsset = null;
        this.charts = new Map();
        this.isVisible = false;
        this.init();
    }

    init() {
        this.createAnalysisModal();
        this.setupEventListeners();
    }

    createAnalysisModal() {
        const modal = document.createElement('div');
        modal.id = 'technicalAnalysisModal';
        modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                        📊 Análise Técnica
                    </h2>
                    <button id="closeTechnicalAnalysis" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <!-- Asset Selection -->
                    <div class="mb-6">
                        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Selecionar Ativo
                        </label>
                        <select id="assetSelector" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            <option value="">Selecione um ativo...</option>
                        </select>
                    </div>

                    <!-- Loading State -->
                    <div id="analysisLoading" class="hidden text-center py-12">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                        <p class="text-gray-600 dark:text-gray-400">Calculando análise técnica...</p>
                    </div>

                    <!-- Analysis Content -->
                    <div id="analysisContent" class="hidden">
                        <!-- Summary Cards -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div class="card">
                                <div class="card-body text-center">
                                    <div class="text-2xl font-bold mb-2" id="trendIndicator">-</div>
                                    <div class="text-sm text-gray-600 dark:text-gray-400">Tendência</div>
                                </div>
                            </div>
                            <div class="card">
                                <div class="card-body text-center">
                                    <div class="text-2xl font-bold mb-2" id="scoreIndicator">-</div>
                                    <div class="text-sm text-gray-600 dark:text-gray-400">Score Técnico</div>
                                </div>
                            </div>
                            <div class="card">
                                <div class="card-body text-center">
                                    <div class="text-2xl font-bold mb-2" id="recommendationIndicator">-</div>
                                    <div class="text-sm text-gray-600 dark:text-gray-400">Recomendação</div>
                                </div>
                            </div>
                        </div>

                        <!-- Technical Indicators -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            <!-- Price Chart -->
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">📈 Gráfico de Preços</h3>
                                </div>
                                <div class="card-body">
                                    <canvas id="priceChart" width="400" height="250"></canvas>
                                </div>
                            </div>

                            <!-- RSI Chart -->
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">⚡ RSI (14)</h3>
                                </div>
                                <div class="card-body">
                                    <canvas id="rsiChart" width="400" height="250"></canvas>
                                </div>
                            </div>

                            <!-- MACD Chart -->
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">📊 MACD</h3>
                                </div>
                                <div class="card-body">
                                    <canvas id="macdChart" width="400" height="250"></canvas>
                                </div>
                            </div>

                            <!-- Indicators Summary -->
                            <div class="card">
                                <div class="card-header">
                                    <h3 class="card-title">📋 Indicadores</h3>
                                </div>
                                <div class="card-body" id="indicatorsSummary">
                                    <div class="space-y-3">
                                        <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                            <span class="text-sm font-medium">RSI (14)</span>
                                            <span id="rsiValue" class="text-sm">-</span>
                                        </div>
                                        <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                            <span class="text-sm font-medium">SMA (20)</span>
                                            <span id="sma20Value" class="text-sm">-</span>
                                        </div>
                                        <div class="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                                            <span class="text-sm font-medium">SMA (50)</span>
                                            <span id="sma50Value" class="text-sm">-</span>
                                        </div>
                                        <div class="flex justify-between items-center py-2">
                                            <span class="text-sm font-medium">MACD</span>
                                            <span id="macdValue" class="text-sm">-</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Signals -->
                        <div class="card">
                            <div class="card-header">
                                <h3 class="card-title">🎯 Sinais de Trading</h3>
                            </div>
                            <div class="card-body">
                                <div id="tradingSignals" class="space-y-3">
                                    <p class="text-gray-600 dark:text-gray-400 text-center">Nenhum sinal disponível</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    setupEventListeners() {
        document.getElementById('closeTechnicalAnalysis')?.addEventListener('click', () => {
            this.hide();
        });

        document.getElementById('technicalAnalysisModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'technicalAnalysisModal') {
                this.hide();
            }
        });

        document.getElementById('assetSelector')?.addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadAnalysis(e.target.value);
            }
        });
    }

    async show() {
        this.isVisible = true;
        document.getElementById('technicalAnalysisModal').classList.remove('hidden');

        await this.loadAssetsList();
    }

    hide() {
        this.isVisible = false;
        document.getElementById('technicalAnalysisModal').classList.add('hidden');
        this.destroyCharts();
    }

    async loadAssetsList() {
        const selector = document.getElementById('assetSelector');
        const portfolio = JSON.parse(localStorage.getItem('portfolio') || '[]');

        selector.innerHTML = '<option value="">Selecione um ativo...</option>';

        portfolio.forEach(asset => {
            const option = document.createElement('option');
            option.value = asset.symbol;
            option.textContent = `${asset.symbol} - ${asset.name}`;
            selector.appendChild(option);
        });

        const cryptoAssets = ['BTC-USD', 'ETH-USD', 'ADA-USD', 'DOT-USD', 'SOL-USD'];
        cryptoAssets.forEach(symbol => {
            const option = document.createElement('option');
            option.value = symbol;
            option.textContent = symbol.replace('-USD', '') + ' (Crypto)';
            selector.appendChild(option);
        });
    }

    async loadAnalysis(symbol) {
        this.selectedAsset = symbol;

        document.getElementById('analysisLoading').classList.remove('hidden');
        document.getElementById('analysisContent').classList.add('hidden');

        try {
            const analysis = await window.technicalAnalysisService.getAnalysis(symbol);

            if (analysis) {
                this.analyses.set(symbol, analysis);
                this.displayAnalysis(analysis);
            } else {
                this.showError('Não foi possível calcular a análise técnica para este ativo');
            }
        } catch (error) {
            console.error('Error loading technical analysis:', error);
            this.showError('Erro ao carregar análise técnica');
        }

        document.getElementById('analysisLoading').classList.add('hidden');
    }

    displayAnalysis(analysis) {
        const formatted = window.technicalAnalysisService.formatAnalysisForDisplay(analysis);

        this.updateSummaryCards(formatted.summary);
        this.updateIndicators(formatted.indicators);
        this.updateSignals(formatted.signals);
        this.createCharts(analysis);

        document.getElementById('analysisContent').classList.remove('hidden');
    }

    updateSummaryCards(summary) {
        const trendColors = {
            'alta': 'text-green-600 dark:text-green-400',
            'baixa': 'text-red-600 dark:text-red-400',
            'neutro': 'text-gray-600 dark:text-gray-400'
        };

        document.getElementById('trendIndicator').textContent = summary.trend.toUpperCase();
        document.getElementById('trendIndicator').className = `text-2xl font-bold mb-2 ${trendColors[summary.trend]}`;

        document.getElementById('scoreIndicator').textContent = `${summary.score}%`;
        document.getElementById('scoreIndicator').className = `text-2xl font-bold mb-2 ${summary.score > 0 ? 'text-green-600 dark:text-green-400' : summary.score < 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`;

        document.getElementById('recommendationIndicator').textContent = summary.recommendation;
        document.getElementById('recommendationIndicator').className = `text-2xl font-bold mb-2 ${summary.recommendation.includes('Compra') ? 'text-green-600 dark:text-green-400' : summary.recommendation.includes('Venda') ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`;
    }

    updateIndicators(indicators) {
        document.getElementById('rsiValue').textContent = indicators.rsi ?
            `${indicators.rsi.value} (${indicators.rsi.status})` : 'N/A';

        document.getElementById('sma20Value').textContent = indicators.sma.sma20 || 'N/A';
        document.getElementById('sma50Value').textContent = indicators.sma.sma50 || 'N/A';

        document.getElementById('macdValue').textContent = indicators.macd?.value || 'N/A';
    }

    updateSignals(signals) {
        const container = document.getElementById('tradingSignals');

        if (signals.length === 0) {
            container.innerHTML = '<p class="text-gray-600 dark:text-gray-400 text-center">Nenhum sinal identificado</p>';
            return;
        }

        container.innerHTML = signals.map(signal => `
            <div class="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                <span class="text-2xl">${signal.icon}</span>
                <div class="flex-1">
                    <div class="font-medium ${signal.color}">${signal.indicator}</div>
                    <div class="text-sm text-gray-600 dark:text-gray-400">${signal.message}</div>
                </div>
            </div>
        `).join('');
    }

    async createCharts(analysis) {
        this.destroyCharts();

        const prices = await window.technicalAnalysisService.getHistoricalPrices(analysis.symbol);
        if (!prices) return;

        const labels = prices.map((_, i) => i + 1);

        this.createPriceChart(labels, prices, analysis);
        this.createRSIChart(labels, prices);
        this.createMACDChart(labels, prices);
    }

    createPriceChart(labels, prices, analysis) {
        const ctx = document.getElementById('priceChart').getContext('2d');

        const sma20 = window.technicalAnalysisService.calculateSMA(prices, 20);
        const sma50 = window.technicalAnalysisService.calculateSMA(prices, 50);
        const bollinger = window.technicalAnalysisService.calculateBollingerBands(prices);

        const datasets = [
            {
                label: 'Preço',
                data: prices,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                fill: false
            }
        ];

        if (sma20) {
            datasets.push({
                label: 'SMA 20',
                data: [...Array(19).fill(null), ...sma20],
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
            });
        }

        if (sma50) {
            datasets.push({
                label: 'SMA 50',
                data: [...Array(49).fill(null), ...sma50],
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
            });
        }

        if (bollinger) {
            datasets.push({
                label: 'Bollinger Superior',
                data: [...Array(19).fill(null), ...bollinger.upper],
                borderColor: 'rgba(156, 163, 175, 0.5)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0,
                borderDash: [5, 5]
            });

            datasets.push({
                label: 'Bollinger Inferior',
                data: [...Array(19).fill(null), ...bollinger.lower],
                borderColor: 'rgba(156, 163, 175, 0.5)',
                borderWidth: 1,
                fill: false,
                pointRadius: 0,
                borderDash: [5, 5]
            });
        }

        this.charts.set('price', new Chart(ctx, {
            type: 'line',
            data: { labels, datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: { beginAtZero: false }
                },
                elements: {
                    point: { radius: 1 }
                }
            }
        }));
    }

    createRSIChart(labels, prices) {
        const rsi = window.technicalAnalysisService.calculateRSI(prices, 14);
        if (!rsi) return;

        const ctx = document.getElementById('rsiChart').getContext('2d');

        this.charts.set('rsi', new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.slice(14),
                datasets: [
                    {
                        label: 'RSI',
                        data: rsi,
                        borderColor: 'rgb(168, 85, 247)',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        borderWidth: 2,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        grid: {
                            color: function(context) {
                                if (context.tick.value === 70 || context.tick.value === 30) {
                                    return 'rgba(239, 68, 68, 0.5)';
                                }
                                return 'rgba(156, 163, 175, 0.1)';
                            }
                        }
                    }
                },
                elements: {
                    point: { radius: 1 }
                }
            }
        }));
    }

    createMACDChart(labels, prices) {
        const macd = window.technicalAnalysisService.calculateMACD(prices);
        if (!macd) return;

        const ctx = document.getElementById('macdChart').getContext('2d');
        const macdLabels = labels.slice(26);

        this.charts.set('macd', new Chart(ctx, {
            type: 'bar',
            data: {
                labels: macdLabels,
                datasets: [
                    {
                        label: 'MACD',
                        data: macd.macd,
                        type: 'line',
                        borderColor: 'rgb(59, 130, 246)',
                        borderWidth: 2,
                        fill: false,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Signal',
                        data: [...Array(8).fill(null), ...macd.signal],
                        type: 'line',
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 1,
                        fill: false,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Histogram',
                        data: [...Array(8).fill(null), ...macd.histogram],
                        backgroundColor: function(context) {
                            const value = context.parsed.y;
                            return value >= 0 ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)';
                        },
                        borderColor: function(context) {
                            const value = context.parsed.y;
                            return value >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
                        },
                        borderWidth: 1,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: 'top' }
                },
                scales: {
                    y: { position: 'left' }
                },
                elements: {
                    point: { radius: 0 }
                }
            }
        }));
    }

    destroyCharts() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }

    showError(message) {
        document.getElementById('analysisContent').innerHTML = `
            <div class="text-center py-12">
                <div class="text-red-500 mb-4">
                    <svg class="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>
                <p class="text-gray-600 dark:text-gray-400">${message}</p>
            </div>
        `;
        document.getElementById('analysisContent').classList.remove('hidden');
    }
}

window.technicalAnalysisComponent = new TechnicalAnalysisComponent();